package com.bookingsystem.controller;

import com.bookingsystem.annotation.Log;
import com.bookingsystem.annotation.PublicAccess;
import com.bookingsystem.annotation.RequireRoles;
import com.bookingsystem.pojo.Department;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.service.DeptService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 院系管理
 */
@Slf4j
@RestController
@RequestMapping("/depts")
public class DeptController {
    @Autowired
    private DeptService deptService;

    /**
     * 查询所有部门信息
     * @return
     */
    @PublicAccess
    @GetMapping
    public Result list(){
        log.info("查询所有部门信息");
        List<Department> lists = deptService.findAll();
        return Result.success(lists);
    }

    /**
     * 根据id删除部门信息
     * @param id
     * @return
     */
    @RequireRoles({"admin", "super_admin"})
    @Log(module = "部门管理", type = "删除部门", description = "根据id删除部门信息")
    @DeleteMapping
    public Result delete(Integer id){
        log.info("根据id删除部门信息:{}",id);
        deptService.deleteById(id);
        return Result.success();
    }

    /**
     * 添加部门信息
     * @param dept
     * @return
     */
    @RequireRoles({"admin", "super_admin"})
    @Log(module = "部门管理", type = "添加部门", description = "添加新的部门")
    @PostMapping
    public Result add(@RequestBody Department dept){
        log.info("添加部门信息:{}",dept);
        deptService.addDept(dept);
        return Result.success();
    }

    /**
     * 根据id查询部门信息
     * @param id
     * @return
     */
    @PublicAccess
    @GetMapping("/{id}")
    public Result getById(@PathVariable Integer id){
        log.info("根据id查询部门信息:{}",id);
        Department dept = deptService.getById(id);
        return Result.success(dept);
    }

    /**
     * 修改部门信息
     * @param dept
     * @return
     */
    @RequireRoles({"admin", "super_admin"})
    @Log(module = "部门管理", type = "修改部门", description = "修改部门信息")
    @PutMapping
    public Result update(@RequestBody Department dept){
        log.info("修改部门信息:{}",dept);
        deptService.update(dept);
        return Result.success();
    }
}
