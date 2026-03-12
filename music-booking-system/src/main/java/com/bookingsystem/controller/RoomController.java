package com.bookingsystem.controller;

import com.bookingsystem.annotation.Log;
import com.bookingsystem.dto.RoomDTO;
import com.bookingsystem.dto.RoomQueryDTO;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.pojo.Room;
import com.bookingsystem.pojo.RoomMaintenance;
import com.bookingsystem.service.RoomService;
import com.bookingsystem.vo.HotRoomVO;
import com.bookingsystem.vo.RoomQueryVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@RequestMapping("/room")
@RestController
public class RoomController {
    @Autowired
    private RoomService roomService;

    /**
     * 查询所有教室及条件查询开发
     * @return
     */
    @GetMapping
    public Result list(RoomQueryDTO roomQueryDTO){
        log.info("查询所有教室及条件查询:{}",roomQueryDTO);
        PageResult<RoomQueryVO> pageResult = roomService.list(roomQueryDTO);
        return Result.success(pageResult);
    }

    /**
     * 添加教室
     * @param room
     * @return
     */
    @PostMapping
    @Log(module = "琴房管理", type = "添加琴房", description = "添加新的琴房")
    public Result save(@RequestBody Room room){
        log.info("添加教室:{}",room);
        roomService.save(room);
        return Result.success();
    }

    /**
     * 删除教室
     * @param id
     * @return
     */
    @DeleteMapping("/{id}")
    @Log(module = "琴房管理", type = "删除琴房", description = "根据id删除琴房")
    public Result deleteById(@PathVariable Long id){
        log.info("删除教室:{}",id);
        roomService.deleteById(id);
        return Result.success();
    }

    /**
     * 根据id查询教室
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    public Result getById(@PathVariable Long id){
        log.info("查询教室:{}",id);
        Room room = roomService.getById(id);
        return Result.success(room);
    }

    /**
     * 修改教室信息
     * @param room
     * @return
     */
    @PutMapping
    @Log(module = "琴房管理", type = "更新琴房", description = "更新琴房信息")
    public Result update(@RequestBody Room room){
        log.info("更新教室:{}",room);
        roomService.update(room);
        return Result.success();
    }
    /**
     * 教室维护
     */
    @PostMapping("/maintenance")
    @Log(module = "琴房管理", type = "琴房维护", description = "设置琴房维护状态")
    public Result maintenance(@RequestBody RoomMaintenance roomMaintenance){
        log.info("教室维护:{}",roomMaintenance);
        validateDateRange(roomMaintenance.getStartTime(), roomMaintenance.getEndTime());
        roomService.maintenance(roomMaintenance);
        return Result.success();
    }

    /**
     * 根据教室查询维护记录
     */
    @GetMapping("/maintenance/{roomId}")
    public Result getMaintenance(@PathVariable Long roomId){
        log.info("根据教室查询维护记录:{}",roomId);
        RoomMaintenance roomMaintenances = roomService.getMaintenance(roomId);
        return Result.success(roomMaintenances);
    }

    /**
     * 更新或者新增维护记录
     */
    @PostMapping("/maintenance/update-or-insert")
    @Log(module = "琴房管理", type = "维护记录", description = "更新或新增琴房维护记录")
    public Result updateOrInsert(@RequestBody RoomMaintenance roomMaintenance){
        log.info("更新或者新增维护记录:{}",roomMaintenance);
        try {
            validateDateRange(roomMaintenance.getStartTime(), roomMaintenance.getEndTime());
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
        roomService.saveOrUpdate(roomMaintenance);
        return Result.success();
    }

    /**
     * 教室筛选
     * @param roomDTO
     * @return
     */

    @GetMapping("/search")
    public Result searchRooms( RoomDTO roomDTO) {
        log.info("查询教室:{}",roomDTO);
        PageResult<RoomQueryVO> pageResult = roomService.searchAvailableRooms(roomDTO);
        return Result.success(pageResult);
    }


    /**
     * 前台 今日热门教室展示
     * @return
     */
    @GetMapping("/hot-today")
    public Result getTodayHotRooms() {
        List<HotRoomVO> hotRooms = roomService.getTodayHotRooms();
        return Result.success(hotRooms);
    }


    private void validateDateRange(LocalDateTime start, LocalDateTime end) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("开始日期不能晚于结束日期");
        }
        if (start.isBefore(LocalDateTime.now())){
            throw new IllegalArgumentException("开始日期不能早于当前日期");
        }
    }
}
