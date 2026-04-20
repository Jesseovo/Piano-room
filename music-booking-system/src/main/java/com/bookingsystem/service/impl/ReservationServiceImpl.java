package com.bookingsystem.service.impl;

import com.alibaba.fastjson2.JSON;
import com.bookingsystem.config.InMemoryDataStore;
import com.bookingsystem.dto.AvaDTO;
import com.bookingsystem.dto.QuickReservationDTO;
import com.bookingsystem.dto.ReservationDTO;
import com.bookingsystem.dto.ReservationQueryDTO;
import com.bookingsystem.enums.ReservationStatusEnums;
import com.bookingsystem.exception.BusinessException;
import com.bookingsystem.mapper.ReservationMapper;
import com.bookingsystem.mapper.RoomMapper;
import com.bookingsystem.mapper.UserMapper;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Reservation;
import com.bookingsystem.pojo.ReservationSetting;
import com.bookingsystem.pojo.Result;
import com.bookingsystem.pojo.Room;
import com.bookingsystem.pojo.TimeSlot;
import com.bookingsystem.pojo.User;
import com.bookingsystem.qo.AvailableRoomQO;
import com.bookingsystem.service.PenaltyService;
import com.bookingsystem.service.ReservationService;
import com.bookingsystem.utils.LocationUtil;
import com.bookingsystem.vo.PracticeDurationSummaryVO;
import com.bookingsystem.vo.PracticeDurationVO;
import com.bookingsystem.vo.UserReservationStatsVO;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ReservationServiceImpl implements ReservationService {
    @Autowired
    private ReservationMapper reservationMapper;
    @Autowired
    private RoomMapper roomMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private InMemoryDataStore inMemoryDataStore;
    @Autowired
    private PenaltyService penaltyService;

    /**
     * 获取最大提前预约天数（从系统配置读取，默认7天）
     */
    private int getMaxAdvanceDays() {
        String setting = inMemoryDataStore.get("reservationSetting");
        if (setting != null) {
            try {
                ReservationSetting reservationSetting = JSON.parseObject(setting, ReservationSetting.class);
                if (reservationSetting != null && reservationSetting.getMaxAdvanceDays() != null) {
                    return reservationSetting.getMaxAdvanceDays();
                }
            } catch (Exception e) {
                // 解析失败使用默认值
            }
        }
        return 7;
    }

    /**
     * 获取签到宽限时间（从系统配置读取，默认10分钟）
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
        return 10;
    }

    /**
     * 兼容旧库 reservations 表中仍然保留的必填字段。
     */
    private void populateLegacyReservationFields(Reservation reservation) {
        if (reservation.getStartTime() == null || reservation.getEndTime() == null) {
            return;
        }
        reservation.setLegacyDate(reservation.getStartTime().toLocalDate());
        reservation.setLegacyStartTime(reservation.getStartTime().toLocalTime().withSecond(0).withNano(0));
        reservation.setLegacyEndTime(reservation.getEndTime().toLocalTime().withSecond(0).withNano(0));
        reservation.setDuration((int) Duration.between(reservation.getStartTime(), reservation.getEndTime()).toMinutes());
    }

    private BusinessException buildQuickReservationSaveException(Exception e) {
        Throwable cause = e;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        String message = cause.getMessage();
        if (e instanceof DuplicateKeyException || (message != null && message.toLowerCase().contains("duplicate"))) {
            return new BusinessException("手速不够快！该时段刚被他人抢占，请选择其他时段");
        }
        log.error("快速预约保存失败", e);
        return new BusinessException("预约失败，系统保存预约记录时出错");
    }

    @Override
    public List<TimeSlot> getRoomAvailability(AvaDTO dto) {
        String dateStr = dto.getDate().format(DateTimeFormatter.ISO_DATE);
        List<Reservation> reservations = reservationMapper.findReservedSlots(dto.getRoomId(), dateStr);
        return reservations.stream()
                .map(r -> new TimeSlot(r.getStartTime(), r.getEndTime()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Reservation createReservation(ReservationDTO dto, Long userId) throws Exception {
        validateReservation(dto);

        int graceMinutes = getSignInGraceMinutes();

        Room room = roomMapper.getById(dto.getRoomId());
        if (room == null) {
            throw new Exception("琴房不存在");
        }

        if (room.getLatitude() == null || room.getLongitude() == null) {
            throw new Exception("该琴房未设置地理位置信息，无法预约（需要进行位置验证签到）");
        }

        Integer reservedAttendees = reservationMapper.getReservedAttendees(
                dto.getRoomId(), dto.getStartTime(), dto.getEndTime(), graceMinutes);
        int newAttendees = dto.getAttendees() != null ? dto.getAttendees() : 1;
        if (reservedAttendees + newAttendees > room.getCapacity()) {
            throw new Exception("该时段剩余容量不足，已预约" + reservedAttendees + "人，容量" + room.getCapacity() + "人");
        }

        if (reservationMapper.checkUserHasActiveReservation(userId, dto.getStartTime(), dto.getEndTime()) > 0) {
            throw new Exception("您已有正在进行中的预约，无法预约其他琴房，请先完成当前预约");
        }

        if (reservationMapper.checkUserRoomConflict(userId, dto.getRoomId(),
                dto.getStartTime(), dto.getEndTime()) > 0) {
            throw new Exception("您在该时段已预约了该琴房，无法重复预约");
        }

        Reservation reservation = new Reservation();
        BeanUtils.copyProperties(dto, reservation);
        reservation.setUserId(userId);
        populateLegacyReservationFields(reservation);
        reservationMapper.create(reservation);

        List<Reservation> conflictingUnattendedReservations =
                reservationMapper.findConflictingUnattendedReservations(
                        dto.getRoomId(),
                        dto.getStartTime(),
                        dto.getEndTime(),
                        graceMinutes);

        for (Reservation oldReservation : conflictingUnattendedReservations) {
            oldReservation.setStatus(ReservationStatusEnums.OCCUPIED.getCode());
            reservationMapper.update(oldReservation);
        }

        return reservation;
    }

    /**
     * 图书馆式一键快速预约：先到先得。
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Reservation quickReservation(QuickReservationDTO dto, Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = dto.getStartTime();
        LocalDateTime endTime = dto.getEndTime();

        if (startTime == null || endTime == null) {
            throw new BusinessException("请选择预约时段");
        }
        if (endTime.isBefore(now)) {
            throw new BusinessException("预约时段已结束");
        }
        if (!startTime.isBefore(endTime)) {
            throw new BusinessException("结束时间必须晚于开始时间");
        }
        if (!startTime.toLocalDate().isEqual(endTime.toLocalDate())) {
            throw new BusinessException("不可跨天预约");
        }
        int maxAdvanceDays = getMaxAdvanceDays();
        if (endTime.isAfter(now.plusDays(maxAdvanceDays))) {
            throw new BusinessException("预约时间不能超过" + maxAdvanceDays + "天");
        }

        if (dto.getRoomId() == null) {
            throw new BusinessException("请选择琴房");
        }
        Room room = roomMapper.getById(dto.getRoomId());
        if (room == null || room.getStatus() != 1) {
            throw new BusinessException("琴房不可用");
        }

        if (room.getLatitude() == null || room.getLongitude() == null) {
            throw new BusinessException("该琴房未设置地理位置信息，无法预约（需要进行位置验证签到）");
        }

        User user = userMapper.getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getBanUntil() != null && user.getBanUntil().isAfter(now)) {
            String banStr = user.getBanUntil().toString().replace("T", " ").substring(0, 16);
            throw new BusinessException("账号因违约被封禁至 " + banStr + "，无法预约");
        }

        int graceMinutes = getSignInGraceMinutes();

        int attendees = dto.getAttendees() != null && dto.getAttendees() > 0 ? dto.getAttendees() : 1;
        Integer reservedAttendees = reservationMapper.getReservedAttendees(
                dto.getRoomId(), startTime, endTime, graceMinutes);
        if (reservedAttendees + attendees > room.getCapacity()) {
            throw new BusinessException("该时段已满员，已预约" + reservedAttendees + "人，容量" + room.getCapacity() + "人");
        }

        if (reservationMapper.checkConflictForUpdate(dto.getRoomId(), startTime, endTime, graceMinutes) > 0) {
            throw new BusinessException("手速不够快！该时段已被他人抢占");
        }

        if (reservationMapper.checkUserHasActiveReservation(userId, startTime, endTime) > 0) {
            throw new BusinessException("您已有正在进行中的预约，无法预约其他琴房，请先完成当前预约");
        }

        if (reservationMapper.checkUserRoomConflict(userId, dto.getRoomId(), startTime, endTime) > 0) {
            throw new BusinessException("您在该时段已预约了该琴房，无法重复预约");
        }

        String dateStr = startTime.toLocalDate().toString();
        String timeRange = startTime.toLocalTime().toString().substring(0, 5)
                + " - " + endTime.toLocalTime().toString().substring(0, 5);
        String autoTitle = "个人练习 " + dateStr + " " + timeRange;

        Reservation reservation = new Reservation();
        reservation.setRoomId(dto.getRoomId());
        reservation.setUserId(userId);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setTitle(autoTitle);
        reservation.setPurpose("个人练习");
        reservation.setAttendees(attendees);
        reservation.setRemarks(dto.getRemarks() != null ? dto.getRemarks() : "");
        reservation.setStatus("approved");
        populateLegacyReservationFields(reservation);

        try {
            reservationMapper.create(reservation);
        } catch (Exception e) {
            throw buildQuickReservationSaveException(e);
        }

        return reservation;
    }

    @Override
    public List<Room> getAvailableByRoomTypeAndTimeQuantum(AvailableRoomQO availableRoomQO) {
        ReservationDTO reservationDTO = new ReservationDTO();
        reservationDTO.setStartTime(availableRoomQO.getStartTime());
        reservationDTO.setEndTime(availableRoomQO.getEndTime());
        validateReservation(reservationDTO);
        return reservationMapper.selectAvailableByRoomTypeAndTimeQuantum(availableRoomQO);
    }

    @Override
    public PageResult<Reservation> list(ReservationQueryDTO reservationQueryDTO) {
        if (reservationQueryDTO.getStartDate() != null && reservationQueryDTO.getEndDate() == null) {
            reservationQueryDTO.setEndDate(reservationQueryDTO.getStartDate());
        }

        if (reservationQueryDTO.getStartDate() != null) {
            reservationQueryDTO.setStartTime(reservationQueryDTO.getStartDateTime());
        }
        if (reservationQueryDTO.getEndDate() != null) {
            reservationQueryDTO.setEndTime(reservationQueryDTO.getEndDateTime());
        }

        PageHelper.startPage(reservationQueryDTO.getPageNum(), reservationQueryDTO.getPageSize());
        List<Reservation> list = reservationMapper.list(reservationQueryDTO);
        Page<Reservation> page = (Page<Reservation>) list;
        return new PageResult<>(page.getTotal(), page.getResult());
    }

    @Override
    public Reservation getReservationById(Long id) {
        return reservationMapper.selectReservationsById(id);
    }

    @Override
    public Integer cancelReservation(Long id, String remark) {
        Reservation reservation = reservationMapper.selectReservationsById(id);
        if (reservation == null) {
            throw new RuntimeException("预约不存在");
        }

        if (reservation.getSignStartTime() != null) {
            throw new RuntimeException("已签到，无法取消预约，如需结束请进行签退");
        }

        reservation.setStatus(ReservationStatusEnums.CANCELLED.getCode());
        reservation.setRemarks("取消原因：" + remark);
        return reservationMapper.update(reservation);
    }

    @Override
    public Integer adminAssistCancelReservation(Long id, String remark) {
        Reservation reservation = reservationMapper.selectReservationsById(id);
        if (reservation == null) {
            throw new RuntimeException("预约不存在");
        }
        if ("occupied".equals(reservation.getStatus())) {
            throw new RuntimeException("违约预约不可再代取消");
        }
        if (reservation.getSignStartTime() != null) {
            throw new RuntimeException("已签到预约不能代取消，如需处理请先代签退");
        }
        if ("completed".equals(reservation.getStatus()) || "cancelled".equals(reservation.getStatus())) {
            throw new RuntimeException("当前预约状态不支持代取消");
        }
        reservation.setStatus(ReservationStatusEnums.CANCELLED.getCode());
        reservation.setRemarks("管理员代取消原因：" + (remark == null ? "" : remark));
        return reservationMapper.update(reservation);
    }

    @Override
    public void updateReservation(Long id, Reservation reservation) {
        reservation.setId(id);
        reservationMapper.update(reservation);
    }

    @Override
    public UserReservationStatsVO getUserReservationStats(Long userId) {
        return reservationMapper.getUserReservationStats(userId);
    }

    @Override
    public Result signIn(Long reservationId, Double longitude, Double latitude) {
        Reservation reservation = reservationMapper.selectReservationsById(reservationId);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = reservation.getStartTime();
        LocalDateTime endTime = reservation.getEndTime();
        int signInGrace = getSignInGraceMinutes();

        if (now.isAfter(endTime)) {
            return Result.error("预约已结束，无法签到");
        }

        if ("occupied".equals(reservation.getStatus())) {
            return Result.error("预约已因超时未签到被标记为违约，无法签到");
        }

        if (reservation.getSignStartTime() != null) {
            return Result.error("已签到");
        }

        LocalDateTime allowedSignInTime;
        if (reservation.getCreatedAt().isAfter(startTime)) {
            allowedSignInTime = reservation.getCreatedAt().plusMinutes(signInGrace);
        } else {
            allowedSignInTime = startTime.plusMinutes(signInGrace);
        }

        if (now.isAfter(allowedSignInTime)) {
            if ("approved".equals(reservation.getStatus())) {
                reservation.setStatus("occupied");
                reservationMapper.update(reservation);
                penaltyService.recordViolation(reservation.getUserId());
            }
            return Result.error("已超过签到宽限时间，预约已标记为违约");
        }

        if (longitude == null || latitude == null) {
            return Result.error("签到失败：无法获取您的位置信息，请开启定位权限");
        }
        Room room = roomMapper.getById(reservation.getRoomId());
        if (room == null) {
            return Result.error("签到失败：琴房信息不存在");
        }
        if (room.getLatitude() == null || room.getLongitude() == null) {
            return Result.error("签到失败：该琴房未设置位置信息，请联系管理员");
        }
        Integer radius = room.getCheckInRadius() != null ? room.getCheckInRadius() : 100;
        boolean inRange = LocationUtil.isWithinRange(
                room.getLatitude(), room.getLongitude(),
                BigDecimal.valueOf(latitude), BigDecimal.valueOf(longitude),
                radius
        );
        if (!inRange) {
            double distance = LocationUtil.calculateDistance(
                    room.getLatitude().doubleValue(), room.getLongitude().doubleValue(),
                    latitude, longitude
            );
            return Result.error("签到失败：您距离琴房" + LocationUtil.formatDistance(distance) +
                    "，超出允许范围（" + radius + "米）");
        }

        reservation.setSignStartTime(now);
        reservationMapper.update(reservation);

        List<Reservation> otherReservations = reservationMapper.findUserOtherRoomReservations(
                reservation.getUserId(), reservation.getRoomId(), startTime, endTime);
        for (Reservation other : otherReservations) {
            other.setStatus("cancelled");
            other.setReviewRemarks("因在其他琴房签到而自动取消");
            reservationMapper.update(other);
            log.info("用户 {} 在琴房 {} 签到，自动取消其他预约 {}",
                    reservation.getUserId(), reservation.getRoomId(), other.getId());
        }

        return Result.successMsg("签到成功" + (otherReservations.isEmpty() ? "" : "，已自动取消其他预约"));
    }

    @Override
    public Result adminAssistSignIn(Long reservationId) {
        Reservation reservation = reservationMapper.selectReservationsById(reservationId);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endTime = reservation.getEndTime();

        if (now.isAfter(endTime)) {
            return Result.error("预约已结束，无法代签到");
        }
        if (reservation.getSignStartTime() != null) {
            return Result.error("该预约已签到");
        }
        if ("occupied".equals(reservation.getStatus())) {
            return Result.error("违约预约不可再代签到");
        }
        if ("cancelled".equals(reservation.getStatus()) || "completed".equals(reservation.getStatus())) {
            return Result.error("当前预约状态不支持代签到");
        }

        reservation.setSignStartTime(now);
        reservation.setStatus(ReservationStatusEnums.APPROVED.getCode());
        reservationMapper.update(reservation);
        return Result.successMsg("代签到成功");
    }

    @Override
    public Result signOut(Long reservationId) {
        Reservation reservation = reservationMapper.selectReservationsById(reservationId);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = reservation.getStartTime();

        if (reservation.getSignStartTime() == null) {
            return Result.error("未签到，不能签退");
        }
        if (reservation.getSignEndTime() != null) {
            return Result.error("已签退");
        }
        if (now.isBefore(start)) {
            return Result.error("预约未开始，无法签退");
        }
        reservation.setSignEndTime(now);
        reservation.setStatus("completed");
        reservationMapper.update(reservation);
        return Result.successMsg("签退成功");
    }

    @Override
    public Result adminAssistSignOut(Long reservationId) {
        Reservation reservation = reservationMapper.selectReservationsById(reservationId);
        LocalDateTime now = LocalDateTime.now();

        if (reservation.getSignStartTime() == null) {
            return Result.error("该预约尚未签到，无法代签退");
        }
        if (reservation.getSignEndTime() != null) {
            return Result.error("该预约已签退");
        }

        reservation.setSignEndTime(now);
        reservation.setStatus(ReservationStatusEnums.COMPLETED.getCode());
        reservationMapper.update(reservation);
        return Result.successMsg("代签退成功");
    }

    private void validateReservation(ReservationDTO dto) {
        if (dto.getEndTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException("结束时间不能早于当前时间");
        }
        if (dto.getStartTime().isAfter(dto.getEndTime())) {
            throw new BusinessException("开始时间不能晚于结束时间");
        }

        if (!isSameDay(dto.getStartTime(), dto.getEndTime())) {
            throw new BusinessException("不可跨天预约");
        }

        int maxAdvanceDays = getMaxAdvanceDays();
        LocalDateTime maxTime = LocalDateTime.now().plusDays(maxAdvanceDays);
        if (dto.getEndTime().isAfter(maxTime)) {
            throw new BusinessException("预约时间不能超过" + maxAdvanceDays + "天");
        }

        if (dto.getRoomId() != null) {
            Room room = roomMapper.getById(dto.getRoomId());
            if (room == null || room.getStatus() != 1) {
                throw new BusinessException("教室不可用");
            }

            if (room.getLatitude() == null || room.getLongitude() == null) {
                throw new BusinessException("该琴房未设置地理位置信息，无法预约（需要进行位置验证签到）");
            }
        }
    }

    private boolean isSameDay(LocalDateTime date1, LocalDateTime date2) {
        LocalDate localDate1 = date1.toLocalDate();
        LocalDate localDate2 = date2.toLocalDate();
        return localDate1.isEqual(localDate2);
    }

    private void normalizePracticeDurationQuery(ReservationQueryDTO reservationQueryDTO) {
        if (reservationQueryDTO.getStartDate() != null && reservationQueryDTO.getEndDate() == null) {
            reservationQueryDTO.setEndDate(reservationQueryDTO.getStartDate());
        }

        if (reservationQueryDTO.getStartDate() != null) {
            reservationQueryDTO.setStartTime(reservationQueryDTO.getStartDateTime());
        }
        if (reservationQueryDTO.getEndDate() != null) {
            reservationQueryDTO.setEndTime(reservationQueryDTO.getEndDateTime());
        }
    }

    @Override
    public PageResult<PracticeDurationVO> listPracticeDuration(ReservationQueryDTO reservationQueryDTO) {
        normalizePracticeDurationQuery(reservationQueryDTO);

        PageHelper.startPage(reservationQueryDTO.getPageNum(), reservationQueryDTO.getPageSize());
        List<PracticeDurationVO> list = reservationMapper.listPracticeDuration(reservationQueryDTO);

        for (PracticeDurationVO vo : list) {
            vo.calculatePracticeDuration();
        }

        Page<PracticeDurationVO> page = (Page<PracticeDurationVO>) list;
        return new PageResult<>(page.getTotal(), page.getResult());
    }

    @Override
    public List<PracticeDurationSummaryVO> listPracticeDurationSummary(ReservationQueryDTO reservationQueryDTO) {
        normalizePracticeDurationQuery(reservationQueryDTO);
        List<PracticeDurationSummaryVO> summaries = reservationMapper.listPracticeDurationSummary(reservationQueryDTO);
        for (PracticeDurationSummaryVO summary : summaries) {
            summary.fillDerivedFields();
        }
        return summaries;
    }

    @Override
    public void exportPracticeDurationSummary(List<PracticeDurationSummaryVO> summaries, HttpServletResponse response) throws IOException {
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=practice-duration-summary.xlsx");

            try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
                org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("用户练琴时长");
                String[] headers = {
                        "用户ID", "用户名", "姓名", "学号", "手机号", "年级", "专业",
                        "完成练琴次数", "累计练琴分钟", "累计练琴小时", "累计练琴时长", "最近一次练琴时间"
                };

                org.apache.poi.ss.usermodel.CellStyle headerStyle = workbook.createCellStyle();
                org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);

                org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.length; i++) {
                    org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }

                int rowNum = 1;
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                for (PracticeDurationSummaryVO summary : summaries) {
                    org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
                    row.createCell(0).setCellValue(summary.getUserId() == null ? 0L : summary.getUserId());
                    row.createCell(1).setCellValue(summary.getUsername() == null ? "" : summary.getUsername());
                    row.createCell(2).setCellValue(summary.getRealName() == null ? "" : summary.getRealName());
                    row.createCell(3).setCellValue(summary.getStudentId() == null ? "" : summary.getStudentId());
                    row.createCell(4).setCellValue(summary.getPhone() == null ? "" : summary.getPhone());
                    row.createCell(5).setCellValue(summary.getGrade() == null ? "" : summary.getGrade());
                    row.createCell(6).setCellValue(summary.getMajor() == null ? "" : summary.getMajor());
                    row.createCell(7).setCellValue(summary.getPracticeCount() == null ? 0 : summary.getPracticeCount());
                    row.createCell(8).setCellValue(summary.getTotalPracticeMinutes() == null ? 0L : summary.getTotalPracticeMinutes());
                    row.createCell(9).setCellValue(summary.getTotalPracticeHours() == null ? "0.00" : summary.getTotalPracticeHours().toPlainString());
                    row.createCell(10).setCellValue(summary.getTotalPracticeDuration() == null ? "0分钟" : summary.getTotalPracticeDuration());
                    row.createCell(11).setCellValue(summary.getLastPracticeTime() == null ? "" : summary.getLastPracticeTime().format(formatter));
                }

                for (int i = 0; i < headers.length; i++) {
                    sheet.autoSizeColumn(i);
                }

                workbook.write(response.getOutputStream());
                response.flushBuffer();
            }
        } catch (Exception e) {
            throw new RuntimeException("导出练琴时长Excel失败", e);
        }
    }
}
