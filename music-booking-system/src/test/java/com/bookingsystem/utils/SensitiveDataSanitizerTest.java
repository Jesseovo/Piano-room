package com.bookingsystem.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SensitiveDataSanitizerTest {

    private final SensitiveDataSanitizer sanitizer = new SensitiveDataSanitizer(new ObjectMapper());

    @Test
    void sanitizeMasksSensitiveFieldsRecursively() {
        Map<String, Object> payload = Map.of(
                "username", "student1",
                "password", "123456",
                "nested", Map.of(
                        "token", "Bearer abc.def.ghi",
                        "emailCode", "888888"
                ),
                "items", List.of(Map.of("captcha", "ABCD"))
        );

        String sanitized = sanitizer.sanitize(payload);

        assertTrue(sanitized.contains("\"password\":\"***\""));
        assertTrue(sanitized.contains("\"token\":\"***\""));
        assertTrue(sanitized.contains("\"emailCode\":\"***\""));
        assertTrue(sanitized.contains("\"captcha\":\"***\""));
        assertFalse(sanitized.contains("123456"));
        assertFalse(sanitized.contains("abc.def.ghi"));
        assertFalse(sanitized.contains("888888"));
    }

    @Test
    void sanitizeReplacesMultipartFileContentWithMetadata() {
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", "secret".getBytes());

        String sanitized = sanitizer.sanitize(new Object[]{file});

        assertTrue(sanitized.contains("\"type\":\"MultipartFile\""));
        assertTrue(sanitized.contains("\"originalFilename\":\"avatar.png\""));
        assertFalse(sanitized.contains("secret"));
    }

    @Test
    void sanitizeTextMasksBearerAndJwtTokens() {
        String sanitized = sanitizer.sanitizeText("Authorization: Bearer abc.def.ghi jwt=abc.def.ghi");

        assertFalse(sanitized.contains("abc.def.ghi"));
        assertTrue(sanitized.contains("***"));
    }
}
