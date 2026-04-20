package com.bookingsystem.mapper;

import com.bookingsystem.dto.CountReservationsDTO;
import com.bookingsystem.dto.ReservationQueryDTO;
import com.bookingsystem.pojo.Reservation;
import com.bookingsystem.pojo.Room;
import com.bookingsystem.pojo.TimeSlotReport;
import com.bookingsystem.qo.AvailableRoomQO;
import com.bookingsystem.vo.DayOfWeekCountVO;
import com.bookingsystem.vo.PracticeDurationSummaryVO;
import com.bookingsystem.vo.PracticeDurationVO;
import com.bookingsystem.vo.ReservationCountVO;
import com.bookingsystem.vo.UserReservationStatsVO;
import org.apache.ibatis.annotations.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ReservationMapper.java
@Mapper
public interface ReservationMapper {
    @Select("SELECT r.* FROM reservations r " +
            "WHERE r.room_id = #{roomId} " +
            "AND DATE(r.start_time) = #{date} " +
            "AND r.status IN ('approved', 'completed') " +
            "AND r.sign_end_time IS NULL " +
            "AND (" +
            "  SELECT COALESCE(SUM(r2.attendees), 0) FROM reservations r2 " +
            "  WHERE r2.room_id = r.room_id " +
            "  AND r2.status IN ('approved', 'completed') " +
            "  AND r2.sign_end_time IS NULL " +
            "  AND r2.start_time = r.start_time " +
            "  AND r2.end_time = r.end_time" +
            ") >= (" +
            "  SELECT capacity FROM rooms WHERE id = r.room_id" +
            ")")
    List<Reservation> findReservedSlots(@Param("roomId") Long roomId,
                                        @Param("date") String date);

