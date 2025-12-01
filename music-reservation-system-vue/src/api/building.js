import request from '@/utils/request';

// 建筑管理 API
const buildingApi = {
    /**
     * 添加建筑信息
     * @param {Object} building - 建筑对象
     * @returns {Promise} - 返回操作结果的 Promise
     */
    addBuilding(building) {
        return request({
            method: 'POST',
            url: '/buildings',
            data: building,
        });
    },

    /**
     * 删除建筑信息
     * @param {number} id - 建筑ID
     * @returns {Promise} - 返回操作结果的 Promise
     */
    deleteBuilding(id) {
        return request({
            method: 'DELETE',
            url: `/buildings/${id}`,
        });
    },

    /**
     * 更新建筑信息
     * @param {Object} building - 建筑对象
     * @returns {Promise} - 返回操作结果的 Promise
     */
    updateBuilding(building) {
        return request({
            method: 'PUT',
            url: '/buildings',
            data: building,
        });
    },

    /**
     * 根据ID查询建筑信息
     * @param {number} id - 建筑ID
     * @returns {Promise} - 返回建筑信息的 Promise
     */
    getBuildingById(id) {
        return request({
            method: 'GET',
            url: `/buildings/${id}`,
        });
    },

    /**
     * 查询所有建筑信息
     * @returns {Promise} - 返回建筑列表的 Promise
     */
    getAllBuildings() {
        return request({
            method: 'GET',
            url: '/buildings',
        });
    },
};

// 导出 API
export { buildingApi };
