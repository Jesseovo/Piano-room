package com.bookingsystem.dto;

import lombok.Data;

@Data
public class UserLoginDTO {
    private String username;
    private String password;
    private String captcha;
    private String captchaKey;
}
