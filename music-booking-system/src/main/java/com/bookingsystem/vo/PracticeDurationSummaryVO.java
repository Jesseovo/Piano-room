package com.bookingsystem.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PracticeDurationSummaryVO {
    private Long userId;
    private String username;
    private String realName;
    private String studentId;
    private String phone;
    private String grade;
    private String major;
    private Integer practiceCount;
    private Long totalPracticeMinutes;
    private BigDecimal totalPracticeHours;
    private String totalPracticeDuration;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastPracticeTime;

    public void fillDerivedFields() {
        long minutes = totalPracticeMinutes == null ? 0L : totalPracticeMinutes;
        totalPracticeMinutes = minutes;
        practiceCount = practiceCount == null ? 0 : practiceCount;
        totalPracticeHours = BigDecimal.valueOf(minutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        long hours = minutes / 60;
        long remainMinutes = minutes % 60;
        if (hours > 0) {
            totalPracticeDuration = hours + "小时" + (remainMinutes > 0 ? remainMinutes + "分钟" : "");
        } else {
            totalPracticeDuration = remainMinutes + "分钟";
        }
    }
}
