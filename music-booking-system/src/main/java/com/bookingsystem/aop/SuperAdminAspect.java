package com.bookingsystem.aop;


import com.bookingsystem.annotation.SuperAdmin;
import com.bookingsystem.service.AuthorizationService;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 权限检查AOP切面
 */
@Aspect
@Component
public class SuperAdminAspect {

    @Autowired
    private AuthorizationService authorizationService;

    @Pointcut("@within(com.bookingsystem.annotation.SuperAdmin) || @annotation(com.bookingsystem.annotation.SuperAdmin)")
    public void permissionCheck() {}

    @Before("permissionCheck()")
    public void doBefore() {
        authorizationService.requireSuperAdmin();
    }
}
