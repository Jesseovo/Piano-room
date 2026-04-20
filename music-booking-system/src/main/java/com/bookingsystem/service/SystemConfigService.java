package com.bookingsystem.service;

import com.bookingsystem.pojo.BasicSetting;
import com.bookingsystem.pojo.ReservationSetting;
import com.bookingsystem.pojo.SecuritySetting;
import com.bookingsystem.pojo.SystemConfig;

public interface SystemConfigService {
    // 获取系统配置
    SystemConfig getSystemConfig();
    // 更新系统配置
    void updateSystemConfig(SystemConfig systemConfig);
    BasicSetting getBasicSetting();
    ReservationSetting getReservationSetting();
    SecuritySetting getSecuritySetting();
    void saveBasicSetting(BasicSetting basicSetting);
    void saveReservationSetting(ReservationSetting reservationSetting);
    void saveSecuritySetting(SecuritySetting securitySetting);
    void refreshSettingsCache();
}
