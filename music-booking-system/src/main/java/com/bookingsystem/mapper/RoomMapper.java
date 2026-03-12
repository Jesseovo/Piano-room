package com.bookingsystem.mapper;

import com.bookingsystem.dto.RoomQueryDTO;
import com.bookingsystem.dto.RoomTypeUsageDTO;
import com.bookingsystem.dto.RoomUsageSummaryDTO;
import com.bookingsystem.pojo.Room;
import com.bookingsystem.pojo.RoomMaintenance;
import com.bookingsystem.vo.HotRoomVO;
import com.bookingsystem.vo.RoomQueryVO;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface RoomMapper {
    List<RoomQueryVO> list(RoomQueryDTO roomQueryDTO);

    void save(Room room);

    @Delete("delete from rooms where id = #{id}")
    void deleteById(Long id);

    Room getById(Long id);

    @Update("update rooms set room_number = #{roomNumber}, name = #{name}, floor = #{floor}, status = #{status}, capacity = #{capacity}, room_type_id = #{roomTypeId}, facilities = #{facilities}, description = #{description}, updated_at = #{updatedAt} where id = #{id}")
    void update(Room room);

    /**
     * 只更新琴房状态
     */
    @Update("update rooms set status = #{status}, updated_at = NOW() where id = #{id}")
    void updateStatus(@Param("id") Long id, @Param("status") Integer status);

    @Insert("insert into room_maintenance (room_id, start_time, end_time, reason, maintenance_type, created_at, updated_at) " +
            "values (#{roomId}, #{startTime}, #{endTime}, #{reason}, #{maintenanceType}, #{createdAt}, #{updatedAt})")
    void maintenance(RoomMaintenance roomMaintenance);

    /**
     * 获取可用教室信息
     * @return
     */
    @Select("SELECT * FROM rooms WHERE status = 1")
    List<Room> selectAvailableClassrooms();

    /**
     * 获取教室维护信息
     * @param roomId
     * @return
     */
    @Select("SELECT * FROM room_maintenance WHERE room_id = #{roomId} order by updated_at desc ")
    List<RoomMaintenance> getMaintenance(Long roomId);

    void upsertMaintenanceRecord(RoomMaintenance roomMaintenance);

    @Select("SELECT COUNT(*) FROM rooms")
    int getAllRoom();


    /**
     * 设置教室状态
     */
    @Update("update rooms set status = #{status} where id = #{id}")
    void setStatus(@Param("status") Integer status, @Param("id") Long id);


    @Select("SELECT * FROM room_maintenance")
    List<RoomMaintenance> getAllMaintenance();

    List<RoomQueryVO> searchRooms(Long buildingId, Long roomTypeId,Long departmentId, Integer minCapacity, Integer maxCapacity, LocalDateTime startTime, LocalDateTime endTime);

    @Select("SELECT\n" +
            "    SUM(CASE WHEN r.id IN (\n" +
            "        SELECT DISTINCT res.room_id\n" +
            "        FROM reservations res\n" +
            "        WHERE res.status = 'approved'\n" +
            "          AND res.start_time <= #{endTime}\n" +
            "          AND res.end_time >= #{startTime}\n" +
            "    ) THEN 1 ELSE 0 END) AS occupied_count,\n" +
            "    \n" +
            "    SUM(CASE WHEN r.id NOT IN (\n" +
            "        SELECT DISTINCT res.room_id\n" +
            "        FROM reservations res\n" +
            "        WHERE res.status = 'approved'\n" +
            "          AND res.start_time <= #{endTime}\n" +
            "          AND res.end_time >= #{startTime}\n" +
            "    ) THEN 1 ELSE 0 END) AS free_count\n" +
            "\n" +
            "FROM rooms r\n" +
            "WHERE r.status = 1;\n")
    RoomUsageSummaryDTO getRoomUsageSummary(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    List<RoomTypeUsageDTO> getRoomTypeUsageStats(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    List<HotRoomVO> getTodayHotRooms(int limit);
}
