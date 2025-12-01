import service from '@/utils/request';

// 教室类型管理 API
const roomTypeApi = {
  // 查询所有教室类型
  list(params) {
    return service.get('/classType', { params });
  },

  // 添加教室类型
  save(roomType) {
    return service.post('/classType', roomType);
  },

  // 删除教室类型
  deleteById(id) {
    return service.delete(`/classType/${id}`);
  },

  // 根据ID查询教室类型
  getById(id) {
    return service.get(`/classType/${id}`);
  },

  // 更新教室类型信息
  update(roomType) {
    return service.put('/classType', roomType);
  },
  
  // 获取所有可用的教室类型（用于下拉选择）
  getAllTypes() {
    return service.get('/classType/all');
  }
};

// 导出 API
export { roomTypeApi }; 