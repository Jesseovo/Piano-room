import service from '@/utils/request';

// 统计分析API
const statisticsApi = {

  //热门时段分析
  getHotTimeSlotAnalysis(params) {
    return service.get('/reports/time-slot-report', { params });
  },

  //预约状态分布
  getReservationStatusDistribution(params) {
    return service.get('/reports/reservationStatusDistribution', { params });
  },

  //教室类型使用分布
  getClassroomDistribution(params) {
    return service.get('/reports/classroomDistribution', { params });
  },

  //获取趋势分析
  getTrendAnalysis(params) {
    return service.get('/reports/weekly', { params });
  },

  // 获取预约总数
  getCountReservations(params) {
    return service.get('/reports/countReservations', { params });
  },


  // 获取预约通过率
  getApprovalRate(params) {
    return service.get('/reports/approvalRate', { params });
  },


  //教室使用率
  getClassroomUsageRate(params) {
    return service.get('/reports/classroomUsageRate', { params });
  },

  //获取活跃用户
  getActiveUsers(params) {
    return service.get('/reports/activeUsers', { params });
  },
  
  // 获取总练习时长
  getTotalPracticeHours(params) {
    return service.get('/reports/totalPracticeHours', { params });
  },

  // 获取平均练习时长
  getAvgPracticeHours(params) {
    return service.get('/reports/avgPracticeHours', { params });
  },

};

export { statisticsApi }; 