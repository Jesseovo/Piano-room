package com.bookingsystem.service.impl;

import com.bookingsystem.pojo.User;
import com.bookingsystem.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 兼容旧调用方的JWT包装服务。
 */
@Service
public class DynamicJwtService {

    @Autowired
    private JwtUtil jwtUtil;

    public String generateToken(User user) {
        return jwtUtil.generateToken(user);
    }

    public String extractUsername(String token) {
        return jwtUtil.extractUsername(token);
    }

    public Boolean isTokenExpired(String token) {
        return jwtUtil.isTokenExpired(token);
    }

    public Boolean validateToken(String token, User user) {
        return jwtUtil.validateToken(token, user);
    }

    public <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver) {
        return jwtUtil.extractClaim(token, claimsResolver);
    }
}
