package com.bookingsystem.utils;

import com.alibaba.fastjson2.JSON;
import com.bookingsystem.config.InMemoryDataStore;
import com.bookingsystem.pojo.SecuritySetting;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:defaultSecretKeyWhichShouldBeVeryLongForSecurity}")
    private String secret;

    @Autowired
    private InMemoryDataStore inMemoryDataStore;

    // 生成密钥
    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 从token中提取用户名
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 从token中提取过期时间
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 提取指定的claim
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 提取所有claim
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 检查token是否过期
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // 生成token
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    /**
     * 获取token过期时间（毫秒）
     */
    private long getTokenExpirationMs() {
        String setting = inMemoryDataStore.get("securitySetting");
        if (setting != null) {
            try {
                SecuritySetting securitySetting = JSON.parseObject(setting, SecuritySetting.class);
                if (securitySetting != null && securitySetting.getTokenExpireHours() != null) {
                    return (long) securitySetting.getTokenExpireHours() * 60 * 60 * 1000; // 转换为毫秒
                }
            } catch (Exception e) {
                // 解析失败使用默认值
            }
        }
        return 24L * 60 * 60 * 1000; // 默认24小时（毫秒）
    }

    // 创建token
    private String createToken(Map<String, Object> claims, String subject) {
        long expirationMs = getTokenExpirationMs();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 验证token
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}