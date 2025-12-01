import request from '@/utils/request'

/**
 * 获取维修记录列表
 * @param {Object} data - 查询条件
 * @returns {Promise}
 */
export function listMaintenance(data) {
  return request({
    url: '/maintenance/list',
    method: 'get',
    data
  })
}

/**
 * 新增维修记录
 * @param {Object} data - 维修记录数据
 * @returns {Promise}
 */
export function addMaintenance(data) {
  return request({
    url: '/maintenance/add',
    method: 'post',
    data
  })
}

/**
 * 编辑维修记录
 * @param {Object} data - 维修记录数据
 * @returns {Promise}
 */
export function updateMaintenance(data) {
  return request({
    url: '/maintenance/update',
    method: 'put',
    data
  })
}

/**
 * 批量删除维修记录
 * @param {Array} ids - 维修记录ID数组
 * @returns {Promise}
 */
export function deleteBatchMaintenance(ids) {
  return request({
    url: '/maintenance/batch',
    method: 'delete',
    data: ids
  })
}

/**
 * 修改维修记录状态
 * @param {Number} roomId - 教室ID
 * @param {String} status - 状态
 * @returns {Promise}
 */
export function updateMaintenanceStatus(roomId, status) {
  return request({
    url: '/maintenance/updateStatus',
    method: 'post',
    params: {
      roomId,
      status
    }
  })
} 