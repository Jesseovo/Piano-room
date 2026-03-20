package com.bookingsystem.service.impl;

import com.bookingsystem.constants.Constants;
import com.bookingsystem.dto.RegisterInfoDTO;
import com.bookingsystem.dto.ResetPasswordDTO;
import com.bookingsystem.dto.UserLoginDTO;
import com.bookingsystem.dto.UserQueryDTO;
import com.bookingsystem.exception.BusinessException;
import com.bookingsystem.mapper.UserMapper;
import com.alibaba.fastjson2.JSON;
import com.bookingsystem.config.InMemoryDataStore;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.pojo.SecuritySetting;
import com.bookingsystem.pojo.User;
import com.bookingsystem.service.EmailService;
import com.bookingsystem.service.UserService;
import com.bookingsystem.utils.*;
import com.bookingsystem.vo.CaptchaResult;
import com.bookingsystem.vo.UserInfoVO;
import com.bookingsystem.vo.UserQueryVo;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.bookingsystem.constants.Constants.REGISTER_EMAIL_CODE;

@Slf4j
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private  JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

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
        if (resetPasswordDTO.getOldPassword() != null){
            if (!userMapper.getById(resetPasswordDTO.getId()).getPassword().equals(Md5Util.getMD5String(resetPasswordDTO.getOldPassword()))){
                throw new BusinessException("旧密码错误");
            }
        }
        if(!resetPasswordDTO.getNewPassword().equals(resetPasswordDTO.getAgainPassword())){
            throw new BusinessException("两次密码不一致");
        }
        
        // 校验新密码长度
        int minPasswordLength = getMinPasswordLength();
        if (resetPasswordDTO.getNewPassword().length() < minPasswordLength) {
            throw new BusinessException("密码长度不能少于" + minPasswordLength + "位");
        }
        
        String newPassword = Md5Util.getMD5String(resetPasswordDTO.getNewPassword());
        userMapper.resetPassword(resetPasswordDTO.getId(), newPassword);
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

        try {
            String username = userLoginDTO.getUsername();
            User userDb = userMapper.selectByUsername(username);

            String code = userLoginDTO.getCaptcha();
            String captchaCodeDb = (String) SessionUtil.getAttribute(request, Constants.LOGIN_IMG_CODE);
            if (null == code || null == captchaCodeDb || !captchaCodeDb.equalsIgnoreCase(code)){
                throw new BusinessException("验证码错误");
            }

            if (userDb == null){
                throw new BusinessException("用户名或密码错误");
            }

            String password = userLoginDTO.getPassword();
            String md5String = Md5Util.getMD5String(password);
            if (!userDb.getPassword().equals(Md5Util.getMD5String(password))){
                throw new BusinessException("用户名或密码错误");
            }
            if (userDb.getStatus() == 0){
                throw new BusinessException("用户已被禁用");
            }
            // 检查是否在封禁期内
            if (userDb.getBanUntil() != null && userDb.getBanUntil().isAfter(LocalDateTime.now())) {
                String banUntilStr = userDb.getBanUntil().toString().replace("T", " ").substring(0, 16);
                throw new BusinessException("账号因违约被封禁，封禁到期时间：" + banUntilStr);
            }


            //用户返回信息
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
            //token
            String token = jwtUtil.generateToken(userDb.getUsername());

            userDb.setLastLoginTime(LocalDateTime.now());
            //获取登录ip
            userDb.setLastLoginIp(IpUtils.getClientIp(request));
            log.info("用户登录:{}",userDb);
            userMapper.update(userDb);

            Map res = new HashMap<>();
            res.put("user",userInfoVO);
            res.put("token",token);
            return res;

        }finally {
            SessionUtil.removeAttribute(request, Constants.LOGIN_IMG_CODE);
        }

    }

    @Override
    public void update(User user) {
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.update(user);
    }

    @Autowired
    private InMemoryDataStore inMemoryDataStore;

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
                // 解析失败使用默认值
            }
        }
        return 6; // 默认6位
    }

    @Override
    public void addUser(User user) {
        // 校验用户名是否已存在
        if (userMapper.selectByUsername(user.getUsername()) != null) {
            throw new BusinessException("用户名已被注册");
        }

        // 校验必填字段
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new BusinessException("密码不能为空");
        }

        // 校验密码长度
        int minPasswordLength = getMinPasswordLength();
        if (user.getPassword().length() < minPasswordLength) {
            throw new BusinessException("密码长度不能少于" + minPasswordLength + "位");
        }

        // 设置默认值
        user.setPassword(Md5Util.getMD5String(user.getPassword())); // 加密密码
        user.setStatus(Constants.ONE); // 默认启用
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userMapper.insert(user);
    }

    @Override
    public void register(RegisterInfoDTO registerInfoDTO, HttpServletRequest request) {
        //图形验证码校验
        String captchaCode = registerInfoDTO.getCaptchaCode();
        String captchaCodeDb = (String) SessionUtil.getAttribute(request, Constants.REGISTER_IMG_CODE);
        try {
            if (null == captchaCode || null == captchaCodeDb || !captchaCodeDb.equalsIgnoreCase(captchaCode)){
                throw new BusinessException("验证码错误");
            }
        } finally {
                SessionUtil.removeAttribute(request, Constants.REGISTER_IMG_CODE);
        }

        //邮箱验证码校验
        boolean attributeExpired = SessionUtil.isAttributeExpired(request, REGISTER_EMAIL_CODE);
        if (attributeExpired) throw new BusinessException("验证码已过期,请重新获取");

        String emailCodeDb = (String) SessionUtil.getAttribute(request, REGISTER_EMAIL_CODE);
        if (!emailCodeDb.equalsIgnoreCase(registerInfoDTO.getEmailCode())) throw new BusinessException("邮箱验证码错误");

        //校验用户名
        String username = registerInfoDTO.getUsername();
        if (userMapper.selectByUsername(username) != null) throw new BusinessException("用户名已被注册");

        // 校验密码长度
        int minPasswordLength = getMinPasswordLength();
        if (registerInfoDTO.getPassword().length() < minPasswordLength) {
            throw new BusinessException("密码长度不能少于" + minPasswordLength + "位");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(Md5Util.getMD5String(registerInfoDTO.getPassword()));
        user.setRealName(registerInfoDTO.getRealName());
        user.setEmail(registerInfoDTO.getEmail());
        user.setStatus(Constants.ONE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setStudentId(registerInfoDTO.getStudentId());

        userMapper.insert(user);


    }

    @Override
    public void sendEmail(String email, Integer type,HttpServletRequest request) throws IOException {

        if (null == email){
            throw new BusinessException("邮箱不能为空");
        }

        CaptchaResult captchaResult = CaptchaUtil.generateCaptcha();
        Map<String, Object> variables = new HashMap<>();
        variables.put("code", captchaResult.getCaptchaText());
        variables.put("userName", "尊敬的用户");
        variables.put("currentYear", Year.now().getValue());

        switch (type){
            case 0:
                variables.put("validTime", "15分钟");
                SessionUtil.setAttributeWithExpiration(request,REGISTER_EMAIL_CODE, captchaResult.getCaptchaText(), 15);
                emailService.sendTemplateMail(email, "注册验证码", Constants.EMAIL_CODE_TEMPLATE, variables);
                break;
        }

    }

    public static void main(String[] args) {
        String md5String = Md5Util.getMD5String("123456");
        System.out.println("md5String = " + md5String);
    }
}
