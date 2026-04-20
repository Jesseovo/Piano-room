package com.bookingsystem.service;

import com.bookingsystem.utils.Md5Util;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

@Service
public class PasswordService {

    private static final Pattern BCRYPT_PATTERN = Pattern.compile("^\\$2[aby]?\\$\\d{2}\\$.*$");

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String encode(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public boolean matches(String rawPassword, String storedPassword) {
        if (!StringUtils.hasText(rawPassword) || !StringUtils.hasText(storedPassword)) {
            return false;
        }
        if (isBcryptHash(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return Md5Util.getMD5String(rawPassword).equalsIgnoreCase(storedPassword);
    }

    public boolean needsUpgrade(String storedPassword) {
        return StringUtils.hasText(storedPassword) && !isBcryptHash(storedPassword);
    }

    private boolean isBcryptHash(String storedPassword) {
        return BCRYPT_PATTERN.matcher(storedPassword).matches();
    }
}
