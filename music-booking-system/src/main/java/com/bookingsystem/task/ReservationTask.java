package com.bookingsystem.task;

import com.alibaba.fastjson2.JSON;
import com.bookingsystem.config.InMemoryDataStore;
import com.bookingsystem.mapper.ReservationMapper;
import com.bookingsystem.pojo.Reservation;
import com.bookingsystem.pojo.ReservationSetting;
import com.bookingsystem.service.PenaltyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
public class ReservationTask {

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private PenaltyService penaltyService;

    @Autowired
    private InMemoryDataStore inMemoryDataStore;

    /**
     * 每5分钟检测一次：
     * 1. 将已批准但超过开始时间宽限期仍未签到的预约标记为 occupied（违约）
     * 2. 对违约用户累计违约次数，并按规则决定是否封禁
     * 3. 将预约时间已过且已签到的预约标记为 completed
     */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void checkReservationStatus() {
        LocalDateTime now = LocalDateTime.now();
        log.info("[定时任务] 开始检查预约状态，当前时间：{}", now);

        // 获取签到宽限时间（从系统配置读取，默认10分钟）
        int signInGraceMinutes = getSignInGraceMinutes();

        // 1. 处理超过签到宽限期仍未签到的预约 → occupied（违约）
        List<Reservation> overdueList = reservationMapper.getOverdueReservations(now, signInGraceMinutes);
        for (Reservation r : overdueList) {
            // 再次检查状态，防止并发处理重复
            Reservation current = reservationMapper.selectReservationsById(r.getId());
            if (current == null || !"approved".equals(current.getStatus())) {
                continue; // 已处理或不存在，跳过
            }

            // 未签到，标记为违约
            r.setStatus("occupied");
            reservationMapper.update(r);
            penaltyService.recordViolation(r.getUserId());
        }

        // 2. 处理已签到的预约 → completed
        List<Reservation> completedList = reservationMapper.getCompletedReservations(now);
        for (Reservation r : completedList) {
            // 再次检查状态，防止并发处理重复
            Reservation current = reservationMapper.selectReservationsById(r.getId());
            if (current == null || !"approved".equals(current.getStatus())) {
                continue; // 已处理或不存在，跳过
            }

            // 已签到，标记为完成
            if (r.getSignStartTime() != null) {
                // 如果已签到但未签退，自动设置签退时间为预约结束时间
                if (r.getSignEndTime() == null) {
                    r.setSignEndTime(r.getEndTime());
                }
                r.setStatus("completed");
                reservationMapper.update(r);
            }
        }

        log.info("[定时任务] 本轮处理完毕，共处理 {} 条违约预约，{} 条完成预约", overdueList.size(), completedList.size());
    }

    /**
     * 获取签到宽限时间（从系统配置读取）
     */
    private int getSignInGraceMinutes() {
        String setting = inMemoryDataStore.get("reservationSetting");
        if (setting != null) {
            try {
                ReservationSetting reservationSetting = JSON.parseObject(setting, ReservationSetting.class);
                if (reservationSetting != null && reservationSetting.getSignInGrace() != null) {
                    return reservationSetting.getSignInGrace();
                }
            } catch (Exception e) {
                // 解析失败使用默认值
            }
        }
        return 10; // 默认10分钟
    }
}
