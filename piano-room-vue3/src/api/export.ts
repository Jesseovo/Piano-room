import request from '@/utils/request'

export const exportApi = {
  exportReservations: (params: { start?: string; end?: string; status?: string }) =>
    request.get('/export/reservations', { params, responseType: 'blob' }),

  exportUsers: (params: { keyword?: string; userType?: string }) =>
    request.get('/export/users', { params, responseType: 'blob' }),

  exportRooms: () => request.get('/export/rooms', { responseType: 'blob' }),
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
