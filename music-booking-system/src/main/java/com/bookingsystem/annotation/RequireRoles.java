package com.bookingsystem.annotation;

import java.lang.annotation.*;

/**
 * 声明接口所需的用户角色。
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireRoles {
    String[] value();
}
