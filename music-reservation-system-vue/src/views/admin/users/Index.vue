<template>
  <div class="users-container">
    <h2 class="page-title">用户管理</h2>
    
    <!-- 筛选和搜索 -->
    <el-card shadow="hover" class="filter-container">
      <div slot="header" class="clearfix">
        <span>用户列表</span>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">
          添加用户
        </el-button>
      </div>
      
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="搜索">
          <el-input v-model="queryParams.usernameOrRealNameOrStudentId" placeholder="学号/姓名/手机号" clearable>
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </el-form-item>
        
        <el-form-item label="用户类型">
          <el-select v-model="queryParams.userType" placeholder="请选择" clearable>
            <el-option label="学生" value="student"></el-option>
            <el-option label="教师" value="teacher"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable>
            <el-option label="正常" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 用户列表表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        border
        stripe
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="studentId" label="学号" show-overflow-tooltip width="120"></el-table-column>
        <el-table-column prop="realName" label="姓名" show-overflow-tooltip></el-table-column>
        <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
        <el-table-column prop="grade" label="年级" width="100"></el-table-column>
        <el-table-column prop="major" label="专业" show-overflow-tooltip width="150"></el-table-column>
        <el-table-column prop="userType" label="用户类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="userTypeTag(scope.row.userType)">{{ formatUserType(scope.row.userType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="170">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template slot-scope="scope">
            <transition-group name="fade">
              <el-button 
                key="view"
                size="mini" 
                type="primary" 
                icon="el-icon-view" 
                @click="handleView(scope.row)"
                title="查看">
              </el-button>
              <el-button 
                key="edit"
                size="mini" 
                type="success" 
                icon="el-icon-edit" 
                @click="handleUpdate(scope.row)"
                title="编辑">
              </el-button>
              <el-button
                key="reset"
                size="mini"
                type="warning"
                icon="el-icon-key"
                @click="handleResetPassword(scope.row)"
                title="重置密码">
              </el-button>
              <el-button
                key="delete"
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                title="删除">
              </el-button>
            </transition-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParams.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="queryParams.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 添加/编辑用户对话框 -->
    <user-form
      :visible.sync="formDialogVisible"
      :title="formDialogTitle"
      :user="selectedUser"
      :isAdd="isSubAdd"
      @success="handleFormSuccess"
    />
    
    <!-- 查看用户详情对话框 -->
    <user-detail
      :visible.sync="detailDialogVisible"
      :user="viewingUser"
    />
  </div>
</template>

<script>
import { userApi } from '@/api/user'
import UserForm from './components/UserForm'
import UserDetail from './components/UserDetail'

