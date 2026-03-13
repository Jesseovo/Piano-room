package com.bookingsystem.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 一键快速预约 DTO（图书馆式先到先得）
 * 前端只需传 roomId + startTime + endTime，其余由后端自动填充
 */
@Data
public class QuickReservationDTO {
    private Long roomId;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;

    /** 可选备注 */
    private String remarks;

    /** 预约人数（默认1人） */
    private Integer attendees = 1;
}
