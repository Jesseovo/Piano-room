package com.bookingsystem.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DatabaseSchemaInitializer {

    private final JdbcTemplate jdbcTemplate;

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 1)
    public CommandLineRunner ensureSecuritySchema() {
        return args -> {
            ensureUsersTokenVersionColumn();
            ensureSharedVerificationCodesTable();
            ensureRoomsSchemaCompatibility();
        };
    }

    private void ensureUsersTokenVersionColumn() {
        if (columnExists("users", "token_version")) {
            return;
        }
        log.info("检测到 users.token_version 不存在，正在补齐安全字段");
        jdbcTemplate.execute("""
                ALTER TABLE users
                ADD COLUMN token_version INT NOT NULL DEFAULT 0 COMMENT 'token版本，用于令牌失效控制' AFTER status
                """);
    }

    private void ensureSharedVerificationCodesTable() {
        if (tableExists("shared_verification_codes")) {
            return;
        }
        log.info("检测到 shared_verification_codes 不存在，正在创建共享验证码表");
        jdbcTemplate.execute("""
                CREATE TABLE shared_verification_codes (
                    id BIGINT NOT NULL AUTO_INCREMENT,
                    business_type VARCHAR(64) NOT NULL COMMENT '验证码业务类型',
                    verification_key VARCHAR(64) NOT NULL COMMENT '前端持有的验证码key',
                    code_value VARCHAR(64) NOT NULL COMMENT '验证码值',
                    target VARCHAR(255) NULL COMMENT '目标邮箱等附加校验信息',
                    expires_at DATETIME NOT NULL COMMENT '过期时间',
                    consumed TINYINT NOT NULL DEFAULT 0 COMMENT '是否已消费',
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    UNIQUE KEY uk_business_verification_key (business_type, verification_key),
                    KEY idx_shared_verification_expires_at (expires_at),
                    KEY idx_shared_verification_target (target)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='共享验证码表'
                """);
    }

    private void ensureRoomsSchemaCompatibility() {
        if (!tableExists("rooms")) {
            return;
        }

        ensureColumnExists("rooms", "room_number",
                "ALTER TABLE rooms ADD COLUMN room_number VARCHAR(20) NULL AFTER id");
        ensureColumnExists("rooms", "room_type_id",
                "ALTER TABLE rooms ADD COLUMN room_type_id BIGINT NULL AFTER capacity");
        ensureColumnExists("rooms", "facilities",
                "ALTER TABLE rooms ADD COLUMN facilities TEXT NULL AFTER room_type_id");
        ensureColumnExists("rooms", "longitude",
                "ALTER TABLE rooms ADD COLUMN longitude DECIMAL(10,7) NULL DEFAULT NULL AFTER description");
        ensureColumnExists("rooms", "latitude",
                "ALTER TABLE rooms ADD COLUMN latitude DECIMAL(10,7) NULL DEFAULT NULL AFTER longitude");
        ensureColumnExists("rooms", "check_in_radius",
                "ALTER TABLE rooms ADD COLUMN check_in_radius INT NULL DEFAULT 100 AFTER latitude");

        if (columnExists("rooms", "room_no")) {
            jdbcTemplate.update("""
                    UPDATE rooms
                    SET room_number = COALESCE(NULLIF(room_number, ''), room_no, name)
                    WHERE room_number IS NULL OR room_number = ''
                    """);
            relaxLegacyRoomsColumnIfRequired("room_no", "VARCHAR(20)");
        }

        if (columnExists("rooms", "type")) {
            relaxLegacyRoomsColumnIfRequired("type", "VARCHAR(50)");
        }

        if (columnExists("rooms", "location")) {
            relaxLegacyRoomsColumnIfRequired("location", "VARCHAR(100)");
        }

        if (tableExists("room_types") && columnExists("rooms", "type")) {
            jdbcTemplate.update("""
                    UPDATE rooms r
                    JOIN room_types rt ON rt.type_name = r.type
                    SET r.room_type_id = rt.id
                    WHERE r.room_type_id IS NULL
                      AND r.type IS NOT NULL
                      AND TRIM(r.type) <> ''
                    """);
        }

        jdbcTemplate.update("""
                UPDATE rooms
                SET check_in_radius = 100
                WHERE check_in_radius IS NULL
                """);
    }

    private boolean tableExists(String tableName) {
        Integer tableCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                """, Integer.class, tableName);
        return tableCount != null && tableCount > 0;
    }

    private boolean columnExists(String tableName, String columnName) {
        Integer columnCount = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = ?
                """, Integer.class, tableName, columnName);
        return columnCount != null && columnCount > 0;
    }

    private void ensureColumnExists(String tableName, String columnName, String alterSql) {
        if (columnExists(tableName, columnName)) {
            return;
        }
        log.info("检测到 {}.{} 不存在，正在自动补齐", tableName, columnName);
        jdbcTemplate.execute(alterSql);
    }

    private void relaxLegacyRoomsColumnIfRequired(String columnName, String definition) {
        String nullable = jdbcTemplate.queryForObject("""
                SELECT IS_NULLABLE
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'rooms'
                  AND COLUMN_NAME = ?
                """, String.class, columnName);
        if ("YES".equalsIgnoreCase(nullable)) {
            return;
        }
        log.info("检测到 rooms.{} 仍为 NOT NULL，正在调整为兼容旧库的可空字段", columnName);
        jdbcTemplate.execute("ALTER TABLE rooms MODIFY COLUMN " + columnName + " " + definition + " NULL");
    }
}
