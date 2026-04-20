package com.bookingsystem.mapper;

import com.bookingsystem.pojo.SystemConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface SystemConfigMapper {
    // 获取系统配置
    SystemConfig getSystemConfig();
    // 更新系统配置
    void updateSystemConfig(SystemConfig systemConfig);



    List<SystemConfig> selectAllSystemConfig();

    List<String> selectAllSystemConfigNames();


    /**
     * 获取所有系统配置，返回Map(key=system_name, value=description)
     * @return Map集合
     */
    List<Map<String, String>> getAllConfigsAsMap();


     void add(SystemConfig systemConfig);

     SystemConfig selectBySystemName(@Param("systemName") String systemName);
}