export default {
  name: 'Users',
  components: {
    UserForm,
    UserDetail
  },
  data() {
    return {
      // 是否为新增操作
      isSubAdd: true,
      // 加载状态
      loading: false,
      // 用户列表
      userList: [],
      // 总记录数
      total: 0,
      // 选中的行
      selectedRows: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        usernameOrRealNameOrStudentId: '',
        userType: '',
        status: ''
      },
      // 对话框显示状态
      formDialogVisible: false,
      detailDialogVisible: false,
      // 对话框标题
      formDialogTitle: '',
      // 当前选中的用户（用于表单）
      selectedUser: {},
      // 当前查看的用户（用于详情）
      viewingUser: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取用户列表
    getList() {
      this.loading = true
      userApi.getUserList(this.queryParams)
        .then(response => {
          if (response && response.code === 1) {
            this.userList = response.data.rows || []
            this.total = response.data.total || 0
          } else {
            this.$message.error(response.msg || '获取用户列表失败')
            this.userList = []
            this.total = 0
          }
          this.loading = false
        })
        .catch(error => {
          console.error('获取用户列表失败:', error)
          this.$message.error('获取用户列表失败')
          this.loading = false
        })
    },
    
    // 搜索
    handleSearch() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    
    // 重置查询条件
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        keyword: '',
        userType: '',
        status: ''
      }
      this.getList()
    },
    
    // 选择项变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 每页大小变化
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },
    
    // 页码变化
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.getList()
    },
    
    // 添加用户
    handleAdd() {
      this.isSubAdd = true
      this.selectedUser = {}
      this.formDialogTitle = '添加用户'
      this.formDialogVisible = true
    },
    
    // 查看用户详情
    handleView(row) {
      this.viewingUser = JSON.parse(JSON.stringify(row))
      this.detailDialogVisible = true
    },
    
    // 编辑用户
    handleUpdate(row) {
      this.isSubAdd = false
      this.selectedUser = JSON.parse(JSON.stringify(row))
      this.formDialogTitle = '编辑用户'
      this.formDialogVisible = true
    },
    
    // 重置密码
    handleResetPassword(row) {
      this.$confirm('确定要重置该用户的密码吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        userApi.resetPassword({ userId: row.id })
          .then(response => {
            if (response && response.code === 1) {
              this.$message.success('密码重置成功')
            } else {
              this.$message.error(response.msg || '密码重置失败')
            }
            this.loading = false
          })
          .catch(error => {
            console.error('密码重置失败:', error)
            this.$message.error('密码重置失败')
            this.loading = false
          })
      }).catch(() => {
        // 取消重置
      })
    },
    
    // 删除用户
    handleDelete(row) {
      this.$confirm('确定要删除该用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        userApi.deleteUser(row.id)
          .then(response => {
            if (response && response.code === 1) {
              this.$message.success('删除成功')
              this.getList()
            } else {
              this.$message.error(response.msg || '删除失败')
            }
            this.loading = false
          })
          .catch(error => {
            console.error('删除用户失败:', error)
            this.$message.error('删除失败')
            this.loading = false
          })
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 修改用户状态
    handleStatusChange(row) {
      const text = row.status === 1 ? '启用' : '禁用'
      this.$confirm(`确认要${text}该用户吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {

        const params = {
          userId: row.id,
          status: row.status
        }
        userApi.updateUserStatus(params)
          .then(response => {
            if (response && response.code === 1) {
              this.$message.success(`${text}成功`)
              this.getList()
            } else {
              this.$message.error(response.msg || `${text}失败`)
              // 状态修改失败，回滚
              row.status = row.status === 1 ? 0 : 1
            }
          })
          .catch(error => {
            console.error(`${text}用户失败:`, error)
            this.$message.error(`${text}失败`)
            // 状态修改失败，回滚
            row.status = row.status === 1 ? 0 : 1
          })
      }).catch(() => {
        // 取消操作，回滚状态
        row.status = row.status === 1 ? 0 : 1
      })
    },
    
    // 批量删除用户
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的用户')
        return
      }
      
      const ids = this.selectedRows.map(item => item.id)
      
      this.$confirm(`确认要删除选中的 ${ids.length} 个用户吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        userApi.batchDeleteUsers(ids)
          .then(response => {
            if (response && response.code === 1) {
              this.$message.success('批量删除成功')
              this.getList()
            } else {
              this.$message.error(response.msg || '批量删除失败')
            }
            this.loading = false
          })
          .catch(error => {
            console.error('批量删除用户失败:', error)
            this.$message.error('批量删除失败')
            this.loading = false
          })
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 表单提交成功回调
    handleFormSuccess() {
      this.formDialogVisible = false
      this.getList()
    },
    
    // 格式化时间
    formatDateTime(datetime) {
      if (!datetime) return '--'
      
      // 如果是字符串，直接返回
      if (typeof datetime === 'string') {
        return datetime
      }
      
      // 如果是Date对象，格式化为字符串
      if (datetime instanceof Date) {
        const year = datetime.getFullYear()
        const month = (datetime.getMonth() + 1).toString().padStart(2, '0')
        const day = datetime.getDate().toString().padStart(2, '0')
        const hours = datetime.getHours().toString().padStart(2, '0')
        const minutes = datetime.getMinutes().toString().padStart(2, '0')
        const seconds = datetime.getSeconds().toString().padStart(2, '0')
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }
      
      return '--'
    },
    
    // 格式化用户类型
    formatUserType(type) {
      switch (type) {
        case 'admin': return '管理员'
        case 'teacher': return '教师'
        case 'student': return '学生'
        default: return '未知'
      }
    },
    
    // 获取用户类型标签样式
    userTypeTag(type) {
      switch (type) {
        case 'student': return 'danger'
        case 'teacher': return 'warning'
        case 'admin': return 'success'
        default: return 'info'
      }
    }
  }
}
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-form {
  margin-top: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 按钮过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 表格行悬停效果 */
/deep/ .el-table__row:hover {
  background-color: #f5f7fa !important;
}

/* 表格中的标签样式 */
.el-tag {
  border-radius: 4px;
}
</style> 