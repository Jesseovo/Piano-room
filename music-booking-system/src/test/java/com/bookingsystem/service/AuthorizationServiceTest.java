package com.bookingsystem.service;

import com.bookingsystem.exception.BusinessException;
import com.bookingsystem.mapper.ReservationMapper;
import com.bookingsystem.mapper.UserMapper;
import com.bookingsystem.pojo.Reservation;
import com.bookingsystem.pojo.User;
import com.bookingsystem.security.AuthenticatedUser;
import com.bookingsystem.security.CurrentUserHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private ReservationMapper reservationMapper;

    private AuthorizationService authorizationService;

    @BeforeEach
    void setUp() {
        authorizationService = new AuthorizationService(userMapper, reservationMapper);
    }

    @AfterEach
    void tearDown() {
        CurrentUserHolder.clear();
    }

    @Test
    void adminCanManageStudent() {
        CurrentUserHolder.set(new AuthenticatedUser(1L, "admin1", "admin", 1));
        User student = new User().setId(2L).setUserType("student");
        when(userMapper.getById(2L)).thenReturn(student);

        assertDoesNotThrow(() -> authorizationService.requireCanManageUser(2L));
    }

    @Test
    void adminCannotManageAnotherAdmin() {
        CurrentUserHolder.set(new AuthenticatedUser(1L, "admin1", "admin", 1));
        User admin = new User().setId(2L).setUserType("admin");
        when(userMapper.getById(2L)).thenReturn(admin);

        assertThrows(BusinessException.class, () -> authorizationService.requireCanManageUser(2L));
    }

    @Test
    void superAdminCanManageAdmin() {
        CurrentUserHolder.set(new AuthenticatedUser(1L, "root", "super_admin", 1));
        User admin = new User().setId(2L).setUserType("admin");
        when(userMapper.getById(2L)).thenReturn(admin);

        assertDoesNotThrow(() -> authorizationService.requireCanManageUser(2L));
    }

    @Test
    void reservationOwnerCanAccessOwnReservation() {
        CurrentUserHolder.set(new AuthenticatedUser(7L, "student1", "student", 1));
        Reservation reservation = new Reservation();
        reservation.setId(99L);
        reservation.setUserId(7L);
        when(reservationMapper.selectReservationsById(99L)).thenReturn(reservation);

        assertDoesNotThrow(() -> authorizationService.requireReservationAccessible(99L));
    }

    @Test
    void reservationOwnerCheckRejectsOtherStudent() {
        CurrentUserHolder.set(new AuthenticatedUser(7L, "student1", "student", 1));
        Reservation reservation = new Reservation();
        reservation.setId(99L);
        reservation.setUserId(8L);
        when(reservationMapper.selectReservationsById(99L)).thenReturn(reservation);

        assertThrows(BusinessException.class, () -> authorizationService.requireReservationOwner(99L));
    }
}
