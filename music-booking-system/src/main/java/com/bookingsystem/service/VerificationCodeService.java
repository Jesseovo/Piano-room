package com.bookingsystem.service;

import com.bookingsystem.pojo.VerificationCodeRecord;

public interface VerificationCodeService {
    String issueCode(String businessType, String codeValue, int ttlMinutes, String target);

    VerificationCodeRecord getCodeRecord(String businessType, String verificationKey);

    void verifyCode(String businessType, String verificationKey, String inputCode, String target,
                    boolean consumeOnSuccess, String expiredMessage, String invalidMessage);

    void consume(String businessType, String verificationKey);

    void clearExpiredCodes();
}
