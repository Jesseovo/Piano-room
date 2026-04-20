package com.bookingsystem.aop;

import com.bookingsystem.annotation.Log;
import com.bookingsystem.pojo.OperationLog;
import com.bookingsystem.security.AuthenticatedUser;
import com.bookingsystem.security.CurrentUserHolder;
import com.bookingsystem.service.OperationLogService;
import com.bookingsystem.utils.IpUtils;
import com.bookingsystem.utils.SensitiveDataSanitizer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class LogAspect {

    private final OperationLogService operationLogService;
    private final SensitiveDataSanitizer sensitiveDataSanitizer;

    @Pointcut("@annotation(com.bookingsystem.annotation.Log)")
    public void logPointCut() {}

    @AfterReturning(value = "logPointCut()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        handleLog(joinPoint, result, null);
    }

    @AfterThrowing(value = "logPointCut()", throwing = "e")
    public void afterThrowing(JoinPoint joinPoint, Throwable e) {
        handleLog(joinPoint, null, e);
    }

    private void handleLog(JoinPoint joinPoint, Object result, Throwable exception) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Log logAnnotation = signature.getMethod().getAnnotation(Log.class);

        OperationLog logEntry = new OperationLog();
        ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = requestAttributes != null ? requestAttributes.getRequest() : null;
        
        try {
            AuthenticatedUser currentUser = CurrentUserHolder.get();
            String username = currentUser != null ? currentUser.getUsername() : null;
            if (username == null && request != null) {
                username = (String) request.getAttribute("username");
            }

            logEntry.setUsername(username);
            logEntry.setOperationModule(logAnnotation.module());
            logEntry.setOperationType(logAnnotation.type());
            logEntry.setOperationDesc(logAnnotation.description());
            logEntry.setRequestUrl(request != null ? request.getRequestURI() : null);
            logEntry.setRequestMethod(request != null ? request.getMethod() : null);
            logEntry.setRequestIp(request != null ? IpUtils.getIpAddr(request) : null);
            logEntry.setRequestParam(sensitiveDataSanitizer.sanitize(joinPoint.getArgs()));
            if (exception == null) {
                logEntry.setStatus(1);
                logEntry.setResponseResult(sensitiveDataSanitizer.sanitize(result));
            } else {
                logEntry.setStatus(0);
                logEntry.setErrorMsg(sensitiveDataSanitizer.sanitizeText(exception.getMessage()));
            }
            logEntry.setCreatedAt(LocalDateTime.now());

            operationLogService.save(logEntry);
        } catch (Exception e) {
            log.error("记录操作日志失败", e);
        }
    }
}
