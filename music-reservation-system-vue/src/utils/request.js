import axios from 'axios';
import { Message, MessageBox } from 'element-ui'; // 导入MessageBox
import router from '@/router'; // 如果使用 Vue Router

// 创建 axios 实例
const service = axios.create({
  // baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080',
  baseURL: 'http://localhost:8099',
  // timeout: 15000, // 请求超时时间
  withCredentials: true, // 跨域请求时是否需要使用凭证
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    
    // 如果有 token，可以在这里统一添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 处理请求数据
    if (config.method === 'post' || config.method === 'put') {
      // 可以对请求数据做一些处理
      // config.data = JSON.stringify(config.data);
    }

     // 检测是否为文件上传
     if (config.data instanceof FormData) {
      // 如果数据是FormData类型，说明是文件上传，删除Content-Type让浏览器自动设置为multipart/form-data
      delete config.headers['Content-Type'];
    } else if (config.method === 'post' || config.method === 'put') {
      // 其他POST或PUT请求，确保使用JSON格式
      config.headers['Content-Type'] = 'application/json;charset=utf-8';
      // 可以对请求数据做一些处理
      // config.data = JSON.stringify(config.data);
    }
    
    return config;
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const res = response.data;
    
    // 如果是401未授权，使用ElementUI的MessageBox提示用户
    if(res && res.code == 401){
      // 如果未显示过提示，则显示
      if (!window.isShowingLoginMessage) {
        window.isShowingLoginMessage = true;
        
        // 使用Element UI的MessageBox提示用户
        MessageBox.confirm(
          res.msg || res.message || '未登录或token已过期，请重新登录',
          '提示',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          // 清除认证信息
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // 跳转到登录页面
          if(router.currentRoute.path !== '/login'){
            router.replace('/login');
          }
        }).catch(() => {
          // 用户取消了操作
        }).finally(() => {
          window.isShowingLoginMessage = false;
        });
      }
      
      // 返回一个空的成功响应对象，不触发catch
      return { code: -1, msg: '登录已过期', data: null };
    }
    
    // 返回响应数据
    return res;
  },
  // 添加错误处理
  (error) => {
    console.error('请求错误:', error);
    Message.error('网络请求失败');
    return Promise.reject(error);
  }
);



// 导出 axios 实例
export default service;