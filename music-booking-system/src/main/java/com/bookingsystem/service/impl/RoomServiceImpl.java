package com.bookingsystem.service.impl;

import com.bookingsystem.dto.RoomDTO;
import com.bookingsystem.dto.RoomQueryDTO;
import com.bookingsystem.mapper.RoomMapper;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Room;
import com.bookingsystem.pojo.RoomMaintenance;
import com.bookingsystem.service.RoomService;
import com.bookingsystem.vo.HotRoomVO;
import com.bookingsystem.vo.RoomQueryVO;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class RoomServiceImpl implements RoomService {
    @Autowired
    private RoomMapper roomMapper;
    @Override
    public PageResult<RoomQueryVO> list(RoomQueryDTO roomQueryDTO) {
        PageHelper.startPage(roomQueryDTO.getPage(),roomQueryDTO.getPageSize());
        //查询数据
        List<RoomQueryVO> roomQueryVOList = roomMapper.list(roomQueryDTO);
        Page<RoomQueryVO> page = (Page<RoomQueryVO>) roomQueryVOList;
        return new PageResult<>(page.getTotal(),page.getResult());
    }

    @Override
    public void save(Room room) {
        if (room.getStatus() == null) {
            room.setStatus(1);
        }
        if (room.getCheckInRadius() == null) {
            room.setCheckInRadius(100);
        }
        room.setCreatedAt(LocalDateTime.now());
        room.setUpdatedAt(LocalDateTime.now());
        roomMapper.save(room);
    }

    @Override
    public void deleteById(Long id) {
        roomMapper.deleteById(id);
    }

    @Override
    public Room getById(Long id) {
        return roomMapper.getById(id);
    }

    @Override
    public void update(Room room) {
        room.setUpdatedAt(LocalDateTime.now());
        roomMapper.update(room);
    }

    @Override
    public void setStatus(Long id, Integer status) {
        roomMapper.updateStatus(id, status);
    }

    @Override
    public void maintenance(RoomMaintenance roomMaintenance) {
        roomMaintenance.setCreatedAt(LocalDateTime.now());
        roomMaintenance.setUpdatedAt(LocalDateTime.now());
        // 设置默认状态为"未开始"
        if (roomMaintenance.getStatus() == null || roomMaintenance.getStatus().isEmpty()) {
            roomMaintenance.setStatus("未开始");
        }

        roomMapper.maintenance(roomMaintenance);
    }

    @Override
    public RoomMaintenance getMaintenance(Long roomId) {
        List<RoomMaintenance> roomMaintenances = roomMapper.getMaintenance(roomId);
        if (roomMaintenances.size() == 0){
            return null;
        }
        LocalDateTime endTime = roomMaintenances.get(0).getEndTime();
        if (endTime.isBefore(LocalDateTime.now())){
            roomMapper.deleteById(roomMaintenances.get(0).getId());
            return null;
        }
        return roomMaintenances.get(0);
    }

    @Override
    public void saveOrUpdate(RoomMaintenance roomMaintenance) {
        roomMaintenance.setUpdatedAt(LocalDateTime.now());
        roomMapper.upsertMaintenanceRecord(roomMaintenance);
    }

    @Override
    public PageResult<RoomQueryVO> searchAvailableRooms(RoomDTO dto) {

        // 2. 时间处理
        LocalDateTime[] timeRange = parseTimeRange(dto);

        // 3. 分页设置
        PageHelper.startPage(dto.getPageNum(), dto.getPageSize());

        // 4. 执行查询
        List<RoomQueryVO> rooms = roomMapper.searchRooms(
                dto.getBuildingId(),
                dto.getRoomTypeId(),
                dto.getDepartmentId(),
                dto.getMinCapacity(),
                dto.getMaxCapacity(),
                timeRange[0],
                timeRange[1]
        );
        Page<RoomQueryVO> page = (Page<RoomQueryVO>) rooms;
        return new PageResult<>(page.getTotal(), page.getResult());
    }

    @Override
    public List<HotRoomVO> getTodayHotRooms() {
        return roomMapper.getTodayHotRooms(5);
    }

    @Override
    public List<RoomQueryVO> getAllRoomsForExport() {
        // 获取所有房间用于导出
        return roomMapper.getAllRoomsForExport();
    }

    @Override
    public void exportRoomsToExcel(List<RoomQueryVO> rooms, HttpServletResponse response) throws IOException {
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=rooms.xlsx");

            try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
                org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("琴房列表");

                // 创建标题行
                org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
                String[] headers = {"ID", "房间号", "名称", "楼层", "容量", "设施", "状态", "描述", "经度", "纬度", "签到半径", "是否设置位置信息"};
                
                for (int i = 0; i < headers.length; i++) {
                    org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                }

                // 设置标题行样式
                org.apache.poi.ss.usermodel.CellStyle headerStyle = workbook.createCellStyle();
                org.apache.poi.ss.usermodel.Font font = workbook.createFont();
                font.setBold(true);
                headerStyle.setFont(font);

                for (int i = 0; i < headers.length; i++) {
                    headerRow.getCell(i).setCellStyle(headerStyle);
                }

                // 填充数据
                int rowNum = 1;
                for (RoomQueryVO room : rooms) {
                    org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
                    
                    row.createCell(0).setCellValue(room.getId() != null ? room.getId() : 0);
                    row.createCell(1).setCellValue(room.getRoomNumber() != null ? room.getRoomNumber() : "");
                    row.createCell(2).setCellValue(room.getName() != null ? room.getName() : "");
                    row.createCell(3).setCellValue(room.getFloor() != null ? room.getFloor() : 0);
                    row.createCell(4).setCellValue(room.getCapacity() != null ? room.getCapacity() : 0);
                    row.createCell(5).setCellValue(room.getFacilities() != null ? room.getFacilities() : "");
                    row.createCell(6).setCellValue(room.getStatus() != null ? (room.getStatus() == 1 ? "可用" : "维护中") : "");
                    row.createCell(7).setCellValue(room.getDescription() != null ? room.getDescription() : "");
                    row.createCell(8).setCellValue(room.getLongitude() != null ? room.getLongitude().doubleValue() : 0.0);
                    row.createCell(9).setCellValue(room.getLatitude() != null ? room.getLatitude().doubleValue() : 0.0);
                    row.createCell(10).setCellValue(room.getCheckInRadius() != null ? room.getCheckInRadius() : 0);
                    row.createCell(11).setCellValue(room.getHasLocationInfo() != null ? (room.getHasLocationInfo() ? "已设置" : "未设置") : "未设置");
                }

                // 自动调整列宽
                for (int i = 0; i < headers.length; i++) {
                    sheet.autoSizeColumn(i);
                }

                workbook.write(response.getOutputStream());
                response.flushBuffer();
            }
        } catch (Exception e) {
            throw new RuntimeException("导出Excel失败", e);
        }
    }


    private LocalDateTime[] parseTimeRange(RoomDTO dto) {
        if (dto.getDate() == null || dto.getStartTime() == null || dto.getEndTime() == null) {
            return new LocalDateTime[]{null, null};
        }

        return new LocalDateTime[]{
                LocalDateTime.of(dto.getDate(), dto.getStartTime()),
                LocalDateTime.of(dto.getDate(), dto.getEndTime())
        };
    }
}
