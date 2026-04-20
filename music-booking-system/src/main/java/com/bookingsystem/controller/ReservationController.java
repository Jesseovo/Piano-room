package com.bookingsystem.controller;

import com.bookingsystem.annotation.PublicAccess;
import com.bookingsystem.annotation.RequireRoles;
import com.bookingsystem.dto.AvaDTO;
import com.bookingsystem.dto.QuickReservationDTO;
import com.bookingsystem.dto.ReservationDTO;
import com.bookingsystem.dto.ReservationQueryDTO;
import com.bookingsystem.exception.BusinessException;
import com.bookingsystem.mapper.UserMapper;
import com.bookingsystem.pojo.CancelReason;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Reservation;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.pojo.TimeSlot;
import com.bookingsystem.pojo.User;
import com.bookingsystem.qo.AvailableRoomQO;
import com.bookingsystem.security.AuthenticatedUser;
import com.bookingsystem.service.AuthorizationService;
import com.bookingsystem.service.ReservationService;
import com.bookingsystem.vo.PracticeDurationSummaryVO;
import com.bookingsystem.vo.PracticeDurationVO;
import com.bookingsystem.vo.UserReservationStatsVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/reservations")
public class ReservationController {
    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private AuthorizationService authorizationService;

    @PutMapping("/{id}/cancel")
    public Result cancelReservation(@PathVariable Long id, @RequestBody CancelReason cancelReason) {
        Reservation reservation = authorizationService.requireReservationAccessible(id);
        AuthenticatedUser currentUser = authorizationService.getCurrentUser();
        if (currentUser.isAdmin() && !reservation.getUserId().equals(currentUser.getId())) {
            authorizationService.requireCanAssistStudentReservation(id);
        }
        String remark = cancelReason == null ? null : cancelReason.getRemarks();
        log.info("取消预约:{} {}", id, remark);
        return Result.success(reservationService.cancelReservation(id, remark));
    }

    @RequireRoles({"admin", "super_admin"})
    @PutMapping("/{id}/admin-cancel")
    public Result adminCancelReservation(@PathVariable Long id, @RequestBody CancelReason cancelReason) {
        authorizationService.requireCanAssistStudentReservation(id);
        String remark = cancelReason == null ? null : cancelReason.getRemarks();
        log.info("管理员代取消预约:{} {}", id, remark);
        return Result.success(reservationService.adminAssistCancelReservation(id, remark));
    }

    @GetMapping("/list")
    public Result list(ReservationQueryDTO reservationQueryDTO) {
        log.info("查询预约列表:{}", reservationQueryDTO);
        AuthenticatedUser currentUser = authorizationService.getCurrentUser();
        if (!currentUser.isAdmin()) {
            reservationQueryDTO.setUserId(currentUser.getId());
            reservationQueryDTO.setUsername(null);
        }
        return Result.success(reservationService.list(reservationQueryDTO));
    }

    @PublicAccess
    @GetMapping("/availability")
    public Result getAvailability(AvaDTO dto) {
        log.info("获取可用时段:{}", dto);
        List<TimeSlot> lists = reservationService.getRoomAvailability(dto);
        return Result.success(lists);
    }

    @RequireRoles({"admin", "super_admin"})
    @GetMapping("/practiceduration")
    public Result listPracticeDuration(ReservationQueryDTO reservationQueryDTO) {
        log.info("查询时长管理列表:{}", reservationQueryDTO);
        PageResult<PracticeDurationVO> result = reservationService.listPracticeDuration(reservationQueryDTO);
        return Result.success(result);
    }

    @RequireRoles({"admin", "super_admin"})
    @GetMapping("/practiceduration/export")
    public void exportPracticeDuration(ReservationQueryDTO reservationQueryDTO, HttpServletResponse response) throws IOException {
        log.info("导出用户练琴时长汇总:{}", reservationQueryDTO);
        List<PracticeDurationSummaryVO> summaries = reservationService.listPracticeDurationSummary(reservationQueryDTO);
        reservationService.exportPracticeDurationSummary(summaries, response);
    }

