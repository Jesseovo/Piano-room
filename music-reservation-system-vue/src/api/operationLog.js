import service from '@/utils/request';

// 操作日志管理 API
const operationLogApi = {
  /**
   * 分页获取操作日志列表
   * @param {Object} params - 分页参数
   * @param {number} params.page - 当前页码，默认为1
   * @param {number} params.pageSize - 每页数量，默认为10
   * @returns {Promise} - 返回请求的Promise对象
   */
  getOperationLogPage(params) {
    return service.get('/operationLogs/page', { params });
  },
};

// 导出 API
export { operationLogApi }; 