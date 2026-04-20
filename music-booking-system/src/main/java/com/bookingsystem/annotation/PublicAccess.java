package com.bookingsystem.annotation;

import java.lang.annotation.*;

/**
 * 标记无需登录即可访问的公开接口。
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface PublicAccess {
}
