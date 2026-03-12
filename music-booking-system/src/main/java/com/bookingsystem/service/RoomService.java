package com.bookingsystem.service;

import com.bookingsystem.dto.RoomDTO;
import com.bookingsystem.dto.RoomQueryDTO;
import com.bookingsystem.pojo.PageResult;
import com.bookingsystem.pojo.Room;
import com.bookingsystem.pojo.RoomMaintenance;
import com.bookingsystem.vo.HotRoomVO;
import com.bookingsystem.vo.RoomQueryVO;

import java.util.List;

public interface RoomService {
    PageResult<RoomQueryVO> list(RoomQueryDTO roomQueryDTO);

    void save(Room room);

    void deleteById(Long id);

    Room getById(Long id);

    void update(Room room);

    void setStatus(Long id, Integer status);

    void maintenance(RoomMaintenance roomMaintenance);

    RoomMaintenance getMaintenance(Long roomId);

    void saveOrUpdate(RoomMaintenance roomMaintenance);

    PageResult<RoomQueryVO> searchAvailableRooms(RoomDTO roomDTO);

    List<HotRoomVO> getTodayHotRooms();
}
