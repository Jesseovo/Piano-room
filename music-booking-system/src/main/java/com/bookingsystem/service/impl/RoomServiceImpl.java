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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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
