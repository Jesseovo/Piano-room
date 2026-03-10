import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8099',
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
          .finally(() => {
            isShowingLoginPrompt = false
          })
      }
      return Promise.reject(new Error(res.msg || '未登录'))
    }
    return res
  },
  (error) => {
    console.error('请求错误:', error)
    ElMessage.error(error.message || '网络请求失败')
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
