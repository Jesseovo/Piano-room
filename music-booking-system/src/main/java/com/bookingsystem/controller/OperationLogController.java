package com.bookingsystem.controller;

import com.bookingsystem.annotation.RequireRoles;
import com.bookingsystem.dto.LogQueryDTO;
import com.bookingsystem.pojo.OperationLog;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.service.OperationLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/operationLogs")
@Slf4j
@RequireRoles({"admin", "super_admin"})
public class OperationLogController {

    @Autowired
    private OperationLogService operationLogService;

    @GetMapping("/page")
    public Result page(LogQueryDTO logQueryDTO){
        log.info("分页查询操作日志，参数：{}", logQueryDTO);
        PageResult<OperationLog> pageResult = operationLogService.page(logQueryDTO);
        return Result.success(pageResult);
    }
}
