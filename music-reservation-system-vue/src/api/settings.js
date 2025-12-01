import service from '@/utils/request';

// 系统设置API
const settingsApi = {


  //获取趋势分析
  getTrendAnalysis(params) {
    return service.get('/reports/weekly', { params });
  },

  // 获取基本设置
  getBasicSettings() {
    return service.get('/system/settings/basic');
  },

  // 更新基本设置
  updateBasicSettings(data) {
    return service.put('/system', data);
  },

  // 获取预约设置
  getReservationSettings() {
    return service.get('/admin/settings/reservation');
  },

  // 更新预约设置
  updateReservationSettings(data) {
    return service.put('/admin/settings/reservation', data);
  },

  // 获取通知设置
  getNotificationSettings() {
    return service.get('/admin/settings/notification');
  },

  // 更新通知设置
  updateNotificationSettings(data) {
    return service.put('/admin/settings/notification', data);
  },

  // 获取安全设置
  getSecuritySettings() {
    return service.get('/admin/settings/security');
  },

  // 更新安全设置
  updateSecuritySettings(data) {
    return service.put('/admin/settings/security', data);
  },

  // 发送测试邮件
  sendTestEmail(data) {
    return service.post('/admin/settings/notification/test-email', data);
  },

  // 发送测试短信
  sendTestSms(data) {
    return service.post('/admin/settings/notification/test-sms', data);
  },

  // 获取时间段设置
  getTimeSlots() {
    return service.get('/admin/settings/time-slots');
  },

  // 添加时间段
  addTimeSlot(data) {
    return service.post('/admin/settings/time-slots', data);
  },

  // 更新时间段
  updateTimeSlot(data) {
    return service.put('/admin/settings/time-slots', data);
  },

  // 删除时间段
  deleteTimeSlot(id) {
    return service.delete(`/admin/settings/time-slots/${id}`);
  },

  // 上传系统Logo
  uploadLogo(file) {
    const formData = new FormData();
    formData.append('file', file);
    return service.post('/admin/settings/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 上传系统Favicon
  uploadFavicon(file) {
    const formData = new FormData();
    formData.append('file', file);
    return service.post('/admin/settings/upload-favicon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 获取通知模板
  getNotificationTemplates() {
    return service.get('/admin/settings/notification/templates');
  },

  // 更新通知模板
  updateNotificationTemplate(data) {
    return service.put('/admin/settings/notification/templates', data);
  },

  // 获取系统日志设置
  getLogSettings() {
    return service.get('/admin/settings/logs');
  },

  // 更新系统日志设置
  updateLogSettings(data) {
    return service.put('/admin/settings/logs', data);
  },

  // 清除系统日志
  clearSystemLogs(data) {
    return service.post('/admin/settings/logs/clear', data);
  }
};

export { settingsApi }; 