    @GetMapping("/{id}")
    public Result getReservationById(@PathVariable Long id) {
        authorizationService.requireReservationAccessible(id);
        return Result.success(reservationService.getReservationById(id));
    }

    @PostMapping
    public Result createReservation(@RequestBody ReservationDTO dto, HttpServletRequest request) {
        try {
            log.info("创建预约:{}", dto);
            String username = (String) request.getAttribute("username");
            if (username == null) {
                throw new BusinessException(401, "未登录");
            }
            User user = userMapper.selectByUsername(username);
            if (user == null) {
                throw new BusinessException(401, "用户不存在");
            }
            return Result.success(reservationService.createReservation(dto, user.getId()));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/quick")
    public Result quickReservation(@RequestBody QuickReservationDTO dto, HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        if (username == null) {
            throw new BusinessException(401, "未登录");
        }
        User user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new BusinessException(401, "用户不存在");
        }
        log.info("快速预约:userId={} roomId={} start={} end={}", user.getId(), dto.getRoomId(), dto.getStartTime(), dto.getEndTime());
        try {
            Reservation reservation = reservationService.quickReservation(dto, user.getId());
            return Result.success(reservation);
        } catch (BusinessException e) {
            return Result.error(e.getMessage());
        }
    }

    @PublicAccess
    @GetMapping("/getAvailableByRoomTypeAndTimeQuantum")
    public Result getAvailableByRoomTypeAndTimeQuantum(AvailableRoomQO availableRoomQO) {
        return Result.success(reservationService.getAvailableByRoomTypeAndTimeQuantum(availableRoomQO));
    }

    @PutMapping("{id}")
    public Result updateReservation(@PathVariable Long id, @RequestBody Reservation reservation) {
        Reservation existingReservation = authorizationService.requireReservationAccessible(id);
        log.info("更新预约:{}", reservation);
        AuthenticatedUser currentUser = authorizationService.getCurrentUser();
        if (!currentUser.isAdmin()) {
            reservation.setUserId(existingReservation.getUserId());
            reservation.setStatus(existingReservation.getStatus());
            reservation.setReviewerId(existingReservation.getReviewerId());
            reservation.setReviewTime(existingReservation.getReviewTime());
            reservation.setReviewRemarks(existingReservation.getReviewRemarks());
            reservation.setSignStartTime(existingReservation.getSignStartTime());
            reservation.setSignEndTime(existingReservation.getSignEndTime());
        }
        reservationService.updateReservation(id, reservation);
        return Result.success();
    }

    @PostMapping("/{id}/sign-in")
    public Result signIn(@PathVariable("id") Long id,
                         @RequestParam(required = false) Double longitude,
                         @RequestParam(required = false) Double latitude) {
        authorizationService.requireReservationOwner(id);
        return reservationService.signIn(id, longitude, latitude);
    }

    @RequireRoles({"admin", "super_admin"})
    @PostMapping("/{id}/admin-sign-in")
    public Result adminSignIn(@PathVariable("id") Long id) {
        authorizationService.requireCanAssistStudentReservation(id);
        return reservationService.adminAssistSignIn(id);
    }

    @PostMapping("/{id}/sign-out")
    public Result signOut(@PathVariable("id") Long id) {
        authorizationService.requireReservationOwner(id);
        return reservationService.signOut(id);
    }

    @RequireRoles({"admin", "super_admin"})
    @PostMapping("/{id}/admin-sign-out")
    public Result adminSignOut(@PathVariable("id") Long id) {
        authorizationService.requireCanAssistStudentReservation(id);
        return reservationService.adminAssistSignOut(id);
    }

    @GetMapping("/userStatistics")
    public Result getUserStats(@RequestParam Long userId) {
        authorizationService.requireSelfOrAdmin(userId);
        UserReservationStatsVO stats = reservationService.getUserReservationStats(userId);
        return Result.success(stats);
    }
}
