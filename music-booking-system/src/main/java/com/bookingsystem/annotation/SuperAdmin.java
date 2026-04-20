package com.bookingsystem.annotation;

import java.lang.annotation.*;

/**
 * 权限检查注解
 */
@Target({ElementType.METHOD, ElementType.TYPE})  // 注解作用于方法或类上
@Retention(RetentionPolicy.RUNTIME)  // 注解在运行时有效
@Documented  // 注解包含在javadoc中
public @interface SuperAdmin {
    /**
     * 所需的权限值
     */
    String[] value() default {};
    
    /**
     * 权限类型，如菜单、按钮等
     */
    String type() default "MENU";
    
    /**
     * 是否需要验证所有权限，true表示需要全部权限，false表示只需要其中一个权限
     */
    boolean all() default false;
}
