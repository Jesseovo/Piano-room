import request from '@/utils/request'

export const recommendationApi = {
  recommend: (params: {
    userId: number
    startTime: string
    endTime: string
    limit?: number
  }) => request.get('/recommendations', { params }),
}
