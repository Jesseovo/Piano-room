package com.bookingsystem.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserReservationStatsVO {
    private Integer totalCount;
    private Integer completedCount;
    private Integer approvedCount;
    private Integer cancelledCount;
    private Integer occupiedCount;
    private Long totalPracticeMinutes;
}
