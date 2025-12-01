
import request from "@/utils/request";

// 用户认证与管理 API
const userApi = {

  //获取验证码
  getCaptcha(params) {
   return request.get('/user/captcha',{
    params: params
   })
  },

  // 用户登录
  login(data) {
    return request({
      url: '/user/login',
      method: 'post',
      data
    })
  },
  
  // 获取用户信息
  getUserInfo(userId) {
    return request({
      url: '/user/getUserInfo',
      method: 'get',
      params: {
        userId
      }
    })
  },
  
  // 退出登录
  logout() {
    return request.post('/user/logout');
  },
  
  // 发送邮箱验证码
  sendEmailCode(params) {
    return request.get('/user/email/code', { params });
  },
  
  // 发送手机验证码
  sendPhoneCode(phone) {
    return request.get(`/user/phone/code?phone=${phone}`);
  },
  
  // 用户注册功能已移除（仅超级管理员可在后台创建用户）
  
  // 添加用户（管理员用）
  addUser(data) {
    return request({
      url: '/user/add',
      method: 'post',
      data
    })
  },
  
  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/user/info', data);
  },
  
  // 更改密码
  changePassword(data) {
    return request({
      url: '/user/password',
      method: 'put',
      data
    })
  },
  
  // 获取用户列表（管理员用）
  getUserList(params) {
    return request({
      url: '/user/list',
      method: 'get',
      params
    })
  },
  
  // 获取教师列表
  getTeacherList() {
    return request.get('/user/teachers');
  },
  


  // 更新用户状态（启用/禁用）
  updateUserStatus(params) {
    return request({
      url: '/user/status',
      method: 'post',
      data: params
    })
  },

  // 根据用户ID获取用户详情
  getUserById(id) {
    return request.get(`/user/${id}`);
  },

  // 获取用户统计信息（用于仪表盘）
  getUserStats() {
    return request.get('/admin/user/stats');
  },


};

// 导出 API
export { userApi }; 