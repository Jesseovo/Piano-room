package com.bookingsystem.config;

import com.bookingsystem.enums.SettingsEnums;
import com.bookingsystem.mapper.SystemConfigMapper;

import com.bookingsystem.pojo.SystemConfig;
import com.bookingsystem.utils.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.util.*;

/**
 * 系统初始化配置
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class SystemInitConfig {

//    private final SystemSettingsRepository systemSettingsRepository;

    @Autowired
    private InMemoryDataStore inMemoryDataStore;

    @Autowired
    private SystemConfigMapper systemConfigMapper;


    /**
     * 系统启动时初始化配置
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CommandLineRunner initSystemSettings() {
        return args -> {
            try {
                log.info("正在检查系统基础配置...");

                List<String> notExistsConfigs = new ArrayList<>();

                List<String> systemConfigsDb = systemConfigMapper.selectAllSystemConfigNames();

                List<SettingsEnums> all = SettingsEnums.getAll();
                all.forEach(item -> {
                    String name = item.getName();
                    boolean contains = systemConfigsDb.contains(name);
                    if (!contains){
                        notExistsConfigs.add(name);
                    }
                });
                notExistsConfigs.forEach(item->{
                    SettingsEnums settingsEnums = SettingsEnums.getByName(item);
                    Object value = settingsEnums.createDefaultValue();
                    String name = settingsEnums.getName();
                    SystemConfig systemConfig = new SystemConfig();
                    systemConfig.setSystemName(name);
                    systemConfig.setDescription(JsonUtils.toJsonWithNulls(value));
                    systemConfigMapper.add(systemConfig);
                });

                Map<String, String> allConfigsMap = getAllConfigsMap();
                allConfigsMap.entrySet().forEach(item -> {
                            inMemoryDataStore.put(item.getKey(), item.getValue());
                        }
                );
                log.info("系统基础配置初始化完成");
            } catch (Exception e) {
                e.printStackTrace();
                log.error("系统基础配置初始化失败");
            }
        };
    }

    /**
     * 获取所有配置，转换为Map(key=system_name, value=description)
     * @return 配置Map
     */
    public Map<String, String> getAllConfigsMap() {
        List<Map<String, String>> configs = systemConfigMapper.getAllConfigsAsMap();

        // 转换为期望的Map格式
        Map<String, String> result = new HashMap<>();
        for (Map<String, String> config : configs) {
            result.put((String) config.get("key"), config.get("value"));
        }

        return result;
    }


}
