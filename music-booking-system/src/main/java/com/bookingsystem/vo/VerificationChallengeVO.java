package com.bookingsystem.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationChallengeVO {
    private String image;
    private String verificationKey;
    private long expiresInSeconds;
}
