package com.bookingsystem.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticatedUser {
    private Long id;
    private String username;
    private String userType;
    private Integer status;

    public boolean isAdmin() {
        return "admin".equals(userType) || isSuperAdmin();
    }

    public boolean isSuperAdmin() {
        return "super_admin".equals(userType);
    }
}
