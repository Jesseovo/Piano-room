import service from '@/utils/request';

// 反馈管理 API
const feedbackApi = {
  /**
   * 提交反馈
   * @param {Object} feedback - 反馈信息对象
   * @returns {Promise}
   */
  submitFeedback(feedback) {
    return service.post('/feedbacks', feedback);
  },

  /**
   * 获取所有反馈（分页）
   * @param {number} page - 页码
   * @param {number} pageSize - 每页大小
   * @returns {Promise}
   */
  getAllFeedbacks(params) {
    return service.get('/feedbacks', { params });
  },

  /**
   * 批量删除反馈
   * @param {Array<number>} ids - 反馈ID数组
   * @returns {Promise}
   */
  deleteFeedbacks(ids) {
    return service.delete('/feedbacks', { data: ids });
  },

  /**
   * 设置反馈状态
   * @param {number} id - 反馈ID
   * @param {number} status - 状态值
   * @returns {Promise}
   */
  setStatus(id, status) {
    return service.put(`/feedbacks/status/${status}?id=${id}`);
  }
};

// 导出 API
export { feedbackApi }; 