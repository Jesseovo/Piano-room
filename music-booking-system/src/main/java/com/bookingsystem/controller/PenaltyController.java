package com.bookingsystem.controller;

import com.bookingsystem.annotation.PublicAccess;
import com.bookingsystem.annotation.RequireRoles;
import com.bookingsystem.pojo.PenaltyRule;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.service.PenaltyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/system/penalty-rules")
public class PenaltyController {

    @Autowired
    private PenaltyService penaltyService;

    /**
     * 获取所有惩罚规则（供管理员查看和配置）
     */
    @PublicAccess
    @GetMapping
    public Result listRules() {
        return Result.success(penaltyService.listRules());
    }

    /**
     * 管理员修改惩罚规则
     */
    @RequireRoles({"admin", "super_admin"})
    @PutMapping("/{id}")
    public Result updateRule(@PathVariable Long id, @RequestBody PenaltyRule rule) {
        rule.setId(id);
        penaltyService.updateRule(rule);
        return Result.success();
    }

    /**
     * 管理员解除用户封禁
     */
    @RequireRoles({"admin", "super_admin"})
    @DeleteMapping("/ban/{userId}")
    public Result removeBan(@PathVariable Long userId) {
        penaltyService.removeBan(userId);
        return Result.success();
    }
}
