package com.bookingsystem.task;

import com.bookingsystem.mapper.ReservationMapper;
import com.bookingsystem.pojo.Reservation;
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

    /**
     * 每5分钟检测一次：
     * 1. 将已批准但超过开始时间10分钟仍未签到的预约标记为 occupied（违约）
     * 2. 对违约用户累计违约次数，并按规则决定是否封禁
     * 3. 将预约时间已过且已签到的预约标记为 completed
     */
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void checkReservationStatus() {
        LocalDateTime now = LocalDateTime.now();
        log.info("[定时任务] 开始检查预约状态，当前时间：{}", now);

        // 1. 处理结束时间已过的 approved 预约 → completed
        List<Reservation> completedList = reservationMapper.getApprovedReservations(now);
        for (Reservation r : completedList) {
            // 再次检查状态，防止并发处理重复
            Reservation current = reservationMapper.selectReservationsById(r.getId());
            if (current == null || !"approved".equals(current.getStatus())) {
                continue; // 已处理或不存在，跳过
            }

            // 仅当已签到才标为 completed，否则标为 occupied（违约）
            if (r.getSignStartTime() != null) {
                // 如果已签到但未签退，自动设置签退时间为预约结束时间
                if (r.getSignEndTime() == null) {
                    r.setSignEndTime(r.getEndTime());
                }
                r.setStatus("completed");
                reservationMapper.update(r);
            } else {
                r.setStatus("occupied");
                reservationMapper.update(r);
                penaltyService.recordViolation(r.getUserId());
            }
        }

        log.info("[定时任务] 本轮处理完毕，共处理 {} 条预约", completedList.size());
    }
}
