package com.bookingsystem.controller;

import com.bookingsystem.annotation.PublicAccess;
import com.bookingsystem.annotation.RequireRoles;
import com.bookingsystem.constants.Constants;
import com.bookingsystem.dto.RegisterInfoDTO;
import com.bookingsystem.dto.ResetPasswordDTO;
import com.bookingsystem.dto.UserLoginDTO;
import com.bookingsystem.dto.UserQueryDTO;
import com.bookingsystem.dto.UserStatusDTO;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.pojo.User;
import com.bookingsystem.security.AuthenticatedUser;
import com.bookingsystem.service.AuthorizationService;
import com.bookingsystem.service.ReservationService;
import com.bookingsystem.service.UserService;
import com.bookingsystem.service.VerificationCodeService;
import com.bookingsystem.utils.CaptchaUtil;
import com.bookingsystem.vo.CaptchaResult;
import com.bookingsystem.vo.UserQueryVo;
import com.bookingsystem.vo.UserReservationStatsVO;
import com.bookingsystem.vo.VerificationChallengeVO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private VerificationCodeService verificationCodeService;

    @GetMapping("/getUserInfo")
    public Result getUserInfo(Long userId){
        authorizationService.requireSelfOrAdmin(userId);
        User userInfoVO = userService.getById(userId);
        userInfoVO.setPassword("");
        return Result.success(userInfoVO);
    }

    @GetMapping("/captcha")
    @PublicAccess
    public Result getCaptcha(HttpServletRequest request, @RequestParam("type") Integer type) throws IOException {
        CaptchaResult captchaResult = CaptchaUtil.generateCaptcha();
        String businessType;
        switch (type){
            case 0:
                businessType = Constants.LOGIN_CAPTCHA_BIZ;
                break;
            case 1:
                businessType = Constants.REGISTER_CAPTCHA_BIZ;
                break;
            default:
                return Result.error("不支持的验证码类型");
        }
        String verificationKey = verificationCodeService.issueCode(businessType, captchaResult.getCaptchaText(), 5, null);
        return Result.success(new VerificationChallengeVO(captchaResult.getCaptchaImage(), verificationKey, 300));
    }

    @PostMapping("/login")
    @PublicAccess
    public Result login(@RequestBody UserLoginDTO userLoginDTO, HttpServletRequest request){
        Map res = userService.login(userLoginDTO,request);
        return Result.success(res);
    }

    @PostMapping("/register")
    @PublicAccess
    public Result register(@RequestBody RegisterInfoDTO registerInfoDTO,HttpServletRequest request){
        userService.register(registerInfoDTO,request);
        return Result.success();
    }

    @GetMapping("/email/code")
    @PublicAccess
    public Result sendEmail(String email,Integer type,HttpServletRequest request) throws IOException {
        Map<String, Object> response = userService.sendEmail(email,type,request);
        return Result.success(response);
    }

    @RequireRoles({"admin", "super_admin"})
    @GetMapping("/list")
    public Result list(UserQueryDTO userQueryDTO){
        log.info("获取用户列表(含条件查询):{}",userQueryDTO);
        PageResult<UserQueryVo> pageResult = userService.list(userQueryDTO);
        return Result.success(pageResult);
    }

    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id){
        authorizationService.requireSelfOrAdmin(id);
        log.info("根据id获取用户信息:{}",id);
        User user = userService.getById(id);
        user.setPassword("");
        return Result.success(user);
    }

    @PutMapping("/password")
    public Result resetPassword(@RequestBody ResetPasswordDTO resetPasswordDTO){
        authorizationService.requireCanManageUser(resetPasswordDTO.getId());
        try {
            userService.resetPassword(resetPasswordDTO);
            return Result.success();
        } catch (Exception e) {
            log.error("重置用户密码失败", e);
            return Result.error(e.getMessage());
        }
    }

    @RequireRoles({"admin", "super_admin"})
    @DeleteMapping
    public Result delete(Long[] ids){
        log.info("批量删除用户:{}", (Object) ids);
        if (ids != null) {
            for (Long id : ids) {
                authorizationService.requireCanManageUser(id);
            }
        }
        userService.delete(ids);
        return Result.success();
    }

    @RequireRoles({"admin", "super_admin"})
    @PostMapping("/status")
    public Result setStatus(@RequestBody UserStatusDTO userStatusDTO){
        log.info("启用禁用用户账号:{},{}",userStatusDTO.getStatus(),userStatusDTO.getUserId());
        Integer status = userStatusDTO.getStatus();
        Long userId = userStatusDTO.getUserId();
        authorizationService.requireCanManageUser(userId);
        userService.setStatus(status,userId);
        return Result.success();
    }

    @PutMapping("/info")
    public Result update(@RequestBody User user){
        log.info("更新用户信息: id={}, username={}", user.getId(), user.getUsername());
        if (user.getId() == null) {
            return Result.error("缺少用户ID");
        }

        AuthenticatedUser currentUser = authorizationService.getCurrentUser();
        authorizationService.requireCanManageUser(user.getId());

        if (!currentUser.isAdmin() || currentUser.getId().equals(user.getId())) {
            user.setPassword(null);
            user.setStatus(null);
            user.setUserType(null);
        } else if (!currentUser.isSuperAdmin()) {
            user.setUserType(null);
        }

        userService.update(user);
        return Result.success();
    }

    @GetMapping("/{id}/reservation-stats")
    public Result getReservationStats(@PathVariable Long id){
        authorizationService.requireSelfOrAdmin(id);
        log.info("获取用户预约统计:{}", id);
        UserReservationStatsVO stats = reservationService.getUserReservationStats(id);
        return Result.success(stats);
    }

    @RequireRoles({"admin", "super_admin"})
    @PostMapping("/add")
    public Result addUser(@RequestBody User user){
        log.info("添加用户: username={}, userType={}", user.getUsername(), user.getUserType());
        authorizationService.requireCanManageCreatedUserType(user.getUserType());
        try {
            userService.addUser(user);
            return Result.success();
        } catch (Exception e) {
            log.error("添加用户失败", e);
            return Result.error("添加用户失败: " + e.getMessage());
        }
    }
}
