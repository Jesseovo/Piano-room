<template>
  <div class="maintenance-container">
    <div class="filter-container">
      <el-form :inline="true" :model="listQuery" class="demo-form-inline">
        <el-form-item label="琴房名称">
          <el-input v-model="listQuery.roomName" placeholder="琴房名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="维修状态">
          <el-select v-model="listQuery.status" placeholder="维修状态" clearable>
            <el-option label="未开始" value="未开始"></el-option>
            <el-option label="进行中" value="进行中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已取消" value="已取消"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="listQuery.maintenanceType" placeholder="维修类型" clearable>
            <el-option label="定期维护" value="定期维护"></el-option>
            <el-option label="设备故障" value="设备故障"></el-option>
            <el-option label="环境整治" value="环境整治"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
     
      
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="加载中..."
        border
        fit
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="ID" prop="id" align="center" width="60"></el-table-column>
        <el-table-column label="琴房名称" prop="roomName" align="center"></el-table-column>
        <el-table-column label="维修类型" prop="maintenanceType" align="center"></el-table-column>
        <el-table-column label="维修原因" prop="reason" align="center"></el-table-column>
        <el-table-column label="开始时间" align="center">
          <template slot-scope="{row}">
            <span>{{ row.startTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center">
          <template slot-scope="{row}">
            <span>{{ row.endTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="维修状态" align="center">
          <template slot-scope="{row}">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="创建时间" align="center">
          <template slot-scope="{row}">
            <span>{{ row.createdAt }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" align="center" width="280">
          <template slot-scope="{row}">
            <el-button 
              size="mini" 
              type="info"
              @click="handleViewDetails(row)"
            >
              详情
            </el-button>
            <!-- <el-button 
              size="mini" 
              type="warning"
              @click="handleEdit(row)"
            >
              编辑
            </el-button> -->
            
            <el-dropdown @command="(command) => handleStatusCommand(row.roomId || row.id, command)">
              <el-button size="mini" type="primary">
                更新状态<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="未开始">设为未开始</el-dropdown-item>
                <el-dropdown-item command="进行中">设为进行中</el-dropdown-item>
                <el-dropdown-item command="已完成">设为已完成</el-dropdown-item>
                <el-dropdown-item command="已取消">设为已取消</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

            <el-button 
              size="mini" 
              type="danger" 
              @click="handleDelete(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </div>
    
    <!-- 维修记录表单 -->
    <maintenance-form
      :visible.sync="formVisible"
      :is-edit="isEdit"
      :current-data="currentData"
      @close="closeForm"
      @submit="submitForm"
    />
    
    <!-- 维修记录详情 -->
    <maintenance-details
      :visible.sync="detailsVisible"
      :maintenance="currentData"
      @close="closeDetails"
      @edit="handleEdit"
    />
  </div>
</template>

<script>
import { listMaintenance, deleteBatchMaintenance, updateMaintenanceStatus, addMaintenance, updateMaintenance } from '@/api/maintenance'
import MaintenanceForm from './components/MaintenanceForm'
import MaintenanceDetails from './components/MaintenanceDetails'

export default {
  name: 'MaintenanceManagement',
  components: {
    MaintenanceForm,
    MaintenanceDetails
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      selectedItems: [],
      listQuery: {
        page: 1,
        size: 10,
        roomName: '',
        status: '',
        maintenanceType: ''
      },
      formVisible: false,
      detailsVisible: false,
      isEdit: false,
      currentData: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取维修记录列表
    getList() {
      this.listLoading = true
      listMaintenance(this.listQuery).then(response => {
        this.list = response.data.rows
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    // 处理搜索
    handleSearch() {
      this.listQuery.page = 1
      this.getList()
    },
    // 重置搜索条件
    resetQuery() {
      this.listQuery = {
        page: 1,
        size: 10,
        roomName: '',
        status: '',
        maintenanceType: ''
      }
      this.getList()
    },
    // 处理选择变化
    handleSelectionChange(val) {
      this.selectedItems = val
    },
    // 处理页大小变化
    handleSizeChange(val) {
      this.listQuery.size = val
      this.getList()
    },
    // 处理页码变化
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    // 处理状态更新
    handleUpdateStatus(id, status) {
      this.$confirm('确认更新维修状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateMaintenanceStatus(id, status).then(() => {
          this.$message.success('状态更新成功')
          this.getList()
        })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    // 处理单条删除
    handleDelete(id) {
      this.$confirm('确认删除该维修记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBatchMaintenance([id]).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 处理批量删除
    handleBatchDelete() {
      const ids = this.selectedItems.map(item => item.id)
      if (ids.length === 0) {
        this.$message.warning('请选择要删除的记录')
        return
      }
      
      this.$confirm(`确认删除选中的 ${ids.length} 条记录?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBatchMaintenance(ids).then(() => {
          this.$message.success('批量删除成功')
          this.getList()
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        '未开始': '待维修',
        '进行中': '维修中',
        '已完成': '已完成'
      }
      return statusMap[status] || status
    },
    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        '未开始': 'warning',
        '进行中': 'primary',
        '已完成': 'success',
        '已取消': 'info'
      }
      return statusMap[status] || ''
    },
    // 处理新增
    handleAdd() {
      this.isEdit = false
      this.currentData = {}
      this.formVisible = true
    },
    // 处理编辑
    handleEdit(row) {
      this.isEdit = true
      // 确保roomId字段存在且正确
      const editData = { ...row }
      if (!editData.roomId && editData.id) {
        editData.roomId = editData.id
      }
     
      this.currentData = editData
      this.formVisible = true
    },
    // 处理查看详情
    handleViewDetails(row) {
      const detailData = { ...row }
      if (!detailData.roomId && detailData.id) {
        detailData.roomId = detailData.id
      }
      console.log('详情数据:', detailData) // 调试用
      this.currentData = detailData
      this.detailsVisible = true
    },
    // 关闭表单
    closeForm() {
      this.formVisible = false
    },
    // 提交表单
    submitForm(formData) {
      if (this.isEdit) {
        // 编辑模式下只更新状态
        updateMaintenanceStatus(formData).then(() => {
          this.$message.success('状态更新成功')
          this.formVisible = false
          this.getList()
        }).catch(() => {
          this.$message.error('状态更新失败')
        })
      } else {
        // 新增模式
        addMaintenance(formData).then(() => {
          this.$message.success('添加成功')
          this.formVisible = false
          this.getList()
        }).catch(() => {
          this.$message.error('添加失败')
        })
      }
    },
    // 关闭详情
    closeDetails() {
      this.detailsVisible = false
    },
    // 处理状态命令
    handleStatusCommand(id, command) {
      this.$confirm(`确认将维修状态更新为 "${command}"?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateMaintenanceStatus(id, command).then(() => {
          this.$message.success('状态更新成功')
          this.getList()
        })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    }
  }
}
</script>

<style scoped>
.maintenance-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.table-container .table-header {
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style> 