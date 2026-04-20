package com.bookingsystem.service;

import com.bookingsystem.exception.BusinessException;
import com.bookingsystem.mapper.ReservationMapper;
import com.bookingsystem.mapper.UserMapper;
import com.bookingsystem.pojo.Reservation;
import com.bookingsystem.pojo.User;
import com.bookingsystem.security.AuthenticatedUser;
import com.bookingsystem.security.CurrentUserHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserMapper userMapper;
    private final ReservationMapper reservationMapper;

    public AuthenticatedUser getCurrentUser() {
        AuthenticatedUser currentUser = CurrentUserHolder.get();
        if (currentUser == null) {
            throw new BusinessException(401, "未登录或 token 已失效");
        }
        return currentUser;
    }

    public void requireRoles(String... allowedRoles) {
        AuthenticatedUser currentUser = getCurrentUser();
        boolean matched = Arrays.stream(allowedRoles)
                .anyMatch(role -> role.equals(currentUser.getUserType()));
        if (!matched) {
            throw new BusinessException(403, "权限不足");
        }
    }

    public void requireAdmin() {
        if (!getCurrentUser().isAdmin()) {
            throw new BusinessException(403, "权限不足");
        }
    }

    public void requireSuperAdmin() {
        if (!getCurrentUser().isSuperAdmin()) {
            throw new BusinessException(403, "仅超级管理员可执行该操作");
        }
    }

    public void requireSelf(Long targetUserId) {
        AuthenticatedUser currentUser = getCurrentUser();
        if (targetUserId == null || !targetUserId.equals(currentUser.getId())) {
            throw new BusinessException(403, "只能操作自己的数据");
        }
    }

    public void requireSelfOrAdmin(Long targetUserId) {
        AuthenticatedUser currentUser = getCurrentUser();
        if (targetUserId != null && targetUserId.equals(currentUser.getId())) {
            return;
        }
        if (!currentUser.isAdmin()) {
            throw new BusinessException(403, "权限不足");
        }
    }

    public void requireCanManageUser(Long targetUserId) {
        AuthenticatedUser currentUser = getCurrentUser();
        if (targetUserId != null && targetUserId.equals(currentUser.getId())) {
            return;
        }

        User targetUser = getRequiredUser(targetUserId);
        if (currentUser.isSuperAdmin()) {
            return;
        }

        if (currentUser.isAdmin() && !isAdminType(targetUser.getUserType())) {
            return;
        }

        throw new BusinessException(403, "权限不足");
    }

    public void requireCanManageCreatedUserType(String targetUserType) {
        AuthenticatedUser currentUser = getCurrentUser();
        String normalizedTargetType = targetUserType == null ? "student" : targetUserType;

        if (currentUser.isSuperAdmin()) {
            return;
        }

        if (currentUser.isAdmin() && !isAdminType(normalizedTargetType)) {
            return;
        }

        throw new BusinessException(403, "权限不足");
    }

    public Reservation requireReservationAccessible(Long reservationId) {
        Reservation reservation = getRequiredReservation(reservationId);
        AuthenticatedUser currentUser = getCurrentUser();
        if (currentUser.isAdmin() || reservation.getUserId().equals(currentUser.getId())) {
            return reservation;
        }
        throw new BusinessException(403, "权限不足");
    }

    public Reservation requireReservationOwner(Long reservationId) {
        Reservation reservation = getRequiredReservation(reservationId);
        AuthenticatedUser currentUser = getCurrentUser();
        if (reservation.getUserId().equals(currentUser.getId())) {
            return reservation;
        }
        throw new BusinessException(403, "只能操作自己的预约");
    }

    public Reservation requireCanAssistStudentReservation(Long reservationId) {
        requireAdmin();
        Reservation reservation = getRequiredReservation(reservationId);
        User targetUser = getRequiredUser(reservation.getUserId());
        if (!"student".equals(targetUser.getUserType())) {
            throw new BusinessException(403, "仅可代学生处理预约");
        }
        return reservation;
    }

    public Reservation getRequiredReservation(Long reservationId) {
        Reservation reservation = reservationMapper.selectReservationsById(reservationId);
        if (reservation == null) {
            throw new BusinessException("预约不存在");
        }
        return reservation;
    }

    public User getRequiredUser(Long userId) {
        User user = userMapper.getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return user;
    }

    public boolean isAdminType(String userType) {
        return "admin".equals(userType) || "super_admin".equals(userType);
    }
}