    @Insert("INSERT INTO reservations(user_id, room_id, title, purpose, " +
            "start_time, end_time, attendees, remarks, status, " +
            "legacy_date, legacy_start_time, legacy_end_time, duration) " +
            "VALUES(#{userId}, #{roomId}, #{title}, #{purpose}, " +
            "#{startTime}, #{endTime}, #{attendees}, #{remarks}, 'approved', " +
            "#{legacyDate}, #{legacyStartTime}, #{legacyEndTime}, #{duration})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int create(Reservation reservation);

    @Select("SELECT COUNT(*) FROM reservations " +
            "WHERE room_id = #{roomId} " +
            "AND status = 'approved' " +
            "AND ((start_time < #{endTime} AND end_time > #{startTime})) " +
            "AND NOT (sign_start_time IS NULL AND TIMESTAMPDIFF(MINUTE, start_time, NOW()) > #{graceMinutes}) " +
            "AND sign_end_time IS NULL")
    int checkConflict(@Param("roomId") Long roomId,
                      @Param("startTime") LocalDateTime startTime,
                      @Param("endTime") LocalDateTime endTime,
                      @Param("graceMinutes") int graceMinutes);

    /**
     * 检查同一用户是否已预约同一房间同一时段
     */
    @Select("SELECT COUNT(*) FROM reservations " +
            "WHERE user_id = #{userId} " +
            "AND room_id = #{roomId} " +
            "AND status = 'approved' " +
            "AND ((start_time < #{endTime} AND end_time > #{startTime})) " +
            "AND sign_end_time IS NULL")
    int checkUserRoomConflict(@Param("userId") Long userId,
                              @Param("roomId") Long roomId,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime);

    /**
     * 查询指定时段已预约的总人数（用于容量检查）
     */
    @Select("SELECT COALESCE(SUM(attendees), 0) FROM reservations " +
            "WHERE room_id = #{roomId} " +
            "AND status = 'approved' " +
            "AND ((start_time < #{endTime} AND end_time > #{startTime})) " +
            "AND NOT (sign_start_time IS NULL AND TIMESTAMPDIFF(MINUTE, start_time, NOW()) > #{graceMinutes}) " +
            "AND sign_end_time IS NULL")
    Integer getReservedAttendees(@Param("roomId") Long roomId,
                                 @Param("startTime") LocalDateTime startTime,
                                 @Param("endTime") LocalDateTime endTime,
                                 @Param("graceMinutes") int graceMinutes);

    /**
     * 悲观锁：查询冲突预约并加行锁，防止高并发超卖
     * 必须在 @Transactional 事务中使用
     */
    @Select("SELECT CASE " +
            "WHEN COALESCE(SUM(attendees), 0) >= (SELECT capacity FROM rooms WHERE id = #{roomId}) " +
            "THEN 1 ELSE 0 END FROM reservations " +
            "WHERE room_id = #{roomId} " +
            "AND status = 'approved' " +
            "AND ((start_time < #{endTime} AND end_time > #{startTime})) " +
            "AND NOT (sign_start_time IS NULL AND TIMESTAMPDIFF(MINUTE, start_time, NOW()) > #{graceMinutes}) " +
            "AND sign_end_time IS NULL " +
            "FOR UPDATE")
    int checkConflictForUpdate(@Param("roomId") Long roomId,
                               @Param("startTime") LocalDateTime startTime,
                               @Param("endTime") LocalDateTime endTime,
                               @Param("graceMinutes") int graceMinutes);

    /**
     * 检查同一用户在同一时间段是否有其他有效预约（已签退或已取消的除外）
     */
    @Select("SELECT COUNT(*) FROM reservations " +
            "WHERE user_id = #{userId} " +
            "AND status = 'approved' " +
            "AND ((start_time < #{endTime} AND end_time > #{startTime})) " +
            "AND sign_end_time IS NULL " +
            "FOR UPDATE")
    int checkUserConflict(@Param("userId") Long userId,
                          @Param("startTime") LocalDateTime startTime,
                          @Param("endTime") LocalDateTime endTime);

    /**
     * 检查用户是否有正在进行中的预约（已签到但未签退，且在指定时间段内）
     * 注意：相邻时间段（如18:00-20:00和20:00-22:00）不视为重叠
     */
    @Select("SELECT COUNT(*) FROM reservations " +
            "WHERE user_id = #{userId} " +
            "AND sign_start_time IS NOT NULL " +
            "AND sign_end_time IS NULL " +
            "AND ((start_time < #{endTime} AND end_time > #{startTime}))")
    int checkUserHasActiveReservation(@Param("userId") Long userId,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime);

    // 查找与时间段冲突且超过宽限时间未签到的预约
    @Select("SELECT * FROM reservations " +
            "WHERE room_id = #{roomId} " +
            "AND status = 'approved' " +
            "AND ((start_time < #{endTime} AND end_time > #{startTime})) " +
            "AND sign_start_time IS NULL " +
            "AND TIMESTAMPDIFF(MINUTE, start_time, NOW()) > #{graceMinutes}")
    List<Reservation> findConflictingUnattendedReservations(
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("graceMinutes") int graceMinutes);

    /**
     * 查找用户在同一时间其他房间的预约（用于签到时取消其他预约）
     */
    @Select("SELECT * FROM reservations " +
            "WHERE user_id = #{userId} " +
            "AND room_id != #{roomId} " +
            "AND status = 'approved' " +
            "AND ((start_time < #{endTime} AND end_time > #{startTime})) " +
            "AND sign_start_time IS NULL " +
            "AND sign_end_time IS NULL")
    List<Reservation> findUserOtherRoomReservations(@Param("userId") Long userId,
                                                     @Param("roomId") Long roomId,
                                                     @Param("startTime") LocalDateTime startTime,
                                                     @Param("endTime") LocalDateTime endTime);


    int countReserve(CountReservationsDTO countReservationsDTO);

    int countUser(CountReservationsDTO countReservationsDTO);

    int countRoom(CountReservationsDTO countReservationsDTO);

    @Select("SELECT * FROM reservations WHERE room_id = #{roomId}")
    List<Reservation> selectReservationsByRoomId(Long roomId);


    List<Room> selectAvailableByRoomTypeAndTimeQuantum(AvailableRoomQO availableRoomQO);

    List<Reservation> list(ReservationQueryDTO reservationQueryDTO);

    Reservation selectReservationsById(@Param("id") Long id);

    Integer update(Reservation reservation);

    @Select("SELECT\n" +
            "    s.status as name,\n" +
            "    COUNT(r.id) AS count\n" +
            "FROM\n" +
            "    (\n" +
            "        SELECT 'pending' AS status\n" +
            "        UNION ALL SELECT 'approved'\n" +
            "        UNION ALL SELECT 'rejected'\n" +
            "        UNION ALL SELECT 'cancelled'\n" +
            "        UNION ALL SELECT 'completed'\n" +
            "        UNION ALL SELECT 'occupied'\n" +
            "    ) AS s\n" +
            "        LEFT JOIN reservations r ON s.status = r.status\n" +
            "GROUP BY s.status\n" +
            "ORDER BY FIELD(s.status, 'pending', 'approved', 'rejected', 'cancelled', 'completed', 'occupied');")
    List<ReservationCountVO> getReservationStatusDistribution();

    @Select("SELECT\n" +
            "    ANY_VALUE(\n" +
            "            CASE DAYOFWEEK(start_time)\n" +
            "                WHEN 1 THEN 'Sunday'\n" +
            "                WHEN 2 THEN 'Monday'\n" +
            "                WHEN 3 THEN 'Tuesday'\n" +
            "                WHEN 4 THEN 'Wednesday'\n" +
            "                WHEN 5 THEN 'Thursday'\n" +
            "                WHEN 6 THEN 'Friday'\n" +
            "                WHEN 7 THEN 'Saturday'\n" +
            "                END\n" +
            "        ) AS dayOfWeek,\n" +
            "    COUNT(*) AS count\n" +
            "FROM reservations\n" +
            "GROUP BY DAYOFWEEK(start_time)\n" +
            "ORDER BY DAYOFWEEK(start_time);")
    List<DayOfWeekCountVO> countReservationsByDayOfWeek();


    @Select("SELECT CONCAT( " +
            "LPAD(hour_start, 2, '0'), ':', LPAD(minute_start, 2, '0'), ' - ', " +
            "LPAD(hour_end, 2, '0'), ':', LPAD(minute_end, 2, '0') " +
            ") AS time_slot, " +
            "COUNT(*) AS reservation_count " +
            "FROM ( " +
            "  SELECT *, " +
            "    HOUR(start_time) AS hour_start, " +
            "    MINUTE(start_time) AS minute_start, " +
            "    HOUR(end_time) AS hour_end, " +
            "    MINUTE(end_time) AS minute_end " +
            "  FROM reservations " +
            "  WHERE start_time >= #{startDateTime} " +
            "  AND end_time <= #{endDateTime} " +
            "  AND status IN ('approved', 'completed', 'occupied') " +
            ") AS subquery " +
            "GROUP BY hour_start, minute_start, hour_end, minute_end " +
            "ORDER BY hour_start, minute_start, hour_end, minute_end")
    List<TimeSlotReport> getReservationCountsByTimeSlot(
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    // 获取已批准且当前时间超过预约结束时间的预约记录
    List<Reservation> getApprovedReservations(LocalDateTime now);

    // 获取超过签到宽限期仍未签到的预约记录
    List<Reservation> getOverdueReservations(@Param("now") LocalDateTime now, @Param("graceMinutes") int graceMinutes);

    // 获取已签到但超过结束时间的预约记录
    List<Reservation> getCompletedReservations(@Param("now") LocalDateTime now);

    UserReservationStatsVO getUserReservationStats(@Param("userId") Long userId);

    /**
     * 查询时长管理列表（联表查询预约、用户、琴房信息）
     */
    List<PracticeDurationVO> listPracticeDuration(ReservationQueryDTO reservationQueryDTO);

    List<PracticeDurationSummaryVO> listPracticeDurationSummary(ReservationQueryDTO reservationQueryDTO);

    /**
     * 统计指定时间范围内的总练琴时长（分钟）
     */
    @Select("SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, sign_start_time, sign_end_time)), 0) " +
            "FROM reservations " +
            "WHERE sign_start_time IS NOT NULL AND sign_end_time IS NOT NULL " +
            "AND sign_start_time >= #{start} AND sign_end_time <= #{end}")
    Integer sumPracticeMinutes(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
