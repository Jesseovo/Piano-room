package com.bookingsystem.utils;

import com.alibaba.fastjson2.JSON;
import com.bookingsystem.config.InMemoryDataStore;
import com.bookingsystem.pojo.SecuritySetting;
import com.bookingsystem.pojo.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TOKEN_VERSION = "tokenVersion";

    @Value("${jwt.secret}")
    private String secret;

    @Autowired
    private InMemoryDataStore inMemoryDataStore;

    // 生成密钥
    private Key getSigningKey() {
        Assert.hasText(secret, "JWT_SECRET 未配置，应用无法安全启动");
        Assert.isTrue(secret.length() >= 32, "JWT_SECRET 长度至少需要 32 个字符");
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // 从token中提取用户名
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        Number value = extractClaim(token, claims -> claims.get(CLAIM_USER_ID, Number.class));
        return value == null ? null : value.longValue();
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_ROLE, String.class));
    }

    public Integer extractTokenVersion(String token) {
        Number value = extractClaim(token, claims -> claims.get(CLAIM_TOKEN_VERSION, Number.class));
        return value == null ? 0 : value.intValue();
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
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_USER_ID, user.getId());
        claims.put(CLAIM_ROLE, user.getUserType());
        claims.put(CLAIM_TOKEN_VERSION, user.getTokenVersion() == null ? 0 : user.getTokenVersion());
        return createToken(claims, user.getUsername());
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
    public Boolean validateToken(String token, User user) {
        final String extractedUsername = extractUsername(token);
        final Long extractedUserId = extractUserId(token);
        final String extractedRole = extractRole(token);
        final Integer extractedTokenVersion = extractTokenVersion(token);
        Integer currentTokenVersion = user.getTokenVersion() == null ? 0 : user.getTokenVersion();
        return extractedUsername.equals(user.getUsername())
                && extractedUserId != null
                && extractedUserId.equals(user.getId())
                && extractedRole != null
                && extractedRole.equals(user.getUserType())
                && currentTokenVersion.equals(extractedTokenVersion)
                && !isTokenExpired(token);
    }
}
