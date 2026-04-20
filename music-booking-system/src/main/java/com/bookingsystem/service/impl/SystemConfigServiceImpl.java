package com.bookingsystem.service.impl;

import com.alibaba.fastjson2.JSON;
import com.bookingsystem.config.InMemoryDataStore;
import com.bookingsystem.enums.SettingsEnums;
import com.bookingsystem.mapper.SystemConfigMapper;
import com.bookingsystem.pojo.BasicSetting;
import com.bookingsystem.pojo.ReservationSetting;
import com.bookingsystem.pojo.SecuritySetting;
import com.bookingsystem.pojo.SystemConfig;
import com.bookingsystem.service.SystemConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.function.Supplier;

@Slf4j
@Service
public class SystemConfigServiceImpl implements SystemConfigService {

    @Autowired
    private SystemConfigMapper systemConfigMapper;

    @Autowired
    private InMemoryDataStore inMemoryDataStore;

    @Override
    public SystemConfig getSystemConfig() {
        return systemConfigMapper.getSystemConfig();
    }

    @Override
    public BasicSetting getBasicSetting() {
        return getSetting(SettingsEnums.BASE_SETTING.getName(), BasicSetting.class, BasicSetting::new);
    }

    @Override
    public ReservationSetting getReservationSetting() {
        return getSetting(SettingsEnums.RESERVATION_SETTING.getName(), ReservationSetting.class, ReservationSetting::new);
    }

    @Override
    public SecuritySetting getSecuritySetting() {
        return getSetting(SettingsEnums.SECURITY_SETTING.getName(), SecuritySetting.class, SecuritySetting::new);
    }

    @Override
    @Transactional
    public void updateSystemConfig(SystemConfig systemConfig) {
        systemConfig.setUpdatedAt(LocalDateTime.now());
        systemConfigMapper.updateSystemConfig(systemConfig);
        inMemoryDataStore.put(systemConfig.getSystemName(), systemConfig.getDescription());
    }

    @Override
    @Transactional
    public void saveBasicSetting(BasicSetting basicSetting) {
        saveSetting(SettingsEnums.BASE_SETTING.getName(), basicSetting);
    }

    @Override
    @Transactional
    public void saveReservationSetting(ReservationSetting reservationSetting) {
        saveSetting(SettingsEnums.RESERVATION_SETTING.getName(), reservationSetting);
    }

    @Override
    @Transactional
    public void saveSecuritySetting(SecuritySetting securitySetting) {
        saveSetting(SettingsEnums.SECURITY_SETTING.getName(), securitySetting);
    }

    @Override
    public void refreshSettingsCache() {
        Map<String, String> currentCache = inMemoryDataStore.getAll();
        currentCache.keySet().forEach(inMemoryDataStore::remove);
        systemConfigMapper.getAllConfigsAsMap()
                .forEach(item -> inMemoryDataStore.put(item.get("key"), item.get("value")));
    }

    private <T> T getSetting(String key, Class<T> type, Supplier<T> defaultSupplier) {
        String cachedValue = inMemoryDataStore.get(key);
        if (!StringUtils.hasText(cachedValue)) {
            SystemConfig dbConfig = systemConfigMapper.selectBySystemName(key);
            if (dbConfig == null || !StringUtils.hasText(dbConfig.getDescription())) {
                T defaultValue = defaultSupplier.get();
                saveSetting(key, defaultValue);
                return defaultValue;
            }
            cachedValue = dbConfig.getDescription();
            inMemoryDataStore.put(key, cachedValue);
        }

        try {
            return JSON.parseObject(cachedValue, type);
        } catch (Exception e) {
            log.warn("系统配置解析失败，已回退默认值。key={}", key, e);
            T defaultValue = defaultSupplier.get();
            saveSetting(key, defaultValue);
            return defaultValue;
        }
    }

    private void saveSetting(String key, Object value) {
        String jsonValue = JSON.toJSONString(value);
        SystemConfig existingConfig = systemConfigMapper.selectBySystemName(key);
        if (existingConfig == null) {
            SystemConfig systemConfig = new SystemConfig();
            systemConfig.setSystemName(key);
            systemConfig.setDescription(jsonValue);
            systemConfigMapper.add(systemConfig);
        } else {
            existingConfig.setDescription(jsonValue);
            existingConfig.setUpdatedAt(LocalDateTime.now());
            systemConfigMapper.updateSystemConfig(existingConfig);
        }
        inMemoryDataStore.put(key, jsonValue);
    }
}
