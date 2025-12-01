import service from '@/utils/request';

// 预约管理 API
const reservationApi = {


  //用户个人预约统计
  getUserReservationStatistics(params) {
    return service.get('/reservations/userStatistics', { params });
  },

    
    //根据教室类型和预约时间查询空闲教室
    getAvailableByRoomTypeAndTimeQuantum(params){
        return service.get('/reservations/getAvailableByRoomTypeAndTimeQuantum',{params});
    },

  // 获取可用时段
  getAvailability(params) {
    return service.get('/reservations/availability', { params });
  },

  // 创建预约
  createReservation(reservationDTO) {
    return service.post('/reservations', reservationDTO);
  },
  
  // 获取所有预约列表
  getReservationList(params) {
    return service.get('/reservations/list', { params });
  },
  
  // 获取预约详情
  getReservationById(id) {
    return service.get(`/reservations/${id}`);
  },
  
  // 更新预约
  updateReservation(id, reservationDTO) {
    return service.put(`/reservations/${id}`, reservationDTO);
  },
  
  // 取消预约
  cancelReservation(id, params) {
    return service.put(`/reservations/${id}/cancel`, params);
  },
  
  // 删除预约
  deleteReservation(id) {
    return service.delete(`/reservations/${id}`);
  },

  // 预约签到（支持可选参数，如 { late: true }）
  signIn(id) {
    return service.post(`/reservations/${id}/sign-in`);
  },
  // 预约签退
  signOut(id) {
    return service.post(`/reservations/${id}/sign-out`);
  },

  // 查询时长管理列表
  getPracticeDurationList(params) {
    return service.get('/reservations/practiceduration', { params });
  }
};

// 导出 API
export { reservationApi };
