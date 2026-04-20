package com.bookingsystem.service;

import com.bookingsystem.dto.RegisterInfoDTO;
import com.bookingsystem.dto.ResetPasswordDTO;
import com.bookingsystem.dto.UserLoginDTO;
import com.bookingsystem.dto.UserQueryDTO;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.User;
import com.bookingsystem.vo.UserInfoVO;
import com.bookingsystem.vo.UserQueryVo;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.Map;

public interface UserService {
    PageResult<UserQueryVo> list(UserQueryDTO userQueryDTO);

    User getById(Long id);

    void resetPassword(ResetPasswordDTO resetPasswordDTO);

    void delete(Long[] ids);

    void setStatus(Integer status, Long id);

    Map login(UserLoginDTO userLoginDTO, HttpServletRequest request);

    void update(User user);

    void addUser(User user);

    void register(RegisterInfoDTO registerInfoDTO, HttpServletRequest request);

    /**
     * 发送邮件
     * @param email
     * @param type
     */
    Map<String, Object> sendEmail(String email, Integer type,HttpServletRequest request) throws IOException;
}
