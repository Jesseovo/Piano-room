package com.bookingsystem.aop;

import com.bookingsystem.annotation.RequireRoles;
import com.bookingsystem.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.aop.support.AopUtils;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class RoleAuthorizationAspect {

    private final AuthorizationService authorizationService;

    @Around("@within(com.bookingsystem.annotation.RequireRoles) || @annotation(com.bookingsystem.annotation.RequireRoles)")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        RequireRoles requireRoles = signature.getMethod().getAnnotation(RequireRoles.class);
        if (requireRoles == null) {
            Class<?> targetClass = AopUtils.getTargetClass(joinPoint.getTarget());
            requireRoles = targetClass.getAnnotation(RequireRoles.class);
        }

        if (requireRoles != null) {
            authorizationService.requireRoles(requireRoles.value());
        }
        return joinPoint.proceed();
    }
}
