package com.bookingsystem.task;

import com.bookingsystem.service.VerificationCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VerificationCodeCleanupTask {

    private final VerificationCodeService verificationCodeService;

    @Scheduled(fixedDelay = 300000L, initialDelay = 300000L)
    public void clearExpiredCodes() {
        verificationCodeService.clearExpiredCodes();
    }
}
