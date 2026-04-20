package com.bookingsystem.service;

import com.bookingsystem.dto.AvaDTO;
import com.bookingsystem.dto.QuickReservationDTO;
import com.bookingsystem.dto.ReservationDTO;
import com.bookingsystem.dto.ReservationQueryDTO;
import com.bookingsystem.pojo.*;
import com.bookingsystem.qo.AvailableRoomQO;
import com.bookingsystem.vo.PracticeDurationSummaryVO;
import com.bookingsystem.vo.PracticeDurationVO;
import com.bookingsystem.vo.UserReservationStatsVO;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

public interface ReservationService {
    List<TimeSlot> getRoomAvailability(AvaDTO dto);

    // 创建预约
    @Transactional
    Reservation createReservation(ReservationDTO dto, Long userId) throws Exception;

    /**
     * 图书馆式一键快速预约（先到先得，防高并发超卖）
     * @param dto     仅需 roomId / startTime / endTime / remarks
     * @param userId  由 Controller 从 JWT 解析传入
     */
    @Transactional
    Reservation quickReservation(QuickReservationDTO dto, Long userId);

    List<Room> getAvailableByRoomTypeAndTimeQuantum(AvailableRoomQO availableRoomQO);

    /**
     * 预约查询
     * @return
     */
    PageResult<Reservation>list(ReservationQueryDTO reservationQueryDTO);

    Reservation getReservationById(Long id);

    /**
     * 取消预约
     * @param id
     * @param remark
     * @return
     */
    Integer cancelReservation(Long id, String remark);

    Integer adminAssistCancelReservation(Long id, String remark);

    /**
     * 更新预约
     * @param id
     * @param reservation
     */
    void updateReservation(Long id, Reservation reservation);

    UserReservationStatsVO getUserReservationStats(Long userId);

    /**
     * 预约签到：在预约时间内可签到，超过开始时间10分钟会提示超时签到但仍记录签到时间
     * @param reservationId 预约ID
     * @param longitude 用户经度（可选，位置签到用）
     * @param latitude 用户纬度（可选，位置签到用）
     */
    Result signIn(Long reservationId, Double longitude, Double latitude);

    Result adminAssistSignIn(Long reservationId);

    /**
     * 预约签退：校验已签到、未签退、且在预约时间内
     */
    Result signOut(Long reservationId);

    Result adminAssistSignOut(Long reservationId);

    /**
     * 查询时长管理列表
     * @param reservationQueryDTO 查询条件
     * @return 时长管理列表
     */
    PageResult<PracticeDurationVO> listPracticeDuration(ReservationQueryDTO reservationQueryDTO);

    List<PracticeDurationSummaryVO> listPracticeDurationSummary(ReservationQueryDTO reservationQueryDTO);

    void exportPracticeDurationSummary(List<PracticeDurationSummaryVO> summaries, HttpServletResponse response) throws IOException;
}
