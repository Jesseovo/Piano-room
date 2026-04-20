package com.bookingsystem.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindingResult;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.lang.reflect.Array;
import java.util.Map;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * 统一对日志中的敏感字段进行脱敏。
 */
@Component
@RequiredArgsConstructor
public class SensitiveDataSanitizer {

    private static final String MASK = "***";
    private static final int MAX_LOG_LENGTH = 4000;
    private static final Set<String> SENSITIVE_FIELDS = Set.of(
            "password",
            "oldpassword",
            "newpassword",
            "againpassword",
            "token",
            "authorization",
            "accesstoken",
            "refreshtoken",
            "jwt",
            "secret",
            "captcha",
            "captchacode",
            "captchatext",
            "emailcode",
            "verificationcode",
            "code"
    );
    private static final Pattern BEARER_PATTERN = Pattern.compile("Bearer\\s+[^\\s]+", Pattern.CASE_INSENSITIVE);
    private static final Pattern JWT_PATTERN = Pattern.compile("\\b[A-Za-z0-9\\-_]+=*\\.[A-Za-z0-9\\-_]+=*\\.[A-Za-z0-9\\-_=+/]+\\b");

    private final ObjectMapper objectMapper;

    public String sanitize(Object value) {
        if (value == null) {
            return null;
        }
        try {
            JsonNode sanitizedNode = sanitizeNode(toSafeJsonNode(value), null);
            return truncate(objectMapper.writeValueAsString(sanitizedNode));
        } catch (JsonProcessingException e) {
            return truncate(sanitizeText(String.valueOf(value)));
        }
    }

    public String sanitizeText(String text) {
        if (text == null || text.isBlank()) {
            return text;
        }
        String sanitized = BEARER_PATTERN.matcher(text).replaceAll(MASK);
        sanitized = JWT_PATTERN.matcher(sanitized).replaceAll(MASK);
        return truncate(sanitized);
    }

    private JsonNode toSafeJsonNode(Object value) {
        if (value == null) {
            return JsonNodeFactory.instance.nullNode();
        }
        if (value instanceof HttpServletRequest) {
            return TextNode.valueOf("[HttpServletRequest]");
        }
        if (value instanceof HttpServletResponse) {
            return TextNode.valueOf("[HttpServletResponse]");
        }
        if (value instanceof MultipartFile multipartFile) {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("type", "MultipartFile");
            node.put("name", multipartFile.getName());
            node.put("originalFilename", multipartFile.getOriginalFilename());
            node.put("size", multipartFile.getSize());
            return node;
        }
        if (value instanceof BindingResult) {
            return TextNode.valueOf("[BindingResult]");
        }
        if (value instanceof Map<?, ?> map) {
            ObjectNode node = objectMapper.createObjectNode();
            map.forEach((key, entryValue) -> node.set(String.valueOf(key), toSafeJsonNode(entryValue)));
            return node;
        }
        if (value instanceof Iterable<?> iterable) {
            ArrayNode node = objectMapper.createArrayNode();
            iterable.forEach(item -> node.add(toSafeJsonNode(item)));
            return node;
        }
        if (value.getClass().isArray()) {
            ArrayNode node = objectMapper.createArrayNode();
            int length = Array.getLength(value);
            for (int i = 0; i < length; i++) {
                node.add(toSafeJsonNode(Array.get(value, i)));
            }
            return node;
        }
        return objectMapper.valueToTree(value);
    }

    private JsonNode sanitizeNode(JsonNode node, String fieldName) {
        if (fieldName != null && isSensitiveField(fieldName)) {
            return TextNode.valueOf(MASK);
        }
        if (node == null || node.isNull()) {
            return JsonNodeFactory.instance.nullNode();
        }
        if (node.isObject()) {
            ObjectNode source = (ObjectNode) node;
            ObjectNode target = objectMapper.createObjectNode();
            source.fields().forEachRemaining(entry ->
                    target.set(entry.getKey(), sanitizeNode(entry.getValue(), entry.getKey())));
            return target;
        }
        if (node.isArray()) {
            ArrayNode source = (ArrayNode) node;
            ArrayNode target = objectMapper.createArrayNode();
            source.forEach(child -> target.add(sanitizeNode(child, fieldName)));
            return target;
        }
        if (node.isTextual()) {
            return TextNode.valueOf(sanitizeText(node.asText()));
        }
        return node;
    }

    private boolean isSensitiveField(String fieldName) {
        return SENSITIVE_FIELDS.contains(fieldName.toLowerCase(Locale.ROOT));
    }

    private String truncate(String value) {
        if (value == null || value.length() <= MAX_LOG_LENGTH) {
            return value;
        }
        return value.substring(0, MAX_LOG_LENGTH) + "...(truncated)";
    }
}
