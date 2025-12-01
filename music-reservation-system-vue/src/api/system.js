import service from '@/utils/request'

/**
 * 获取邮件设置
 * @returns {Promise} 返回邮件设置信息
 */
export function getEmailSettings() {
  return service({
    url: '/system/settings/email',
    method: 'get'
  })
}

/**
 * 保存邮件设置
 * @param {Object} data 邮件设置数据
 * @returns {Promise} 返回保存结果
 */
export function saveEmailSettings(data) {
  return service({
    url: '/system/settings/email',
    method: 'post',
    data
  })
}

/**
 * 测试邮件设置
 * @param {Object} data 测试邮件数据
 * @returns {Promise} 返回测试结果
 */
export function testEmailSettings(data) {
  return service({
    url: '/system/settings/email/test',
    method: 'post',
    data
  })
}

/**
 * 获取系统基本设置
 * @returns {Promise} 返回系统基本设置
 */
export function getSystemSettings() {
  return service({
    url: '/system/settings',
    method: 'get'
  })
}

/**
 * 保存系统基本设置
 * @param {Object} data 系统基本设置数据
 * @returns {Promise} 返回保存结果
 */
export function saveSystemSettings(data) {
  return service({
    url: '/system/settings',
    method: 'post',
    data
  })
}

export default {
  getEmailSettings,
  saveEmailSettings,
  testEmailSettings,
  getSystemSettings,
  saveSystemSettings
} 