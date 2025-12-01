// 模拟院系数据列表
export const mockDepartmentList = [
  {
    id: 1,
    name: '计算机科学与技术学院',
    code: 'CS',
    createdAt: '2023-01-01T08:00:00',
    updatedAt: '2023-01-01T08:00:00'
  },
  {
    id: 2,
    name: '电子信息工程学院',
    code: 'EE',
    createdAt: '2023-01-02T09:00:00',
    updatedAt: '2023-01-02T09:00:00'
  },
  {
    id: 3,
    name: '机械工程学院',
    code: 'ME',
    createdAt: '2023-01-03T10:00:00',
    updatedAt: '2023-01-03T10:00:00'
  },
  {
    id: 4,
    name: '材料科学与工程学院',
    code: 'MSE',
    createdAt: '2023-01-04T11:00:00',
    updatedAt: '2023-01-04T11:00:00'
  },
  {
    id: 5,
    name: '理学院',
    code: 'SCI',
    createdAt: '2023-01-05T12:00:00',
    updatedAt: '2023-01-05T12:00:00'
  }
];

// 生成自增ID
let currentId = mockDepartmentList.length + 1;

/**
 * 根据查询条件获取模拟数据
 * @param {Object} params - 查询条件
 * @returns {Object} - 符合条件的结果
 */
export function getMockDepartmentData(params = {}) {
  let filteredData = [...mockDepartmentList];
  
  // 关键字过滤
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.code.toLowerCase().includes(keyword)
    );
  }
  
  // 计算总记录数
  const total = filteredData.length;
  
  // 返回结果
  return {
    code: 1,
    msg: 'success',
    data: filteredData,
    total: total
  };
}

/**
 * 添加模拟院系数据
 * @param {Object} department - 院系对象
 * @returns {Object} - 操作结果
 */
export function mockAddDepartment(department) {
  const newDepartment = {
    ...department,
    id: currentId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockDepartmentList.push(newDepartment);
  
  return {
    code: 1,
    msg: 'success',
    data: newDepartment
  };
}

/**
 * 更新模拟院系数据
 * @param {Object} department - 院系对象
 * @returns {Object} - 操作结果
 */
export function mockUpdateDepartment(department) {
  const index = mockDepartmentList.findIndex(item => item.id === department.id);
  
  if (index === -1) {
    return {
      code: 0,
      msg: '院系不存在',
      data: null
    };
  }
  
  const updatedDepartment = {
    ...mockDepartmentList[index],
    ...department,
    updatedAt: new Date().toISOString()
  };
  
  mockDepartmentList[index] = updatedDepartment;
  
  return {
    code: 1,
    msg: 'success',
    data: updatedDepartment
  };
}

/**
 * 删除模拟院系数据
 * @param {number} id - 院系ID
 * @returns {Object} - 操作结果
 */
export function mockDeleteDepartment(id) {
  const index = mockDepartmentList.findIndex(item => item.id === id);
  
  if (index === -1) {
    return {
      code: 0,
      msg: '院系不存在',
      data: null
    };
  }
  
  mockDepartmentList.splice(index, 1);
  
  return {
    code: 1,
    msg: 'success',
    data: null
  };
}

/**
 * 根据ID获取模拟院系数据
 * @param {number} id - 院系ID
 * @returns {Object} - 操作结果
 */
export function mockGetDepartmentById(id) {
  const department = mockDepartmentList.find(item => item.id === id);
  
  if (!department) {
    return {
      code: 0,
      msg: '院系不存在',
      data: null
    };
  }
  
  return {
    code: 1,
    msg: 'success',
    data: department
  };
} 