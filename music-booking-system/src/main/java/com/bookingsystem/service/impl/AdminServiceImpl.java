package com.bookingsystem.service.impl;

import com.bookingsystem.dto.UserQueryDTO;
import com.bookingsystem.mapper.UserMapper;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.User;
import com.bookingsystem.service.AdminService;
import com.bookingsystem.service.PasswordService;
import com.bookingsystem.vo.UserQueryVo;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordService passwordService;

    @Override
    public PageResult<UserQueryVo> list(UserQueryDTO userQueryDTO) {
        PageHelper.startPage(userQueryDTO.getPage(), userQueryDTO.getPageSize());
        List<UserQueryVo> list = userMapper.selectAdmins(userQueryDTO);
        Page<UserQueryVo> page = (Page<UserQueryVo>) list;
        return new PageResult<>(page.getTotal(), page.getResult());
    }

    @Override
    public User getById(Long id) {
        return userMapper.getById(id);
    }

    @Override
    public void resetPassword(Long id, String password) {
        userMapper.resetPassword(id, passwordService.encode(password));
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
    public void update(User user) {
        if (StringUtils.hasText(user.getPassword())) {
            User currentUser = userMapper.getById(user.getId());
            user.setPassword(passwordService.encode(user.getPassword()));
            user.setTokenVersion((currentUser.getTokenVersion() == null ? 0 : currentUser.getTokenVersion()) + 1);
        }
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.update(user);
    }

    @Override
    public void save(User user) {
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setTokenVersion(0);
        user.setPassword(passwordService.encode(user.getPassword()));
        userMapper.insert(user);
    }
}
