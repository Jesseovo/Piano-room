export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

export interface PageResult<T> {
  total: number
  rows: T[]
}

export interface User {
  id: number
  username: string
  realName: string
  studentId: string
  email: string
  phone: string
  grade: string
  major: string
  userType: string
  avatarUrl: string
  status: number
  lastLoginTime: string
  createdAt: string
  departmentId: number
  departmentName: string
}

export interface Room {
  id: number
  roomNumber: string
  name: string
  buildingId: number
  floor: number
  capacity: number
  roomTypeId: number
  type: string
  facilities: string
  status: number
  description: string
  seats: string
  departmentId: number
  departmentName: string
  buildingName: string
}

export interface Reservation {
  id: number
  userId: number
  roomId: number
  title: string
  purpose: string
  startTime: string
  endTime: string
  attendees: number
  status: string
  remarks: string
  reviewerId: number
  reviewTime: string
  reviewRemarks: string
  signStartTime: string
  signEndTime: string
  createdAt: string
  roomName: string
  username: string
  roomLocation: string
  phone: string
}

export interface Department {
  id: number
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface ClassType {
  id: number
  typeName: string
  description: string
  createdAt: string
  updatedAt: string
}
