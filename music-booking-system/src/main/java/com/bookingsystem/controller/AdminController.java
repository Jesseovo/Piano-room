package com.bookingsystem.controller;

import com.bookingsystem.annotation.Log;
import com.bookingsystem.annotation.SuperAdmin;
import com.bookingsystem.dto.UserQueryDTO;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.pojo.User;
import com.bookingsystem.service.AdminService;
import com.bookingsystem.vo.UserQueryVo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/admins")
@SuperAdmin
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * 获取用户列表(含条件查询)
     */
    @GetMapping("/list")
    public Result list(UserQueryDTO userQueryDTO){
        log.info("获取用户列表(含条件查询):{}",userQueryDTO);
        PageResult<UserQueryVo> pageResult = adminService.list(userQueryDTO);
        return Result.success(pageResult);
    }

    /**
     * 新增用户
     * @param user
     * @return
     */
    @Log(module = "管理员管理", type = "添加管理员", description = "添加新的管理员")
    @PostMapping
    public Result save(@RequestBody User user){
        log.info("创建管理员账号: username={}, userType={}", user.getUsername(), "admin");
        user.setUserType("admin");
        adminService.save(user);
        return Result.success();
    }

    /**
     * 根据id获取用户信息
     */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id){
        log.info("根据id获取用户信息:{}",id);
        User user = adminService.getById(id);
        return Result.success(user);
    }
    /**
     * 重置用户密码
     */
    @Log(module = "管理员管理", type = "重置密码", description = "重置管理员密码")
    @PutMapping
    public Result resetPassword(Long id,String password, String againPassword){
        if(!password.equals(againPassword)){
            return Result.error("两次密码不一致");
        }
        adminService.resetPassword(id,password);
        return Result.success();
    }

    /**
     * 批量删除用户
     */
    @Log(module = "管理员管理", type = "删除管理员", description = "根据id删除管理员")
    @DeleteMapping
    public Result delete(@RequestBody Long[] ids){
        log.info("批量删除用户:{}",ids);
        adminService.delete(ids);
        return Result.success();
    }
    /**
     * 启用禁用用户账号
     */
    @Log(module = "管理员管理", type = "禁用管理员", description = "禁用管理员账号")
    @PostMapping("/status/{status}")
    public Result setStatus(Long id, @PathVariable Integer status){
        log.info("启用禁用用户账号:{},{}",status,id);
        adminService.setStatus(status,id);
        return Result.success();
    }

    /**
     * 更新用户信息
     */
    @Log(module = "管理员管理", type = "更新管理员", description = "更新管理员信息")
    @PutMapping("/info")
    public Result update(@RequestBody User user){
        log.info("更新管理员信息: id={}, username={}", user.getId(), user.getUsername());
        user.setUserType("admin");
        adminService.update(user);
        return Result.success();
    }
}
