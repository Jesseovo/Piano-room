import request from '@/utils/request'
import type { PageResult, User } from './types'

export interface LoginParams {
  username: string
  password: string
  captcha: string
  captchaKey: string
}

export interface RegisterParams {
  username: string
  password: string
  realName: string
  email: string
  studentId: string
  captchaCode: string
  captchaKey: string
  emailCode: string
  emailCodeKey: string
}

export interface VerificationChallenge {
  image?: string
  verificationKey: string
  expiresInSeconds: number
}

export interface UserQueryParams {
  page?: number
  pageSize?: number
  userType?: string
  status?: number
  usernameOrRealNameOrStudentId?: string
}

export const userApi = {
  login: (data: LoginParams) => request.post('/user/login', data),
  register: (data: RegisterParams) => request.post('/user/register', data),
  getCaptcha: (type: number) => request.get('/user/captcha', { params: { type } }),
  sendEmailCode: (email: string, type: number) => request.get('/user/email/code', { params: { email, type } }),
  getUserInfo: (userId: number) => request.get('/user/getUserInfo', { params: { userId } }),
  getById: (id: number) => request.get(`/user/${id}`),
  list: (params: UserQueryParams): Promise<{ code: number; data: PageResult<User> }> => request.get('/user/list', { params }),
  update: (data: Partial<User> & { id?: number }) => request.put('/user/info', data),
  resetPassword: (data: { id: number; oldPassword?: string; newPassword: string; againPassword: string }) =>
    request.put('/user/password', data),
  setStatus: (userId: number, status: number) => request.post('/user/status', { userId, status }),
  delete: (ids: number[]) => request.delete('/user', { data: ids }),
  addUser: (data: Partial<User> & { password: string }) => request.post('/user/add', data),
}
