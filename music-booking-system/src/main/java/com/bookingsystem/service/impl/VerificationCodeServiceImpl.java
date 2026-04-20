package com.bookingsystem.service.impl;

import com.bookingsystem.exception.BusinessException;
import com.bookingsystem.mapper.VerificationCodeMapper;
import com.bookingsystem.pojo.VerificationCodeRecord;
import com.bookingsystem.service.VerificationCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationCodeServiceImpl implements VerificationCodeService {

    private final VerificationCodeMapper verificationCodeMapper;

    @Override
    public String issueCode(String businessType, String codeValue, int ttlMinutes, String target) {
        VerificationCodeRecord record = new VerificationCodeRecord();
        record.setBusinessType(businessType);
        record.setVerificationKey(UUID.randomUUID().toString().replace("-", ""));
        record.setCodeValue(codeValue);
        record.setTarget(target);
        record.setExpiresAt(LocalDateTime.now().plusMinutes(ttlMinutes));
        record.setConsumed(0);
        verificationCodeMapper.upsert(record);
        return record.getVerificationKey();
    }

    @Override
    public VerificationCodeRecord getCodeRecord(String businessType, String verificationKey) {
        if (!StringUtils.hasText(businessType) || !StringUtils.hasText(verificationKey)) {
            return null;
        }
        return verificationCodeMapper.selectByBusinessTypeAndVerificationKey(businessType, verificationKey);
    }

    @Override
    public void verifyCode(String businessType, String verificationKey, String inputCode, String target,
                           boolean consumeOnSuccess, String expiredMessage, String invalidMessage) {
        VerificationCodeRecord record = getCodeRecord(businessType, verificationKey);
        if (record == null || record.getConsumed() != null && record.getConsumed() == 1) {
            throw new BusinessException(invalidMessage);
        }
        if (record.getExpiresAt() == null || record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(expiredMessage);
        }
        if (StringUtils.hasText(target) && !target.equalsIgnoreCase(record.getTarget())) {
            throw new BusinessException(invalidMessage);
        }
        if (!StringUtils.hasText(inputCode)
                || !record.getCodeValue().toLowerCase(Locale.ROOT).equals(inputCode.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(invalidMessage);
        }
        if (consumeOnSuccess) {
            consume(businessType, verificationKey);
        }
    }

    @Override
    public void consume(String businessType, String verificationKey) {
        if (!StringUtils.hasText(verificationKey)) {
            return;
        }
        verificationCodeMapper.consume(businessType, verificationKey);
    }

    @Override
    public void clearExpiredCodes() {
        verificationCodeMapper.deleteExpiredCodes();
    }
}
