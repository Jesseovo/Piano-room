import request from '@/utils/request';
import {
  getMockDepartmentData,
  mockAddDepartment,
  mockUpdateDepartment,
  mockDeleteDepartment,
  mockGetDepartmentById
} from '@/views/admin/departments/mock';

// 是否使用模拟数据
const useMockData = false;

export default {
    /**
     * 查询所有部门信息
     * @returns {Promise} - 返回部门列表的 Promise
     */
    list(){
        if (useMockData) {
            return Promise.resolve(getMockDepartmentData());
        }
        return request({
            method: 'GET',
            url: '/depts',
        });
    },

    /**
     * 根据ID删除部门信息
     * @param {number} id - 部门ID
     * @returns {Promise} - 返回操作结果的 Promise
     */
    delete(id) {
        if (useMockData) {
            return Promise.resolve(mockDeleteDepartment(id));
        }
        return request({
            method: 'DELETE',
            url: '/depts',
            params: { id: id },
        });
    },

    /**
     * 添加部门信息
     * @param {Object} dept - 部门对象
     * @returns {Promise} - 返回操作结果的 Promise
     */
    add(dept) {
        if (useMockData) {
            return Promise.resolve(mockAddDepartment(dept));
        }
        return request({
            method: 'POST',
            url: '/depts',
            data: dept,
        });
    },

    /**
     * 根据ID查询部门信息
     * @param {number} id - 部门ID
     * @returns {Promise} - 返回部门信息的 Promise
     */
    getById(id) {
        if (useMockData) {
            return Promise.resolve(mockGetDepartmentById(id));
        }
        return request({
            method: 'GET',
            url: `/depts/${id}`,
        });
    },

    /**
     * 修改部门信息
     * @param {Object} dept - 部门对象
     * @returns {Promise} - 返回操作结果的 Promise
     */
    update(dept) {
        if (useMockData) {
            return Promise.resolve(mockUpdateDepartment(dept));
        }
        return request({
            method: 'PUT',
            url: '/depts',
            data: dept,
        });
    },
};
