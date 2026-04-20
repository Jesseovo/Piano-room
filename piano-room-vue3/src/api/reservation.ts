import request from '@/utils/request'

export interface ReservationCreateParams {
  roomId: number
  title: string
  purpose: string
  startTime: string
  endTime: string
  attendees?: number
  remarks?: string
}

/** 图书馆式一键快速预约参数（后端自动填充 userId/title/purpose） */
export interface QuickReservationParams {
  roomId: number
  startTime: string
  endTime: string
  remarks?: string
}

export interface ReservationQueryParams {
  pageNum?: number
  pageSize?: number
  userId?: number
  roomId?: number
  status?: string
  startDate?: string
  endDate?: string
  username?: string
  roomName?: string
}

export const reservationApi = {
  create: (data: ReservationCreateParams) => request.post('/reservations', data),
  /** 图书馆式一键快速预约，后端从 JWT 解析用户身份 */
  quickCreate: (data: QuickReservationParams) => request.post('/reservations/quick', data),
  list: (params: ReservationQueryParams) => request.get('/reservations/list', { params }),
  getById: (id: number) => request.get(`/reservations/${id}`),
  update: (id: number, data: Record<string, unknown>) => request.put(`/reservations/${id}`, data),
  cancel: (id: number, reason?: string) => request.put(`/reservations/${id}/cancel`, { remarks: reason }),
  getAvailability: (roomId: number, date: string) =>
    request.get('/reservations/availability', { params: { roomId, date } }),
  signIn: (id: number, longitude?: number, latitude?: number) => 
    request.post(`/reservations/${id}/sign-in`, null, { params: { longitude, latitude } }),
  signOut: (id: number) => request.post(`/reservations/${id}/sign-out`),
  adminAssistSignIn: (id: number) => request.post(`/reservations/${id}/admin-sign-in`),
  adminAssistSignOut: (id: number) => request.post(`/reservations/${id}/admin-sign-out`),
  adminAssistCancel: (id: number, reason?: string) => request.put(`/reservations/${id}/admin-cancel`, { remarks: reason }),
  listPracticeDuration: (params: ReservationQueryParams) =>
    request.get('/reservations/practiceduration', { params }),
}
