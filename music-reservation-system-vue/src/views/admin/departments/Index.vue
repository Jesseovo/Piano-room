<template>
  <div class="departments-container">
    <h2 class="page-title">院系管理</h2>
    
    <!-- 筛选和搜索 -->
    <el-card shadow="hover" class="filter-container">
      <div slot="header" class="clearfix">
        <span>院系列表</span>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">
          添加院系
        </el-button>
      </div>
      
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="搜索">
          <el-input v-model="queryParams.keyword" placeholder="院系名称/代码" clearable>
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 批量删除按钮 -->
      <!-- <el-button type="danger" size="small" icon="el-icon-delete" @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button> -->

      <!-- 院系列表表格 -->
      <el-table
        v-loading="loading"
        :data="departmentList"
        border
        stripe
        @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
        <el-table-column prop="name" label="院系名称" show-overflow-tooltip></el-table-column>
        <el-table-column prop="code" label="院系代码" width="150"></el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.updatedAt) }}
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
    
    <!-- 添加/编辑院系对话框 -->
    <department-form
      :visible.sync="formDialogVisible"
      :title="formDialogTitle"
      :department="selectedDepartment"
      @success="handleFormSuccess"
    />
    
    <!-- 查看院系详情对话框 -->
    <department-detail
      :visible.sync="detailDialogVisible"
      :department="viewingDepartment"
    />
  </div>
</template>

<script>
import deptApi from '@/api/dept'
import DepartmentForm from './components/DepartmentForm'
import DepartmentDetail from './components/DepartmentDetail'
import { formatDate } from '@/utils/date'

export default {
  name: 'Departments',
  components: {
    DepartmentForm,
    DepartmentDetail
  },
  data() {
    return {
      // 加载状态
      loading: false,
      // 院系列表
      departmentList: [],
      // 总记录数
      total: 0,
      // 选中的行
      selectedRows: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        keyword: ''
      },
      // 对话框显示状态
      formDialogVisible: false,
      detailDialogVisible: false,
      // 对话框标题
      formDialogTitle: '',
      // 当前选中的院系（用于表单）
      selectedDepartment: {},
      // 当前查看的院系（用于详情）
      viewingDepartment: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取院系列表
    getList() {
      this.loading = true
      // 实际项目中会根据页码和条件查询
      // 这里暂时获取所有数据，然后前端分页
      deptApi.list()
        .then(response => {
          this.departmentList = response.data || []
          this.total = this.departmentList.length
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    
    // 搜索
    handleSearch() {
      // console.log('搜索按钮', this.queryParams)
      this.queryParams.pageNum = 1
      this.getList()
    },
    
    // 重置查询条件
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        keyword: ''
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
    
    // 添加院系
    handleAdd() {
      this.formDialogTitle = '添加院系'
      this.selectedDepartment = {
        name: '',
        code: '',
      }
      this.formDialogVisible = true
    },
    
    // 更新院系
    handleUpdate(row) {
      this.formDialogTitle = '编辑院系'
      this.selectedDepartment = JSON.parse(JSON.stringify(row))
      this.formDialogVisible = true
    },
    
    // 查看院系
    handleView(row) {
      this.viewingDepartment = JSON.parse(JSON.stringify(row))
      this.detailDialogVisible = true
    },
    
    // 删除院系
    handleDelete(row) {
      this.$confirm('确认删除该院系吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deptApi.delete(row.id)
          .then(() => {
            this.$message.success('删除成功')
            this.getList()
          })
          .catch(() => {
            this.$message.error('删除失败')
          })
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的院系')
        return
      }
      
      this.$confirm(`确认删除选中的 ${this.selectedRows.length} 个院系吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = this.selectedRows.map(row => row.id)
        // 注意：这里需要修改API接口支持批量删除，目前接口只支持单个删除
        deptApi.delete(ids[0]) // 如果后端支持批量删除，需要调整此处代码
          .then(() => {
            this.$message.success('删除成功')
            this.getList()
          })
          .catch(() => {
            this.$message.error('删除失败')
          })
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 表单提交成功
    handleFormSuccess() {
      // 不再需要手动关闭对话框，因为子组件已经通过 update:visible 事件关闭
      // this.formDialogVisible = false
      this.getList()
    },
    
    // 格式化日期时间
    formatDateTime(value) {
      if (!value) return ''
      return formatDate(new Date(value), 'yyyy-MM-dd HH:mm:ss')
    }
  }
}
</script>

<style scoped>
.departments-container {
  padding: 20px;
  animation: fade-in 0.8s;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
  position: relative;
}

.page-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 50px;
  height: 3px;
  background-color: #409EFF;
  animation: width-grow 1s ease-out;
}

@keyframes width-grow {
  from { width: 0; }
  to { width: 50px; }
}

.filter-container {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.filter-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.filter-form {
  margin-top: 20px;
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 按钮过渡效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

/* 为表格行添加悬停效果 */
/deep/ .el-table__row {
  transition: all 0.3s ease;
}

/deep/ .el-table__row:hover {
  background-color: #f0f9ff !important;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 悬停时按钮缩放效果 */
.el-button {
  transition: all 0.2s ease;
}

.el-button:hover {
  transform: scale(1.05);
}
</style> 