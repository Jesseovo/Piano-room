package com.bookingsystem.pojo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VerificationCodeRecord {
    private Long id;
    private String businessType;
    private String verificationKey;
    private String codeValue;
    private String target;
    private LocalDateTime expiresAt;
    private Integer consumed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
