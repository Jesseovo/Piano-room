import request from '@/utils/request'

/**
 * 管理员相关接口
 */
export const adminApi = {
  /**
   * 获取管理员列表(含条件查询)
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getList(params) {
    return request({
      url: '/admins/list',
      method: 'get',
      params
    })
  },
  
  /**
   * 新增管理员
   * @param {Object} data - 管理员信息
   * @returns {Promise}
   */
  add(data) {
    return request({
      url: '/admins',
      method: 'post',
      data
    })
  },
  
  /**
   * 根据id获取管理员信息
   * @param {Number} id - 管理员ID
   * @returns {Promise}
   */
  getById(id) {
    return request({
      url: `/admins/${id}`,
      method: 'get'
    })
  },
  
  /**
   * 重置管理员密码
   * @param {Object} data - 包含id、password和againPassword的对象
   * @returns {Promise}
   */
  resetPassword(data) {
    return request({
      url: '/admins',
      method: 'put',
      params: {
        id: data.id,
        password: data.password,
        againPassword: data.password
      }
    })
  },
  
  /**
   * 批量删除管理员
   * @param {Array} ids - 管理员ID数组
   * @returns {Promise}
   */
  batchDelete(ids) {
    return request({
      url: '/admins',
      method: 'delete',
      data: ids
    })
  },
  
  /**
   * 删除单个管理员
   * @param {Number} id - 管理员ID
   * @returns {Promise}
   */
  delete(id) {
    return request({
      url: '/admins',
      method: 'delete',
      params: id
    })
  },
  
  /**
   * 启用禁用管理员账号
   * @param {Object} data - 包含id和status的对象
   * @returns {Promise}
   */
  updateStatus(data) {
    return request({
      url: `/admins/status/${data.status}`,
      method: 'post',
      params: { id: data.id }
    })
  },
  
  /**
   * 更新管理员信息
   * @param {Object} data - 管理员信息
   * @returns {Promise}
   */
  update(data) {
    return request({
      url: '/admins/info',
      method: 'put',
      data
    })
  }
} 