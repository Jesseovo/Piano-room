package com.bookingsystem.controller;

import com.bookingsystem.annotation.Log;
import com.bookingsystem.annotation.PublicAccess;
import com.bookingsystem.annotation.RequireRoles;
import com.bookingsystem.config.AppSecurityProperties;
import com.bookingsystem.pojo.BasicSetting;
import com.bookingsystem.pojo.ReservationSetting;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.pojo.SecuritySetting;
import com.bookingsystem.pojo.SystemConfig;
import com.bookingsystem.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/system")
public class SystemConfigController {

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private AppSecurityProperties appSecurityProperties;

    @PublicAccess
    @GetMapping("/settings/basic")
    public Result getSystemConfig() {
        return Result.success(systemConfigService.getBasicSetting());
    }

    @PublicAccess
    @GetMapping("/settings/reservation")
    public Result getReservationSettings() {
        return Result.success(systemConfigService.getReservationSetting());
    }

    @RequireRoles({"admin", "super_admin"})
    @GetMapping("/settings/security")
    public Result getSecuritySettings() {
        return Result.success(systemConfigService.getSecuritySetting());
    }

    @PublicAccess
    @GetMapping("/settings/public-security")
    public Result getPublicSecuritySettings() {
        Map<String, Object> data = new HashMap<>();
        data.put("publicRegistrationEnabled", appSecurityProperties.isPublicRegistrationEnabled());
        return Result.success(data);
    }

    @RequireRoles({"admin", "super_admin"})
    @Log(module = "系统设置", type = "更新", description = "更新基本设置")
    @PostMapping("/settings/basic")
    public Result saveBasicSettings(@RequestBody BasicSetting basicSetting) {
        systemConfigService.saveBasicSetting(basicSetting);
        return Result.success();
    }

    @RequireRoles({"admin", "super_admin"})
    @Log(module = "系统设置", type = "更新", description = "更新预约设置")
    @PostMapping("/settings/reservation")
    public Result saveReservationSettings(@RequestBody ReservationSetting reservationSetting) {
        systemConfigService.saveReservationSetting(reservationSetting);
        return Result.success();
    }

    @RequireRoles({"admin", "super_admin"})
    @Log(module = "系统设置", type = "更新", description = "更新安全设置")
    @PostMapping("/settings/security")
    public Result saveSecuritySettings(@RequestBody SecuritySetting securitySetting) {
        systemConfigService.saveSecuritySetting(securitySetting);
        return Result.success();
    }

    @RequireRoles({"admin", "super_admin"})
    @PutMapping
    public Result updateSystemConfig(@RequestBody SystemConfig systemConfig) {
        systemConfigService.updateSystemConfig(systemConfig);
        return Result.success();
    }
}
