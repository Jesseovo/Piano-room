/*
 Navicat Premium Data Transfer

 琴房预约系统 - 数据库初始化脚本
 重构版本：新增签到签退字段、违约惩罚机制、惩罚规则表
 适配后端：music-booking-system (Spring Boot 3 + MyBatis)
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for operation_logs
-- ----------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
  `id`               bigint       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username`         varchar(50)  NOT NULL COMMENT '操作人用户名',
  `operation_module` varchar(100) NULL DEFAULT NULL COMMENT '操作模块',
  `operation_type`   varchar(100) NULL DEFAULT NULL COMMENT '操作类型',
  `operation_desc`   text         NULL COMMENT '操作描述',
  `request_url`      varchar(255) NULL DEFAULT NULL COMMENT '请求URL',
  `request_method`   varchar(10)  NULL DEFAULT NULL COMMENT '请求方法',
  `request_ip`       varchar(50)  NULL DEFAULT NULL COMMENT '请求IP',
  `request_param`    text         NULL COMMENT '请求参数',
  `response_result`  text         NULL COMMENT '响应结果',
  `status`           tinyint      NULL DEFAULT 1 COMMENT '操作状态(1成功，0失败)',
  `error_msg`        text         NULL COMMENT '错误信息',
  `created_at`       datetime     NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
  COMMENT = '操作日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for room_types（琴房类型）
-- ----------------------------
DROP TABLE IF EXISTS `room_types`;
CREATE TABLE `room_types` (
  `id`          bigint       NOT NULL AUTO_INCREMENT,
  `type_name`   varchar(50)  NOT NULL COMMENT '类型名称',
  `description` varchar(200) NULL DEFAULT NULL COMMENT '类型描述',
  `created_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `type_name` (`type_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
  COMMENT = '琴房类型表' ROW_FORMAT = DYNAMIC;

INSERT INTO `room_types` VALUES (1, '立式钢琴室', '配备标准立式钢琴，适合日常练习', NOW(), NOW());
INSERT INTO `room_types` VALUES (2, '三角钢琴室', '配备三角钢琴，适合高级练习及演出准备', NOW(), NOW());
INSERT INTO `room_types` VALUES (3, '电钢琴室',   '配备专业电钢琴，支持耳机静音练习', NOW(), NOW());
INSERT INTO `room_types` VALUES (4, '综合练习室', '配备多种乐器，适合多人排练或综合训练', NOW(), NOW());

-- ----------------------------
-- Table structure for rooms（琴房）
-- ----------------------------
DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `id`           bigint       NOT NULL AUTO_INCREMENT,
  `room_number`  varchar(20)  NOT NULL COMMENT '琴房编号',
  `name`         varchar(100) NOT NULL COMMENT '琴房名称',
  `floor`        int          NULL DEFAULT NULL COMMENT '所在楼层',
  `capacity`     int          NOT NULL DEFAULT 1 COMMENT '容纳人数（练琴室通常为1）',
  `room_type_id` bigint       NULL DEFAULT NULL COMMENT '琴房类型ID',
  `facilities`   text         NULL COMMENT '设施配置(JSON格式)',
  `status`       tinyint      NOT NULL DEFAULT 1 COMMENT '状态(1:可用,0:维护中)',
  `description`  text         NULL COMMENT '琴房描述',
  `longitude`    decimal(10,7) NULL DEFAULT NULL COMMENT '经度（百度地图坐标系）',
  `latitude`     decimal(10,7) NULL DEFAULT NULL COMMENT '纬度（百度地图坐标系）',
  `check_in_radius` int       NULL DEFAULT 100 COMMENT '签到允许半径（米，默认100米）',
  `created_at`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `room_number` (`room_number` ASC) USING BTREE,
  INDEX `idx_room_type` (`room_type_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
  COMMENT = '琴房信息表' ROW_FORMAT = DYNAMIC;

INSERT INTO `rooms` VALUES (1, 'P101', '101号立式钢琴室', 1, 1, 1, '{"立式钢琴":1,"谱架":1,"节拍器":1}', 1, '标准练琴室，适合日常基础练习', NULL, NULL, 100, NOW(), NOW());
INSERT INTO `rooms` VALUES (2, 'P102', '102号立式钢琴室', 1, 1, 1, '{"立式钢琴":1,"谱架":1,"节拍器":1}', 1, '标准练琴室，适合日常基础练习', NULL, NULL, 100, NOW(), NOW());
INSERT INTO `rooms` VALUES (3, 'P103', '103号立式钢琴室', 1, 1, 1, '{"立式钢琴":1,"谱架":1,"节拍器":1}', 1, '标准练琴室，适合日常基础练习', NULL, NULL, 100, NOW(), NOW());
INSERT INTO `rooms` VALUES (4, 'P201', '201号三角钢琴室', 2, 1, 2, '{"三角钢琴":1,"谱架":1,"录音设备":1}', 1, '高级练琴室，配备三角钢琴，适合音乐会前准备', NULL, NULL, 100, NOW(), NOW());
INSERT INTO `rooms` VALUES (5, 'P202', '202号三角钢琴室', 2, 1, 2, '{"三角钢琴":1,"谱架":1,"录音设备":1}', 1, '高级练琴室，配备三角钢琴', NULL, NULL, 100, NOW(), NOW());
INSERT INTO `rooms` VALUES (6, 'P301', '301号电钢琴室', 3, 1, 3, '{"电钢琴":1,"耳机":2,"谱架":1}', 1, '电钢琴室，支持耳机静音练习，不影响他人', NULL, NULL, 100, NOW(), NOW());
INSERT INTO `rooms` VALUES (7, 'P302', '302号电钢琴室', 3, 1, 3, '{"电钢琴":1,"耳机":2,"谱架":1}', 1, '电钢琴室，支持耳机静音练习', NULL, NULL, 100, NOW(), NOW());
INSERT INTO `rooms` VALUES (8, 'P401', '401号综合练习室', 4, 4, 4, '{"立式钢琴":1,"音响":1,"麦克风":2,"谱架":4}', 1, '综合排练室，可供小组排练使用', NULL, NULL, 100, NOW(), NOW());

-- ----------------------------
-- Table structure for room_maintenance
-- ----------------------------
DROP TABLE IF EXISTS `room_maintenance`;
CREATE TABLE `room_maintenance` (
  `id`               bigint      NOT NULL AUTO_INCREMENT,
  `room_id`          bigint      NOT NULL COMMENT '琴房ID',
  `start_time`       datetime    NOT NULL COMMENT '维护开始时间',
  `end_time`         datetime    NOT NULL COMMENT '维护结束时间',
  `reason`           text        NOT NULL COMMENT '维护原因',
  `maintenance_type` enum('定期维护','设备维护','设备升级','其他') NOT NULL COMMENT '维护类型',
  `status`           enum('未开始','进行中','已完成','已取消') NOT NULL DEFAULT '未开始' COMMENT '维护状态',
  `created_at`       datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_room` (`room_id` ASC) USING BTREE,
  INDEX `idx_time` (`start_time` ASC, `end_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
  COMMENT = '琴房维护记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for users（用户，新增违约惩罚字段）
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`               bigint       NOT NULL AUTO_INCREMENT,
  `username`         varchar(50)  NOT NULL COMMENT '用户名',
  `password`         varchar(255) NOT NULL COMMENT '密码(MD5加密)',
  `real_name`        varchar(50)  NOT NULL COMMENT '真实姓名',
  `student_id`       varchar(20)  NULL DEFAULT NULL COMMENT '学号',
  `email`            varchar(100) NOT NULL COMMENT '邮箱',
  `phone`            varchar(20)  NULL DEFAULT NULL COMMENT '手机号码',
  `grade`            varchar(20)  NULL DEFAULT NULL COMMENT '年级',
  `major`            varchar(50)  NULL DEFAULT NULL COMMENT '专业',
  `user_type`        enum('student','teacher','admin','super_admin') NOT NULL DEFAULT 'student' COMMENT '用户类型',
  `department_id`    bigint       NULL DEFAULT NULL COMMENT '所属院系ID',
  `avatar_url`       varchar(255) NULL DEFAULT NULL COMMENT '头像URL',
  `status`           tinyint      NOT NULL DEFAULT 1 COMMENT '账号状态(1:正常,0:禁用)',
  `token_version`    int          NOT NULL DEFAULT 0 COMMENT 'token版本，用于令牌失效控制',
  `violation_count`  int          NOT NULL DEFAULT 0 COMMENT '累计违约次数（预约后未签到）',
  `ban_until`        datetime     NULL DEFAULT NULL COMMENT '封禁到期时间（null=未封禁）',
  `last_login_time`  datetime     NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip`    varchar(50)  NULL DEFAULT NULL COMMENT '最后登录IP',
  `created_at`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username` (`username` ASC) USING BTREE,
  UNIQUE INDEX `student_id` (`student_id` ASC) USING BTREE,
  INDEX `idx_department` (`department_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
  COMMENT = '用户表' ROW_FORMAT = DYNAMIC;

-- 初始用户数据（密码均为 123456 的 MD5）
INSERT INTO `users` VALUES (1, 'student1', 'e10adc3949ba59abbe56e057f20f883e', '张三', '20230001', 'student1@test.com', '13800138001', '2023级', '音乐学', 'student', NULL, NULL, 1, 0, 0, NULL, NULL, NULL, NOW(), NOW());
INSERT INTO `users` VALUES (2, 'student2', 'e10adc3949ba59abbe56e057f20f883e', '李四', '20230002', 'student2@test.com', '13800138002', '2023级', '钢琴表演', 'student', NULL, NULL, 1, 0, 0, NULL, NULL, NULL, NOW(), NOW());
INSERT INTO `users` VALUES (3, 'admin1',   'e10adc3949ba59abbe56e057f20f883e', '王管理员', 'A2023001', 'admin1@test.com', '13800138003', NULL, NULL, 'admin', NULL, NULL, 1, 0, 0, NULL, NULL, NULL, NOW(), NOW());
INSERT INTO `users` VALUES (4, 'superadmin', 'e10adc3949ba59abbe56e057f20f883e', '超级管理员', 'SA001', 'super@test.com', '13900000000', NULL, NULL, 'super_admin', NULL, NULL, 1, 0, 0, NULL, NULL, NULL, NOW(), NOW());

-- ----------------------------
-- Table structure for penalty_rules（阶梯惩罚规则，管理员可配置）
-- ----------------------------
DROP TABLE IF EXISTS `penalty_rules`;
CREATE TABLE `penalty_rules` (
  `id`              bigint       NOT NULL AUTO_INCREMENT,
  `violation_count` int          NOT NULL COMMENT '触发此规则的违约次数阈值',
  `ban_days`        int          NOT NULL DEFAULT 0 COMMENT '封禁天数（0=仅警告，不封禁）',
  `description`     varchar(200) NULL COMMENT '规则说明',
  `created_at`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_violation_count` (`violation_count` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
  COMMENT = '阶梯惩罚规则表（管理员可调整）' ROW_FORMAT = DYNAMIC;

-- 默认惩罚规则
INSERT INTO `penalty_rules` VALUES (1, 1, 0,  '第1次违约：系统警告，不封禁', NOW(), NOW());
INSERT INTO `penalty_rules` VALUES (2, 2, 7,  '第2次违约：封禁7天', NOW(), NOW());
INSERT INTO `penalty_rules` VALUES (3, 3, 30, '第3次及以上违约：封禁30天', NOW(), NOW());

-- ----------------------------
-- Table structure for reservations（预约，新增签到签退字段和 occupied 状态）
-- ----------------------------
DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
  `id`               bigint       NOT NULL AUTO_INCREMENT,
  `user_id`          bigint       NOT NULL COMMENT '预约用户ID',
  `room_id`          bigint       NOT NULL COMMENT '琴房ID',
  `title`            varchar(200) NOT NULL COMMENT '预约标题',
  `purpose`          text         NOT NULL COMMENT '使用目的',
  `start_time`       datetime     NOT NULL COMMENT '开始时间',
  `end_time`         datetime     NOT NULL COMMENT '结束时间',
  `attendees`        int          NOT NULL DEFAULT 1 COMMENT '使用人数',
  `status`           enum('approved','cancelled','completed','occupied')
                                  NOT NULL DEFAULT 'approved'
                                  COMMENT '预约状态：approved=已预约(即时生效), cancelled=已取消, completed=已完成, occupied=已被判定违约',
  `sign_start_time`  datetime     NULL DEFAULT NULL COMMENT '实际签到时间',
  `sign_end_time`    datetime     NULL DEFAULT NULL COMMENT '实际签退时间',
  `remarks`          text         NULL COMMENT '备注/取消原因',
  `reviewer_id`      bigint       NULL DEFAULT NULL COMMENT '操作管理员ID',
  `review_time`      datetime     NULL DEFAULT NULL COMMENT '管理员操作时间',
  `review_remarks`   text         NULL COMMENT '管理员备注',
  `created_at`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_room`          (`room_id` ASC) USING BTREE,
  INDEX `idx_status`        (`status` ASC) USING BTREE,
  INDEX `idx_time`          (`start_time` ASC, `end_time` ASC) USING BTREE,
  INDEX `idx_user`          (`user_id` ASC) USING BTREE,
  -- 高并发防超卖：同一琴房同一开始时刻只能有一条 approved 预约
  -- 注意：MySQL 的唯一索引对 enum 列有效，cancelled/completed 重复不受约束（需用组合+部分索引方式）
  -- 实际防超卖通过 SELECT...FOR UPDATE + 应用层冲突检测双重保障实现
  INDEX `idx_room_start`    (`room_id` ASC, `start_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
  COMMENT = '预约表（提交即生效，无需审核，图书馆式先到先得）' ROW_FORMAT = DYNAMIC;

-- =====================================================================
-- 高并发防超卖补充说明（已在应用层 quickReservation 方法中实现双重保护）:
-- 1. checkConflict 使用 SELECT COUNT 检测时间段冲突
-- 2. 如需更强保护，可在运行中数据库执行以下语句（需先清理重复数据）:
--    ALTER TABLE reservations
--      ADD UNIQUE INDEX idx_room_start_approved (room_id, start_time, end_time);
-- 由于已有取消的记录可能重复时间段，上述约束仅适用于全新数据库
-- =====================================================================

-- ----------------------------
-- Table structure for system_config
-- ----------------------------
DROP TABLE IF EXISTS `system_config`;
CREATE TABLE `system_config` (
  `id`            bigint       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `system_name`   varchar(100) NOT NULL COMMENT '配置键名',
  `logo_url`      varchar(255) NULL DEFAULT NULL COMMENT '系统Logo图片URL',
  `description`   json         NULL COMMENT '系统配置JSON',
  `admin_email`   varchar(100) NULL DEFAULT NULL COMMENT '管理员邮箱',
  `contact_phone` varchar(20)  NULL DEFAULT NULL COMMENT '联系电话',
  `created_at`    datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`    datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `system_name` (`system_name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1
  CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
  COMMENT = '系统配置表' ROW_FORMAT = DYNAMIC;

INSERT INTO `system_config` VALUES (1, 'baseSetting', NULL,
  '{"systemName":"皮埃诺预约系统","description":"学生个人练琴室在线预约平台","primaryColor":"#ff69b4","logo":null,"favicon":null,"email":null,"phone":null,"copyright":"© 2025 皮埃诺预约系统"}',
  NULL, NULL, NOW(), NOW());
INSERT INTO `system_config` VALUES (2, 'reservationSetting', NULL,
  '{"maxAdvanceDays":7,"signInGrace":10,"maxNoShow":3}',
  NULL, NULL, NOW(), NOW());
INSERT INTO `system_config` VALUES (3, 'securitySetting', NULL,
  '{"tokenExpireHours":24,"minPasswordLength":6}',
  NULL, NULL, NOW(), NOW());

-- ----------------------------
-- Table structure for shared_verification_codes
-- ----------------------------
DROP TABLE IF EXISTS `shared_verification_codes`;
CREATE TABLE `shared_verification_codes` (
  `id`               bigint       NOT NULL AUTO_INCREMENT,
  `business_type`    varchar(64)  NOT NULL COMMENT '验证码业务类型',
  `verification_key` varchar(64)  NOT NULL COMMENT '前端持有的验证码key',
  `code_value`       varchar(64)  NOT NULL COMMENT '验证码值',
  `target`           varchar(255) NULL DEFAULT NULL COMMENT '目标邮箱等附加校验信息',
  `expires_at`       datetime     NOT NULL COMMENT '过期时间',
  `consumed`         tinyint      NOT NULL DEFAULT 0 COMMENT '是否已消费',
  `created_at`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_business_verification_key` (`business_type` ASC, `verification_key` ASC) USING BTREE,
  INDEX `idx_shared_verification_expires_at` (`expires_at` ASC) USING BTREE,
  INDEX `idx_shared_verification_target` (`target` ASC) USING BTREE
) ENGINE = InnoDB
  CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
  COMMENT = '共享验证码表' ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
