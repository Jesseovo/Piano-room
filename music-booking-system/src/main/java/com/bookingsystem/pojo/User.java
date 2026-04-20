package com.bookingsystem.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
public class User {
    /**
     * id主键
     */
    private Long id;
    /**
     * 用户名
     */
    private String username;
    /**
     * 密码
     */
    private String password;
    /**
     * 真实姓名
     */
    private String realName;
    /**
     * 学号
     */
    private String studentId;
    /**
     * 邮箱
     */
    private String email;
    /**
     * 手机号
     */
    private String phone;
    /**
     * 年级
     */
    private String grade;
    /**
     * 专业
     */
    private String major;
    /**
     * 用户类型 enum('student','teacher','admin','super_admin') NOT NULL COMMENT '用户类型',
     */
    private String userType;
    /**
     * 头像地址
     */
    private String avatarUrl;
    /**
     *  账号状态 (1:正常,0:禁用)
     */
    private Integer status;
    /**
     * token版本号，用于密码重置后的旧令牌失效
     */
    private Integer tokenVersion;
    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;
    /**
     * 最后登录ip
     */
    private String lastLoginIp;
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    /**
     * 违约次数（预约后超时未签到累计）
     */
    private Integer violationCount;

    /**
     * 封禁到期时间（null=未封禁）
     */
    private LocalDateTime banUntil;

}
