// 1. 创建拦截器类 - JwtAuthInterceptor.java
package com.bookingsystem.interceptor;

import com.bookingsystem.annotation.PublicAccess;
import com.bookingsystem.exception.BusinessException;
import com.bookingsystem.mapper.UserMapper;
import com.bookingsystem.pojo.User;
import com.bookingsystem.security.AuthenticatedUser;
import com.bookingsystem.security.CurrentUserHolder;
import com.bookingsystem.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * JWT认证拦截器
 * 用于拦截需要认证的接口，验证JWT令牌
 */
@Slf4j
@Component
public class JwtAuthInterceptor implements HandlerInterceptor {


    @Autowired
    private  JwtUtil jwtUtil;

    @Autowired
    private UserMapper userMapper;
    
    // 在请求处理之前执行
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (handler instanceof HandlerMethod handlerMethod && isPublicAccess(handlerMethod)) {
            return true;
        }

        // 获取请求头中的token
        String token = request.getHeader("Authorization");
        
        // 如果没有token或格式不正确
        if (!StringUtils.hasText(token) || !token.startsWith("Bearer ")) {
            throw new BusinessException(401,"未登录或token已过期");
        }
        
        // 截取Bearer 后的token部分
        token = token.substring(7);
        
        try {
            // 验证token
            Long userId = jwtUtil.extractUserId(token);
            if (userId == null || jwtUtil.isTokenExpired(token)) {
                throw new BusinessException(401,"未登录或token已过期");
            }

            User user = userMapper.getById(userId);
            if (user == null) {
                throw new BusinessException(401, "用户不存在或token已失效");
            }
            if (!jwtUtil.validateToken(token, user)) {
                throw new BusinessException(401, "未登录或token已过期");
            }
            if (user.getStatus() != null && user.getStatus() == 0) {
                throw new BusinessException(403, "账号已被禁用");
            }

            AuthenticatedUser currentUser = new AuthenticatedUser(
                    user.getId(),
                    user.getUsername(),
                    user.getUserType(),
                    user.getStatus()
            );
            CurrentUserHolder.set(currentUser);
            
            // 将用户信息存入请求属性，方便后续使用
            request.setAttribute("username", user.getUsername());
            request.setAttribute("currentUser", currentUser);
            request.setAttribute("currentUserId", currentUser.getId());
            request.setAttribute("currentUserType", currentUser.getUserType());
            
            return true; // 放行请求
        } catch (BusinessException e) {
            CurrentUserHolder.clear();
            throw e;
        } catch (Exception e) {
            log.error("Token验证失败", e);
            CurrentUserHolder.clear();
            throw new BusinessException(401,"未登录或token已过期");
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        CurrentUserHolder.clear();
    }

    private boolean isPublicAccess(HandlerMethod handlerMethod) {
        return handlerMethod.getMethodAnnotation(PublicAccess.class) != null
                || handlerMethod.getBeanType().getAnnotation(PublicAccess.class) != null;
    }
}
