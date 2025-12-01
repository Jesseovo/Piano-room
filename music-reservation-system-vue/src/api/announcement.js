import request from '@/utils/request';
import {
  getMockAnnouncementData,
  mockAddAnnouncement,
  mockUpdateAnnouncement,
  mockDeleteAnnouncements,
  mockSetAnnouncementStatus,
  mockIncrementViewCount
} from '@/views/admin/announcements/mock';

// 是否使用模拟数据
const useMockData = false;

export default {
    /**
     * 获取公告列表
     * @param {Object} params - 查询条件
     * @returns {Promise} - 返回公告列表的 Promise
     */
    getAnnouncements(params) {
        if (useMockData) {
            return Promise.resolve(getMockAnnouncementData(params));
        }
        return request({
            method: 'GET',
            url: '/announcements',
            params: params,
        });
    },

    /**
     * 添加公告
     * @param {Object} announcement - 公告对象
     * @returns {Promise} - 返回操作结果的 Promise
     */
    addAnnouncement(announcement) {
        if (useMockData) {
            return Promise.resolve(mockAddAnnouncement(announcement));
        }
        return request({
            method: 'POST',
            url: '/announcements',
            data: announcement,
        });
    },

    /**
     * 根据 ID 获取公告信息
     * @param {number} id - 公告 ID
     * @returns {Promise} - 返回公告信息的 Promise
     */
    getAnnouncementById(id) {
        if (useMockData) {
            // 从模拟数据中查找对应ID的公告
            const { mockAnnouncementList } = require('@/views/admin/announcements/mock');
            const announcement = mockAnnouncementList.find(item => item.id === id);
            return Promise.resolve({
                code: announcement ? 1 : 0,
                msg: announcement ? 'success' : '公告不存在',
                data: announcement || null
            });
        }
        return request({
            method: 'GET',
            url: `/announcements/${id}`,
        });
    },

    /**
     * 修改公告
     * @param {Object} announcement - 公告对象
     * @returns {Promise} - 返回操作结果的 Promise
     */
    updateAnnouncement(announcement) {
        if (useMockData) {
            return Promise.resolve(mockUpdateAnnouncement(announcement));
        }
        return request({
            method: 'PUT',
            url: '/announcements',
            data: announcement,
        });
    },

    /**
     * 删除公告
     * @param {Array} ids - 公告 ID 数组
     * @returns {Promise} - 返回操作结果的 Promise
     */
    deleteAnnouncements(ids) {
        if (useMockData) {
            return Promise.resolve(mockDeleteAnnouncements(ids));
        }
        return request({
            method: 'DELETE',
            url: '/announcements',
            data: ids,
        });
    },

    /**
     * 阅读量统计
     * @param {number} id - 公告 ID
     * @returns {Promise} - 返回操作结果的 Promise
     */
    incrementViewCount(id) {
        if (useMockData) {
            return Promise.resolve(mockIncrementViewCount(id));
        }
        return request({
            method: 'POST',
            url: `/announcements/${id}/view`,
        });
    },

    /**
     * 设置发布状态
     * @param {number} status - 发布状态
     * @param {number} id - 公告 ID
     * @returns {Promise} - 返回操作结果的 Promise
     */
    setAnnouncementStatus(status, id) {
        if (useMockData) {
            return Promise.resolve(mockSetAnnouncementStatus(status, id));
        }
        return request({
            method: 'POST',
            url: `/announcements/status/${status}`,
            params: { id: id },
        });
    },
};
