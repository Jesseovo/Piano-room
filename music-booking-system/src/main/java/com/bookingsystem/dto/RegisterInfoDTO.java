package com.bookingsystem.dto;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class RegisterInfoDTO {

    /**
     *  用户名
     */
    private String username;

    /**
     * 学号
     */
    private String studentId;

    /**
     * 学院id
     */
    private Long deptId;

    /**
     * 密码
     */
    private String password;

    /**
     * 真实姓名
     *
     */
    private String realName;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 邮箱验证码
     */
    private String emailCode;


    /**
     * 验证码
     */
    private String captchaCode;

    /**
     * 图形验证码key
     */
    private String captchaKey;

    /**
     * 邮箱验证码key
     */
    private String emailCodeKey;
}

