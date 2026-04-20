package com.bookingsystem.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.security")
public class AppSecurityProperties {
    /**
     * 学校正式环境默认关闭自助注册。
     */
    private boolean publicRegistrationEnabled = false;
}
