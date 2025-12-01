import service from '@/utils/request';

// 教室管理 API
const roomApi = {


  //今日热门教室
  getTodayHotRooms(params) {
    return service.get('/room/hot-today');
  },


  // 查询教室
  searchRooms(params) {
    return service.get('/room/search', { params });
  },

  // 查询所有教室及条件查询
  list(params) {
    return service.get('/room', { params });
  },

  // 添加教室
  save(room) {
    return service.post('/room', room);
  },

  // 删除教室
  deleteById(id) {
    return service.delete(`/room/${id}`);
  },

  // 根据 ID 查询教室
  getById(id) {
    return service.get(`/room/${id}`);
  },

  // 更新教室信息
  update(room) {
    return service.put('/room', room);
  },

  // 教室维护
  maintenance(roomMaintenance) {
    return service.post('/room/maintenance', roomMaintenance);
  },

  // 根据教室ID获取维护记录
  getMaintenanceByRoomId(roomId) {
    return service.get(`/room/maintenance/${roomId}`);
  },

  //更新或者新增维护记录
  updateOrSaveMaintenance(roomMaintenance) {
    return service.post('/room/maintenance/update-or-insert', roomMaintenance);
  }
};

// 导出 API
export { roomApi };
