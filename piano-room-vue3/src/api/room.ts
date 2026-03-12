import request from '@/utils/request'
import type { Room } from './types'

export interface RoomQueryParams {
  page?: number
  pageSize?: number
  name?: string
  status?: number
  roomTypeId?: number
  departmentId?: number
  buildingId?: number
}

export interface RoomSearchParams {
  buildingId?: number
  roomTypeId?: number
  departmentId?: number
  minCapacity?: number
  maxCapacity?: number
  /** 日期，格式 YYYY-MM-DD，对应后端 RoomDTO.date (LocalDate) */
  date?: string
  /** 开始时间，格式 HH:mm，对应后端 RoomDTO.startTime (LocalTime) */
  startTime?: string
  /** 结束时间，格式 HH:mm，对应后端 RoomDTO.endTime (LocalTime) */
  endTime?: string
  pageNum?: number
  pageSize?: number
}

export const roomApi = {
  list: (params: RoomQueryParams) => request.get('/room', { params }),
  getById: (id: number) => request.get(`/room/${id}`),
  create: (data: Partial<Room>) => request.post('/room', data),
  update: (data: Partial<Room>) => request.put('/room', data),
  setStatus: (id: number, status: number) => request.put(`/room/${id}/status`, null, { params: { status } }),
  delete: (id: number) => request.delete(`/room/${id}`),
  search: (params: RoomSearchParams) => request.get('/room/search', { params }),
  getHotToday: (limit = 5) => request.get('/room/hot-today', { params: { limit } }),
  setMaintenance: (data: {
    roomId: number
    startTime: string
    endTime: string
    reason: string
    maintenanceType: string
  }) => request.post('/room/maintenance', data),
  getMaintenance: (roomId: number) => request.get(`/room/maintenance/${roomId}`),
}
