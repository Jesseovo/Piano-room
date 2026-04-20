package com.bookingsystem.service.impl;

import com.alibaba.fastjson2.JSON;
import com.bookingsystem.config.AppSecurityProperties;
import com.bookingsystem.config.InMemoryDataStore;
import com.bookingsystem.constants.Constants;
import com.bookingsystem.dto.RegisterInfoDTO;
import com.bookingsystem.dto.ResetPasswordDTO;
import com.bookingsystem.dto.UserLoginDTO;
import com.bookingsystem.dto.UserQueryDTO;
import com.bookingsystem.exception.BusinessException;
import com.bookingsystem.mapper.UserMapper;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.SecuritySetting;
import com.bookingsystem.pojo.User;
import com.bookingsystem.service.EmailService;
import com.bookingsystem.service.PasswordService;
import com.bookingsystem.service.UserService;
import com.bookingsystem.service.VerificationCodeService;
import com.bookingsystem.utils.CaptchaUtil;
import com.bookingsystem.utils.IpUtils;
import com.bookingsystem.utils.JwtUtil;
import com.bookingsystem.vo.CaptchaResult;
import com.bookingsystem.vo.UserInfoVO;
import com.bookingsystem.vo.UserQueryVo;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private VerificationCodeService verificationCodeService;

    @Autowired
    private AppSecurityProperties appSecurityProperties;

    @Autowired
    private InMemoryDataStore inMemoryDataStore;

    @Override
    public PageResult<UserQueryVo> list(UserQueryDTO userQueryDTO) {
        PageHelper.startPage(userQueryDTO.getPage(), userQueryDTO.getPageSize());
        List<UserQueryVo> list = userMapper.list(userQueryDTO);
        Page<UserQueryVo> page = (Page<UserQueryVo>) list;
        return new PageResult<>(page.getTotal(), page.getResult());
    }

    @Override
    public User getById(Long id) {
        return userMapper.getById(id);
    }

    @Override
    public void resetPassword(ResetPasswordDTO resetPasswordDTO) throws BusinessException {
        User userDb = userMapper.getById(resetPasswordDTO.getId());
        if (userDb == null) {
            throw new BusinessException("用户不存在");
        }
        if (resetPasswordDTO.getOldPassword() != null
                && !passwordService.matches(resetPasswordDTO.getOldPassword(), userDb.getPassword())) {
            throw new BusinessException("旧密码错误");
        }
        if (!resetPasswordDTO.getNewPassword().equals(resetPasswordDTO.getAgainPassword())) {
            throw new BusinessException("两次密码不一致");
        }

        int minPasswordLength = getMinPasswordLength();
        if (resetPasswordDTO.getNewPassword().length() < minPasswordLength) {
            throw new BusinessException("密码长度不能少于" + minPasswordLength + "位");
        }

        userMapper.resetPassword(resetPasswordDTO.getId(), passwordService.encode(resetPasswordDTO.getNewPassword()));
    }

    @Override
    public void delete(Long[] ids) {
        userMapper.delete(ids);
    }

    @Override
    public void setStatus(Integer status, Long id) {
        userMapper.setStatus(status, id);
    }

    @Override
    public Map login(UserLoginDTO userLoginDTO, HttpServletRequest request) {
        verificationCodeService.verifyCode(
                Constants.LOGIN_CAPTCHA_BIZ,
                userLoginDTO.getCaptchaKey(),
                userLoginDTO.getCaptcha(),
                null,
                true,
                "验证码已过期，请刷新后重试",
                "验证码错误"
        );

        String username = userLoginDTO.getUsername();
        User userDb = userMapper.selectByUsername(username);
        if (userDb == null) {
            throw new BusinessException("用户名或密码错误");
        }

        String password = userLoginDTO.getPassword();
        if (!passwordService.matches(password, userDb.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        if (passwordService.needsUpgrade(userDb.getPassword())) {
            userMapper.migratePassword(userDb.getId(), passwordService.encode(password));
            userDb = userMapper.selectByUsername(username);
        }
        if (userDb.getStatus() != null && userDb.getStatus() == 0) {
            throw new BusinessException("用户已被禁用");
        }
        if (userDb.getBanUntil() != null && userDb.getBanUntil().isAfter(LocalDateTime.now())) {
            String banUntilStr = userDb.getBanUntil().toString().replace("T", " ").substring(0, 16);
            throw new BusinessException("账号因违约被封禁，封禁到期时间：" + banUntilStr);
        }

        UserInfoVO userInfoVO = new UserInfoVO();
        userInfoVO.setUsername(userDb.getUsername());
        userInfoVO.setAvatarUrl(userDb.getAvatarUrl());
        userInfoVO.setStudentId(userDb.getStudentId());
        userInfoVO.setRealName(userDb.getRealName());
        userInfoVO.setId(userDb.getId());
        userInfoVO.setEmail(userDb.getEmail());
        userInfoVO.setPhone(userDb.getPhone());
        userInfoVO.setUserType(userDb.getUserType());
        userInfoVO.setViolationCount(userDb.getViolationCount() != null ? userDb.getViolationCount() : 0);
        userInfoVO.setBanUntil(userDb.getBanUntil());

        String token = jwtUtil.generateToken(userDb);

        User updateLoginInfo = new User();
        updateLoginInfo.setId(userDb.getId());
        updateLoginInfo.setLastLoginTime(LocalDateTime.now());
        updateLoginInfo.setLastLoginIp(IpUtils.getClientIp(request));
        updateLoginInfo.setUpdatedAt(LocalDateTime.now());
        userMapper.update(updateLoginInfo);

        Map<String, Object> res = new HashMap<>();
        res.put("user", userInfoVO);
        res.put("token", token);
        return res;
    }

    @Override
    public void update(User user) {
        if (StringUtils.hasText(user.getPassword())) {
            User currentUser = userMapper.getById(user.getId());
            if (currentUser == null) {
                throw new BusinessException("用户不存在");
            }
            user.setPassword(passwordService.encode(user.getPassword()));
            user.setTokenVersion((currentUser.getTokenVersion() == null ? 0 : currentUser.getTokenVersion()) + 1);
        }
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.update(user);
    }

    /**
     * 获取最小密码长度（从系统配置读取，默认6位）
     */
    private int getMinPasswordLength() {
        String setting = inMemoryDataStore.get("securitySetting");
        if (setting != null) {
            try {
                SecuritySetting securitySetting = JSON.parseObject(setting, SecuritySetting.class);
                if (securitySetting != null && securitySetting.getMinPasswordLength() != null) {
                    return securitySetting.getMinPasswordLength();
                }
            } catch (Exception e) {
                log.warn("解析安全设置失败，已回退默认密码长度", e);
            }
        }
        return 6;
    }

    @Override
    public void addUser(User user) {
        if (userMapper.selectByUsername(user.getUsername()) != null) {
            throw new BusinessException("用户名已被注册");
        }
        if (!StringUtils.hasText(user.getPassword())) {
            throw new BusinessException("密码不能为空");
        }

        int minPasswordLength = getMinPasswordLength();
        if (user.getPassword().length() < minPasswordLength) {
            throw new BusinessException("密码长度不能少于" + minPasswordLength + "位");
        }

        user.setPassword(passwordService.encode(user.getPassword()));
        user.setStatus(Constants.ONE);
        user.setTokenVersion(0);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(user);
    }

    @Override
    public void register(RegisterInfoDTO registerInfoDTO, HttpServletRequest request) {
        if (!appSecurityProperties.isPublicRegistrationEnabled()) {
            throw new BusinessException("学校正式环境已关闭自助注册，请联系管理员开通账号");
        }

        verificationCodeService.verifyCode(
                Constants.REGISTER_CAPTCHA_BIZ,
                registerInfoDTO.getCaptchaKey(),
                registerInfoDTO.getCaptchaCode(),
                null,
                true,
                "验证码已过期，请刷新后重试",
                "验证码错误"
        );

        verificationCodeService.verifyCode(
                Constants.REGISTER_EMAIL_BIZ,
                registerInfoDTO.getEmailCodeKey(),
                registerInfoDTO.getEmailCode(),
                registerInfoDTO.getEmail(),
                false,
                "邮箱验证码已过期，请重新获取",
                "邮箱验证码错误"
        );

        String username = registerInfoDTO.getUsername();
        if (userMapper.selectByUsername(username) != null) {
            throw new BusinessException("用户名已被注册");
        }

        int minPasswordLength = getMinPasswordLength();
        if (registerInfoDTO.getPassword().length() < minPasswordLength) {
            throw new BusinessException("密码长度不能少于" + minPasswordLength + "位");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordService.encode(registerInfoDTO.getPassword()));
        user.setRealName(registerInfoDTO.getRealName());
        user.setEmail(registerInfoDTO.getEmail());
        user.setStatus(Constants.ONE);
        user.setTokenVersion(0);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setStudentId(registerInfoDTO.getStudentId());

        userMapper.insert(user);
        verificationCodeService.consume(Constants.REGISTER_EMAIL_BIZ, registerInfoDTO.getEmailCodeKey());
    }

    @Override
    public Map<String, Object> sendEmail(String email, Integer type, HttpServletRequest request) throws IOException {
        if (!StringUtils.hasText(email)) {
            throw new BusinessException("邮箱不能为空");
        }

        CaptchaResult captchaResult = CaptchaUtil.generateCaptcha();
        Map<String, Object> variables = new HashMap<>();
        variables.put("code", captchaResult.getCaptchaText());
        variables.put("userName", "尊敬的用户");
        variables.put("currentYear", Year.now().getValue());
        variables.put("validTime", "15分钟");

        Map<String, Object> response = new HashMap<>();
        String verificationKey;

        switch (type) {
            case 0:
                if (!appSecurityProperties.isPublicRegistrationEnabled()) {
                    throw new BusinessException("学校正式环境已关闭自助注册，请联系管理员开通账号");
                }
                verificationKey = verificationCodeService.issueCode(
                        Constants.REGISTER_EMAIL_BIZ,
                        captchaResult.getCaptchaText(),
                        15,
                        email
                );
                emailService.sendTemplateMail(email, "注册验证码", Constants.EMAIL_CODE_TEMPLATE, variables);
                break;
            case 1:
                verificationKey = verificationCodeService.issueCode(
                        Constants.PASSWORD_RESET_EMAIL_BIZ,
                        captchaResult.getCaptchaText(),
                        15,
                        email
                );
                emailService.sendTemplateMail(email, "找回密码验证码", Constants.EMAIL_CODE_TEMPLATE, variables);
                break;
            default:
                throw new BusinessException("不支持的验证码类型");
        }

        response.put("verificationKey", verificationKey);
        response.put("expiresInSeconds", 900);
        return response;
    }
}
