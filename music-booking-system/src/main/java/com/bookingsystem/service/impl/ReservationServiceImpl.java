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
import com.bookingsystem.pojo.*;
import com.bookingsystem.qo.AvailableRoomQO;
import com.bookingsystem.service.ReservationService;
import com.bookingsystem.utils.LocationUtil;
import com.bookingsystem.vo.PracticeDurationVO;
import com.bookingsystem.vo.UserReservationStatsVO;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
        return 7; // 默认7天
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
        return 10; // 默认10分钟
    }

    // 获取某天已预约时段
    @Override
    public List<TimeSlot> getRoomAvailability(AvaDTO dto) {
        String dateStr = dto.getDate().format(DateTimeFormatter.ISO_DATE);
        List<Reservation> reservations = reservationMapper.findReservedSlots(dto.getRoomId(), dateStr);
        return reservations.stream()
                .map(r -> new TimeSlot(r.getStartTime(), r.getEndTime()))
                .collect(Collectors.toList());
    }


    // 创建预约
    @Override
    @Transactional
    public Reservation createReservation(ReservationDTO dto, Long userId) throws Exception {
        // 基础验证
        validateReservation(dto);

        // 检查容量
        Room room = roomMapper.getById(dto.getRoomId());
        if (room == null) {
            throw new Exception("琴房不存在");
        }
        Integer reservedAttendees = reservationMapper.getReservedAttendees(
                dto.getRoomId(), dto.getStartTime(), dto.getEndTime());
        int newAttendees = dto.getAttendees() != null ? dto.getAttendees() : 1;
        if (reservedAttendees + newAttendees > room.getCapacity()) {
            throw new Exception("该时段剩余容量不足，已预约" + reservedAttendees + "人，容量" + room.getCapacity() + "人");
        }

        // 检查同一用户是否已预约同一房间同一时段
        if (reservationMapper.checkUserRoomConflict(userId, dto.getRoomId(),
                dto.getStartTime(), dto.getEndTime()) > 0) {
            throw new Exception("您在该时段已预约了该琴房，无法重复预约");
        }

        Reservation reservation = new Reservation();
        BeanUtils.copyProperties(dto, reservation);
        reservation.setUserId(userId);
        int i = reservationMapper.create(reservation);

        // 查找与时间段冲突且超过10分钟未签到的预约，将其状态改为"已占用"
        List<Reservation> conflictingUnattendedReservations =
                reservationMapper.findConflictingUnattendedReservations(
                        dto.getRoomId(),
                        dto.getStartTime(),
                        dto.getEndTime());

        // 更新这些预约的状态为"已占用"
        for (Reservation oldReservation : conflictingUnattendedReservations) {
            oldReservation.setStatus(ReservationStatusEnums.OCCUPIED.getCode());
            reservationMapper.update(oldReservation);
        }

        return reservation;

    }

    /**
     * 图书馆式一键快速预约：先到先得，依赖数据库唯一索引防止高并发超卖
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Reservation quickReservation(QuickReservationDTO dto, Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = dto.getStartTime();
        LocalDateTime endTime = dto.getEndTime();

        // 基础时间校验
        if (startTime == null || endTime == null) {
            throw new BusinessException("请选择预约时段");
        }
        // 允许预约已经开始但还未结束的时间段（比如18:00-20:00，当前18:23仍可预约）
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

        // 校验琴房可用
        if (dto.getRoomId() == null) {
            throw new BusinessException("请选择琴房");
        }
        Room room = roomMapper.getById(dto.getRoomId());
        if (room == null || room.getStatus() != 1) {
            throw new BusinessException("琴房不可用");
        }

        // 校验用户封禁状态
        User user = userMapper.getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (user.getBanUntil() != null && user.getBanUntil().isAfter(now)) {
            String banStr = user.getBanUntil().toString().replace("T", " ").substring(0, 16);
            throw new BusinessException("账号因违约被封禁至 " + banStr + "，无法预约");
        }

        // 检查容量
        Integer reservedAttendees = reservationMapper.getReservedAttendees(
                dto.getRoomId(), startTime, endTime);
        if (reservedAttendees + 1 > room.getCapacity()) {
            throw new BusinessException("该时段已满员，已预约" + reservedAttendees + "人，容量" + room.getCapacity() + "人");
        }

        // 悲观锁冲突检测：SELECT FOR UPDATE 加行锁，高并发下只有一个请求能通过
        if (reservationMapper.checkConflictForUpdate(dto.getRoomId(), startTime, endTime) > 0) {
            throw new BusinessException("手速不够快！该时段已被他人抢占");
        }

        // 检查同一用户是否已预约同一房间同一时段
        if (reservationMapper.checkUserRoomConflict(userId, dto.getRoomId(), startTime, endTime) > 0) {
            throw new BusinessException("您在该时段已预约了该琴房，无法重复预约");
        }

        // 自动生成标题和目的
        String dateStr = startTime.toLocalDate().toString();
        String timeRange = startTime.toLocalTime().toString().substring(0, 5)
                + " - " + endTime.toLocalTime().toString().substring(0, 5);
        String autoTitle = "个人练习 " + dateStr + " " + timeRange;

        // 构建预约对象并插入（数据库唯一索引兜底防超卖）
        Reservation reservation = new Reservation();
        reservation.setRoomId(dto.getRoomId());
        reservation.setUserId(userId);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setTitle(autoTitle);
        reservation.setPurpose("个人练习");
        reservation.setAttendees(1);
        reservation.setRemarks(dto.getRemarks() != null ? dto.getRemarks() : "");
        reservation.setStatus("approved");

        try {
            reservationMapper.create(reservation);
        } catch (Exception e) {
            // 唯一索引冲突，说明被其他请求抢先一步
            throw new BusinessException("手速不够快！该时段刚被他人抢占，请选择其他时段");
        }

        return reservation;
    }

    @Override
    public List<Room> getAvailableByRoomTypeAndTimeQuantum(AvailableRoomQO availableRoomQO) {

        ReservationDTO reservationDTO = new ReservationDTO();
        reservationDTO.setStartTime(availableRoomQO.getStartTime());
        reservationDTO.setEndTime(availableRoomQO.getEndTime());
        validateReservation(reservationDTO);
        List<Room> rooms = reservationMapper.selectAvailableByRoomTypeAndTimeQuantum(availableRoomQO);
        return rooms;
    }

    /**
     * 查询用户预约
     */
    @Override
    public PageResult<Reservation> list(ReservationQueryDTO reservationQueryDTO) {
        // 只有当startDate不为null时才设置endDate
        if (reservationQueryDTO.getStartDate() != null && reservationQueryDTO.getEndDate() == null) {
            reservationQueryDTO.setEndDate(reservationQueryDTO.getStartDate());
        }

        // 设置时间范围
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
        Reservation reservation = reservationMapper.selectReservationsById(id);
        return reservation;
    }

    @Override
    public Integer cancelReservation(Long id, String remark) {
        // 先查询预约信息
        Reservation reservation = reservationMapper.selectReservationsById(id);
        if (reservation == null) {
            throw new RuntimeException("预约不存在");
        }

        // 已签到不能取消，只能签退
        if (reservation.getSignStartTime() != null) {
            throw new RuntimeException("已签到，无法取消预约，如需结束请进行签退");
        }

        reservation.setStatus(ReservationStatusEnums.CANCELLED.getCode());
        reservation.setRemarks("取消原因：" + remark);
        Integer update = reservationMapper.update(reservation);
        return update;
    }

    @Override
    public void updateReservation(Long id, Reservation reservation) {
        int i = 0;
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

        // 已签到不可重复签到
        if (reservation.getSignStartTime() != null) {
            return Result.error("已签到");
        }

        // 检查是否在可签到时间内（预约结束前都可以签到）
        if (now.isAfter(endTime)) {
            return Result.error("预约已结束，无法签到");
        }

        // 位置验证（如果提供了位置信息）
        if (longitude != null && latitude != null) {
            Room room = roomMapper.getById(reservation.getRoomId());
            if (room != null && room.getLatitude() != null && room.getLongitude() != null) {
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
            }
        }

        // 记录签到时间
        reservation.setSignStartTime(now);
        reservationMapper.update(reservation);

        // 取消用户在同一时间其他房间的预约
        List<Reservation> otherReservations = reservationMapper.findUserOtherRoomReservations(
                reservation.getUserId(), reservation.getRoomId(), startTime, endTime);
        for (Reservation other : otherReservations) {
            other.setStatus("cancelled");
            other.setReviewRemarks("因在其他琴房签到而自动取消");
            reservationMapper.update(other);
            log.info("用户 {} 在琴房 {} 签到，自动取消其他预约 {}",
                    reservation.getUserId(), reservation.getRoomId(), other.getId());
        }

        // 检查是否超过开始时间宽限期
        LocalDateTime allowedSignInTime = startTime.plusMinutes(signInGrace);
        if (now.isAfter(allowedSignInTime)) {
            // 超时签到，但记录签到时间
            return Result.successMsg("超时签到" + (otherReservations.isEmpty() ? "" : "，已自动取消其他预约"));
        }

        // 正常签到
        return Result.successMsg("签到成功" + (otherReservations.isEmpty() ? "" : "，已自动取消其他预约"));
    }
    @Override
    public Result signOut(Long reservationId) {
        Reservation reservation = reservationMapper.selectReservationsById(reservationId);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = reservation.getStartTime();
        LocalDateTime end = reservation.getEndTime();
        // 必须先签到
        if (reservation.getSignStartTime() == null) {
            return Result.error("未签到，不能签退");
        }
        // 已签退不可重复签退
        if (reservation.getSignEndTime() != null) {
            return Result.error("已签退");
        }
        // 校验签退时间，建议签退时间在预约时间内
        if (now.isBefore(start)) {
            return Result.error("预约未开始，无法签退");
        }
        reservation.setSignEndTime(now);
        // 签退后立即标记为已完成
        reservation.setStatus("completed");
        reservationMapper.update(reservation);
        return Result.successMsg("签退成功");
    }

    private void validateReservation(ReservationDTO dto) {
        //验证预约时间是否在当前时间之前
        if (dto.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException("开始时间不能早于当前时间");
        }
        // 验证时间有效性
        if (dto.getStartTime().isAfter(dto.getEndTime())) {
            throw new BusinessException("开始时间不能晚于结束时间");
        }

        // 禁止跨天
        if (!isSameDay(dto.getStartTime(), dto.getEndTime())) {
            throw new BusinessException("不可跨天预约");
        }

        // 提前预约天数限制
        int maxAdvanceDays = getMaxAdvanceDays();
        LocalDateTime maxTime = LocalDateTime.now().plusDays(maxAdvanceDays);
        if (dto.getEndTime().isAfter(maxTime)) {
            throw new BusinessException("预约时间不能超过" + maxAdvanceDays + "天");
        }

        // 检查该预约时间段是否在数据库中存在
//        List<Reservation> reservationListDb = reservationMapper.selectReservationsByRoomId(dto.getRoomId());
//        for (Reservation reservation : reservationListDb) {
//            LocalDateTime startTimeDb = reservation.getStartTime();
//            LocalDateTime endTimeDb = reservation.getEndTime();
////            if (!((dto.getStartTime().isAfter(startTimeDb) || dto.getStartTime().isEqual(startTimeDb)) && (dto.getEndTime().isBefore(endTimeDb) || dto.getEndTime().isEqual(endTimeDb) ))){
////                throw new BusinessException("该时间段已被预约,请查询其他时间段");
////            }
//            if (dto.getStartTime().isAfter(startTimeDb) && dto.getEndTime().isBefore(endTimeDb)) {
//                throw new BusinessException("该时间段已被预约,请查询其他时间段");
//            }
//            if (dto.getEndTime().isAfter(startTimeDb) && dto.getEndTime().isBefore(endTimeDb)) {
//                throw new BusinessException("该时间段已被预约,请查询其他时间段");
//            }
//        }

        // 验证教室存在
        if (dto.getRoomId() != null){
            Room room = roomMapper.getById(dto.getRoomId());
            if (room == null || room.getStatus() != 1) {
                throw new BusinessException("教室不可用");
            }
        }

    }

    //判断是否是同一天
    private boolean isSameDay(LocalDateTime date1, LocalDateTime date2) {
        LocalDate localDate1 = date1.toLocalDate();
        LocalDate localDate2 = date2.toLocalDate();
        return localDate1.isEqual(localDate2);
    }

    @Override
    public PageResult<PracticeDurationVO> listPracticeDuration(ReservationQueryDTO reservationQueryDTO) {
        // 设置时间范围
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
        List<PracticeDurationVO> list = reservationMapper.listPracticeDuration(reservationQueryDTO);

        // 计算练习时长
        for (PracticeDurationVO vo : list) {
            vo.calculatePracticeDuration();
        }

        Page<PracticeDurationVO> page = (Page<PracticeDurationVO>) list;
        return new PageResult<>(page.getTotal(), page.getResult());
    }

}
