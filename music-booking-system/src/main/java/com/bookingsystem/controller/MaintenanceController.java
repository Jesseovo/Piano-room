package com.bookingsystem.controller;

import com.bookingsystem.annotation.RequireRoles;
import com.bookingsystem.dto.MaintenanceQueryDTO;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.pojo.RoomMaintenance;
import com.bookingsystem.service.MaintenanceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/maintenance")
@RequireRoles({"admin", "super_admin"})
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    /**
     * 获取维修记录
     * @param dto
     * @return
     */
    @GetMapping("/list")
    public Result list( MaintenanceQueryDTO dto) {
        PageResult<RoomMaintenance> result = maintenanceService.listMaintenance(dto);
        return Result.success(result);
    }

    /*@PostMapping("/add")
    public Result add(@RequestBody RoomMaintenance maintenance) {
        maintenanceService.addMaintenance(maintenance);
        return Result.success();
    }*/

    /**
     * 批量删除维修记录
     * @param ids
     * @return
     */
    @DeleteMapping("/batch")
    public Result deleteBatch(@RequestBody List<Long> ids) {
        log.info("deleteBatch:{}", ids);
        maintenanceService.deleteBatch(ids);
        return Result.success();
    }


    /**
     * 修改维修记录状态
     * @param status
     * @return
     */
    @PostMapping("/updateStatus")
    public Result updateStatus(@RequestParam Long roomId, @RequestParam String status) {
        Long id = roomId;
        maintenanceService.updateStatus(id, status);
        return Result.success();
    }
}
