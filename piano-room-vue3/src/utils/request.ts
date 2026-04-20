import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  withCredentials: true,
})

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

let isShowingLoginPrompt = false

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    // 处理401未授权错误
    if (res?.code === 401) {
      if (!isShowingLoginPrompt) {
        isShowingLoginPrompt = true
        ElMessageBox.confirm(res.msg || '登录已过期，请重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            if (router.currentRoute.value.path !== '/login') {
              router.replace('/login')
            }
          })
          .catch(() => {
            // 用户取消，不做处理
          })
          .finally(() => {
            isShowingLoginPrompt = false
          })
      }
      return Promise.reject(new Error(res.msg || '未登录'))
    }
    // 处理业务错误（后端：1成功，0失败）
    if (res?.code === 0) {
      ElMessage.error(res.msg || '操作失败')
      return Promise.reject(new Error(res.msg || '操作失败'))
    }
    // code为1或其他值都视为成功，直接返回
    return res
  },
  (error) => {
    // 处理HTTP错误
    let errorMsg = '网络请求失败'
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 401:
          errorMsg = '未登录或登录已过期'
          break
        case 403:
          errorMsg = '没有权限执行此操作'
          break
        case 404:
          errorMsg = '请求的资源不存在'
          break
        case 500:
          errorMsg = '服务器内部错误'
          break
        default:
          errorMsg = `请求失败: ${error.response.status}`
      }
    } else if (error.request) {
      // 请求发送但没有收到响应
      errorMsg = '服务器无响应，请检查网络连接'
    } else {
      // 请求配置出错
      errorMsg = error.message || '请求配置错误'
    }
    console.error('请求错误:', error)
    ElMessage.error(errorMsg)
    return Promise.reject(error)
  }
)

// 封装方法，返回 any 使调用方无需处理 AxiosResponse 类型
const request = {
  get: (url: string, config?: AxiosRequestConfig): Promise<any> => instance.get(url, config),
  post: (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<any> => instance.post(url, data, config),
  put: (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<any> => instance.put(url, data, config),
  delete: (url: string, config?: AxiosRequestConfig): Promise<any> => instance.delete(url, config),
  patch: (url: string, data?: unknown, config?: AxiosRequestConfig): Promise<any> => instance.patch(url, data, config),
}

export default request
