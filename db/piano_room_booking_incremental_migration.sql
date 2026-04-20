-- Incremental migration for the existing piano_room_booking database.
-- Goal: keep old data, avoid DROP TABLE, and align the schema with the current backend.

SET NAMES utf8mb4;

DELIMITER $$

DROP PROCEDURE IF EXISTS migrate_piano_room_booking_to_current$$
CREATE PROCEDURE migrate_piano_room_booking_to_current()
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_check_in_timeout INT DEFAULT 10;

    -- room_types
    SELECT COUNT(*) INTO v_count
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'room_types';
    IF v_count = 0 THEN
        CREATE TABLE room_types (
            id BIGINT NOT NULL AUTO_INCREMENT,
            type_name VARCHAR(50) NOT NULL,
            description VARCHAR(200) NULL DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_room_types_type_name (type_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    END IF;

    INSERT INTO room_types (type_name, description, created_at, updated_at)
    SELECT DISTINCT r.type,
           CONCAT('migrated from legacy type: ', r.type),
           NOW(),
           NOW()
    FROM rooms r
    WHERE r.type IS NOT NULL
      AND TRIM(r.type) <> ''
      AND NOT EXISTS (
          SELECT 1 FROM room_types rt WHERE rt.type_name = r.type
      );

    -- rooms
    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'room_number';
    IF v_count = 0 THEN
        ALTER TABLE rooms ADD COLUMN room_number VARCHAR(20) NULL AFTER id;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'room_type_id';
    IF v_count = 0 THEN
        ALTER TABLE rooms ADD COLUMN room_type_id BIGINT NULL AFTER capacity;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'facilities';
    IF v_count = 0 THEN
        ALTER TABLE rooms ADD COLUMN facilities TEXT NULL AFTER room_type_id;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'longitude';
    IF v_count = 0 THEN
        ALTER TABLE rooms ADD COLUMN longitude DECIMAL(10,7) NULL DEFAULT NULL AFTER description;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'latitude';
    IF v_count = 0 THEN
        ALTER TABLE rooms ADD COLUMN latitude DECIMAL(10,7) NULL DEFAULT NULL AFTER longitude;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'check_in_radius';
    IF v_count = 0 THEN
        ALTER TABLE rooms ADD COLUMN check_in_radius INT NULL DEFAULT 100 AFTER latitude;
    END IF;

    UPDATE rooms
    SET room_number = COALESCE(NULLIF(room_number, ''), room_no, name)
    WHERE room_number IS NULL OR room_number = '';

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'room_no' AND IS_NULLABLE = 'NO';
    IF v_count > 0 THEN
        ALTER TABLE rooms MODIFY COLUMN room_no VARCHAR(20) NULL;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'type' AND IS_NULLABLE = 'NO';
    IF v_count > 0 THEN
        ALTER TABLE rooms MODIFY COLUMN type VARCHAR(50) NULL;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'location' AND IS_NULLABLE = 'NO';
    IF v_count > 0 THEN
        ALTER TABLE rooms MODIFY COLUMN location VARCHAR(100) NULL;
    END IF;

    UPDATE rooms r
    JOIN room_types rt ON rt.type_name = r.type
    SET r.room_type_id = rt.id
    WHERE r.room_type_id IS NULL;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND COLUMN_NAME = 'equipment';
    IF v_count > 0 THEN
        UPDATE rooms
        SET facilities = CAST(equipment AS CHAR)
        WHERE (facilities IS NULL OR facilities = '')
          AND equipment IS NOT NULL;
    END IF;

    UPDATE rooms
    SET check_in_radius = 100
    WHERE check_in_radius IS NULL;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND INDEX_NAME = 'uk_rooms_room_number';
    IF v_count = 0 THEN
        ALTER TABLE rooms ADD UNIQUE KEY uk_rooms_room_number (room_number);
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rooms' AND INDEX_NAME = 'idx_rooms_room_type_id';
    IF v_count = 0 THEN
        ALTER TABLE rooms ADD KEY idx_rooms_room_type_id (room_type_id);
    END IF;

    -- users
    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email';
    IF v_count = 0 THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(100) NULL DEFAULT NULL AFTER student_id;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'grade';
    IF v_count = 0 THEN
        ALTER TABLE users ADD COLUMN grade VARCHAR(20) NULL DEFAULT NULL AFTER phone;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'user_type';
    IF v_count = 0 THEN
        ALTER TABLE users ADD COLUMN user_type VARCHAR(32) NOT NULL DEFAULT 'student' AFTER major;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_url';
    IF v_count = 0 THEN
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL DEFAULT NULL AFTER user_type;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'violation_count';
    IF v_count = 0 THEN
        ALTER TABLE users ADD COLUMN violation_count INT NOT NULL DEFAULT 0 AFTER token_version;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'ban_until';
    IF v_count = 0 THEN
        ALTER TABLE users ADD COLUMN ban_until DATETIME NULL DEFAULT NULL AFTER violation_count;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login_time';
    IF v_count = 0 THEN
        ALTER TABLE users ADD COLUMN last_login_time DATETIME NULL DEFAULT NULL AFTER ban_until;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_login_ip';
    IF v_count = 0 THEN
        ALTER TABLE users ADD COLUMN last_login_ip VARCHAR(50) NULL DEFAULT NULL AFTER last_login_time;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar';
    IF v_count > 0 THEN
        UPDATE users
        SET avatar_url = avatar
        WHERE (avatar_url IS NULL OR avatar_url = '')
          AND avatar IS NOT NULL
          AND avatar <> '';
    END IF;

    UPDATE users
    SET real_name = username
    WHERE real_name IS NULL OR real_name = '';

    UPDATE users
    SET user_type = CASE
        WHEN user_type IS NULL OR user_type = '' THEN
            CASE
                WHEN LOWER(username) LIKE '%admin%' THEN 'admin'
                ELSE 'student'
            END
        ELSE user_type
    END;

    -- reservations: convert legacy date/time model to datetime model
    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'start_time'
      AND DATA_TYPE = 'time';
    IF v_count > 0 THEN
        ALTER TABLE reservations CHANGE COLUMN start_time legacy_start_time TIME NOT NULL;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'end_time'
      AND DATA_TYPE = 'time';
    IF v_count > 0 THEN
        ALTER TABLE reservations CHANGE COLUMN end_time legacy_end_time TIME NOT NULL;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'date';
    IF v_count > 0 THEN
        ALTER TABLE reservations CHANGE COLUMN date legacy_date DATE NOT NULL;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'title';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN title VARCHAR(200) NULL DEFAULT NULL AFTER room_id;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'purpose';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN purpose TEXT NULL AFTER title;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'start_time';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN start_time DATETIME NULL DEFAULT NULL AFTER purpose;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'end_time';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN end_time DATETIME NULL DEFAULT NULL AFTER start_time;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'attendees';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN attendees INT NOT NULL DEFAULT 1 AFTER end_time;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'remarks';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN remarks TEXT NULL AFTER status;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'reviewer_id';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN reviewer_id BIGINT NULL DEFAULT NULL AFTER remarks;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'review_time';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN review_time DATETIME NULL DEFAULT NULL AFTER reviewer_id;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'review_remarks';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN review_remarks TEXT NULL AFTER review_time;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'sign_start_time';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN sign_start_time DATETIME NULL DEFAULT NULL AFTER updated_at;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'sign_end_time';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD COLUMN sign_end_time DATETIME NULL DEFAULT NULL AFTER sign_start_time;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'remark';
    IF v_count > 0 THEN
        UPDATE reservations
        SET remarks = remark
        WHERE (remarks IS NULL OR remarks = '')
          AND remark IS NOT NULL
          AND remark <> '';
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'check_in_time';
    IF v_count > 0 THEN
        UPDATE reservations
        SET sign_start_time = check_in_time
        WHERE sign_start_time IS NULL
          AND check_in_time IS NOT NULL;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'check_out_time';
    IF v_count > 0 THEN
        UPDATE reservations
        SET sign_end_time = check_out_time
        WHERE sign_end_time IS NULL
          AND check_out_time IS NOT NULL;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND COLUMN_NAME = 'legacy_date';
    IF v_count > 0 THEN
        UPDATE reservations
        SET start_time = TIMESTAMP(legacy_date, legacy_start_time)
        WHERE start_time IS NULL
          AND legacy_date IS NOT NULL
          AND legacy_start_time IS NOT NULL;

        UPDATE reservations
        SET end_time = TIMESTAMP(legacy_date, legacy_end_time)
        WHERE end_time IS NULL
          AND legacy_date IS NOT NULL
          AND legacy_end_time IS NOT NULL;
    END IF;

    UPDATE reservations
    SET title = CONCAT('reservation-', room_id, '-', DATE_FORMAT(COALESCE(start_time, created_at, NOW()), '%Y%m%d%H%i'))
    WHERE title IS NULL OR title = '';

    UPDATE reservations
    SET purpose = COALESCE(NULLIF(remarks, ''), 'daily practice')
    WHERE purpose IS NULL OR purpose = '';

    UPDATE reservations
    SET attendees = 1
    WHERE attendees IS NULL OR attendees <= 0;

    UPDATE reservations
    SET status = CASE
        WHEN status = 'confirmed' THEN 'approved'
        WHEN status = 'checked_in' THEN 'approved'
        WHEN status = 'checked_out' THEN 'completed'
        WHEN status = 'expired' THEN 'occupied'
        WHEN status = 'no_show' THEN 'occupied'
        WHEN status = 'pending' THEN 'pending'
        WHEN status = 'approved' THEN 'approved'
        WHEN status = 'rejected' THEN 'rejected'
        WHEN status = 'cancelled' THEN 'cancelled'
        WHEN status = 'completed' THEN 'completed'
        WHEN status = 'occupied' THEN 'occupied'
        ELSE 'approved'
    END;

    ALTER TABLE reservations MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'approved';

    SELECT COUNT(*) INTO v_count
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reservations' AND INDEX_NAME = 'idx_reservations_room_start';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD KEY idx_reservations_room_start (room_id, start_time);
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reservations' AND INDEX_NAME = 'idx_reservations_status';
    IF v_count = 0 THEN
        ALTER TABLE reservations ADD KEY idx_reservations_status (status);
    END IF;

    -- system_config
    SELECT COUNT(*) INTO v_count
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'system_config';
    IF v_count = 0 THEN
        CREATE TABLE system_config (
            id BIGINT NOT NULL AUTO_INCREMENT,
            system_name VARCHAR(100) NOT NULL,
            logo_url VARCHAR(255) NULL DEFAULT NULL,
            description LONGTEXT NULL,
            admin_email VARCHAR(100) NULL DEFAULT NULL,
            contact_phone VARCHAR(20) NULL DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_system_config_system_name (system_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    END IF;

    SELECT COALESCE(MAX(CASE WHEN config_key = 'check_in_timeout' THEN CAST(config_value AS UNSIGNED) END), 10)
    INTO v_check_in_timeout
    FROM system_configs;

    INSERT INTO system_config (system_name, description, created_at, updated_at)
    SELECT 'baseSetting',
           JSON_OBJECT(
               'systemName', CONVERT(0xE79AAEE59F83E8AFBAE790B4E688BF USING utf8mb4),
               'logo', NULL,
               'favicon', NULL,
               'primaryColor', '#ff69b4',
               'description', CONVERT(0xE5ADA6E7949FE4B8AAE4BABAE7BB83E790B4E5AEA4E59CA8E7BABFE9A284E7BAA6E5B9B3E58FB0 USING utf8mb4),
               'copyright', CONVERT(0xC2A9203230323620E79AAEE59F83E8AFBAE790B4E688BF USING utf8mb4),
               'phone', NULL,
               'email', NULL,
               'slotStartHour', 8,
               'slotEndHour', 22,
               'slotDurationMinutes', 120,
               'bookingResetHour', 0
           ),
           NOW(),
           NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM system_config WHERE system_name = 'baseSetting'
    );

    INSERT INTO system_config (system_name, description, created_at, updated_at)
    SELECT 'reservationSetting',
           JSON_OBJECT(
               'maxAdvanceDays', 7,
               'signInGrace', v_check_in_timeout,
               'maxNoShow', 3
           ),
           NOW(),
           NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM system_config WHERE system_name = 'reservationSetting'
    );

    INSERT INTO system_config (system_name, description, created_at, updated_at)
    SELECT 'securitySetting',
           JSON_OBJECT(
               'tokenExpireHours', 24,
               'minPasswordLength', 6
           ),
           NOW(),
           NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM system_config WHERE system_name = 'securitySetting'
    );

    -- room_maintenance
    SELECT COUNT(*) INTO v_count
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'room_maintenance';
    IF v_count = 0 THEN
        CREATE TABLE room_maintenance (
            id BIGINT NOT NULL AUTO_INCREMENT,
            room_id BIGINT NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            reason TEXT NOT NULL,
            maintenance_type VARCHAR(50) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'not_started',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_room_maintenance_room (room_id),
            KEY idx_room_maintenance_time (start_time, end_time)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    END IF;

    -- penalty_rules
    SELECT COUNT(*) INTO v_count
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'penalty_rules';
    IF v_count = 0 THEN
        CREATE TABLE penalty_rules (
            id BIGINT NOT NULL AUTO_INCREMENT,
            violation_count INT NOT NULL,
            ban_days INT NOT NULL DEFAULT 0,
            description VARCHAR(200) NULL DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_penalty_rules_violation_count (violation_count)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    END IF;

    INSERT INTO penalty_rules (violation_count, ban_days, description, created_at, updated_at)
    SELECT 1, 0, 'warning only', NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM penalty_rules WHERE violation_count = 1);

    INSERT INTO penalty_rules (violation_count, ban_days, description, created_at, updated_at)
    SELECT 2, 7, 'ban for 7 days', NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM penalty_rules WHERE violation_count = 2);

    INSERT INTO penalty_rules (violation_count, ban_days, description, created_at, updated_at)
    SELECT 3, 30, 'ban for 30 days', NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM penalty_rules WHERE violation_count = 3);

    -- operation_logs
    SELECT COUNT(*) INTO v_count
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'operation_logs';
    IF v_count = 0 THEN
        CREATE TABLE operation_logs (
            id BIGINT NOT NULL AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            operation_module VARCHAR(100) NULL DEFAULT NULL,
            operation_type VARCHAR(100) NULL DEFAULT NULL,
            operation_desc TEXT NULL,
            request_url VARCHAR(255) NULL DEFAULT NULL,
            request_method VARCHAR(10) NULL DEFAULT NULL,
            request_ip VARCHAR(50) NULL DEFAULT NULL,
            request_param TEXT NULL,
            response_result TEXT NULL,
            status TINYINT NULL DEFAULT 1,
            error_msg TEXT NULL,
            created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    END IF;
END$$

CALL migrate_piano_room_booking_to_current()$$
DROP PROCEDURE IF EXISTS migrate_piano_room_booking_to_current$$

DELIMITER ;
