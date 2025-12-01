<template>
  <div class="reservation-management">
    <el-card class="box-card" shadow="hover">
      <div slot="header" class="card-header">
        <h2><i class="el-icon-date"></i> 预约管理</h2>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd" class="add-btn">新增预约</el-button>
      </div>
      
      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
        <el-form-item label="预约日期" class="date-range-item">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            @change="handleDateChange"
            class="date-picker">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="琴房">
          <el-input 
            v-model="queryParams.roomName" 
            placeholder="琴房名称或编号" 
            clearable
            @keyup.enter.native="handleQuery"
            prefix-icon="el-icon-school">
          </el-input>
        </el-form-item>
        <el-form-item label="预约人">
          <el-input 
            v-model="queryParams.username"
            placeholder="预约人姓名" 
            clearable
            @keyup.enter.native="handleQuery"
            prefix-icon="el-icon-user">
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="预约状态" clearable>
            <el-option label="待审核" value="pending">
              <div class="select-option">
                <el-tag size="small" type="warning">待审核</el-tag>
              </div>
            </el-option>
            <el-option label="已批准" value="approved">
              <div class="select-option">
                <el-tag size="small" type="success">已批准</el-tag>
              </div>
            </el-option>
            <el-option label="已拒绝" value="rejected">
              <div class="select-option">
                <el-tag size="small" type="danger">已拒绝</el-tag>
              </div>
            </el-option>
            <el-option label="已取消" value="cancelled">
              <div class="select-option">
                <el-tag size="small" type="info">已取消</el-tag>
              </div>
            </el-option>
            <el-option label="已完成" value="completed">
              <div class="select-option">
                <el-tag size="small" type="primary">已完成</el-tag>
              </div>
            </el-option>
            <el-option label="已占用" value="occupied">
              <div class="select-option">
                <el-tag size="small" type="danger">已占用</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery" class="search-btn">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 预约列表表格 -->
      <el-table
        v-loading="loading"
        :data="reservationList"
        border
        stripe
        size="small"
        highlight-current-row
        style="width: 100%"
        class="reservation-table">
        <el-table-column
          type="selection"
          width="40">
        </el-table-column>
        <el-table-column
          prop="id"
          label="ID"
          width="50"
          align="center">
        </el-table-column>
        <el-table-column
          prop="roomName"
          label="琴房名称"
          min-width="100">
          <template slot-scope="scope">
            <div class="room-name">
              <i class="el-icon-school"></i>
              <span>{{ scope.row.roomName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="startTime"
          label="开始时间"
          min-width="140">
          <template slot-scope="scope">
            <div class="time-item">
              <i class="el-icon-time"></i>
              {{ formatDateTime(scope.row.startTime) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="endTime"
          label="结束时间"
          min-width="140">
          <template slot-scope="scope">
            <div class="time-item">
              <i class="el-icon-time"></i>
              {{ formatDateTime(scope.row.endTime) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="练习时长"
          min-width="100">
          <template slot-scope="scope">
            <div class="duration-item">
              <i class="el-icon-timer"></i>
              {{ calculateDuration(scope.row.startTime, scope.row.endTime) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="username"
          label="预约人"
          min-width="90">
          <template slot-scope="scope">
            <div class="username">
              <i class="el-icon-user"></i>
              <span>{{ scope.row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="purpose"
          label="用途"
          min-width="90">
          <template slot-scope="scope">
            <el-tag size="small" effect="plain">
              {{ formatPurpose(scope.row.purpose) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="attendees"
          label="人数"
          width="60"
          align="center">
          <template slot-scope="scope">
            <el-badge :value="scope.row.attendees" :max="99" class="attendees-badge"></el-badge>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="80"
          align="center">
          <template slot-scope="scope">
            <el-tag size="small" :type="getStatusType(scope.row.status)" effect="dark">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="申请时间"
          min-width="100">
          <template slot-scope="scope">
            <div class="created-time">
              <i class="el-icon-date"></i>
              {{ formatDate(scope.row.createdAt) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="120"
          align="center"
          fixed="right">
          <template slot-scope="scope">
            <div class="operation-btns">
              <el-button-group class="action-group">
                <el-tooltip content="查看详情" placement="top">
                  <el-button 
                    size="mini"
                    type="primary"
                    icon="el-icon-view"
                    @click="handleView(scope.row)">
                  </el-button>
                </el-tooltip>
                <el-tooltip content="批准" placement="top" v-if="scope.row.status === 'pending'">
                  <el-button 
                    size="mini"
                    type="success"
                    icon="el-icon-check"
                    @click="handleApprove(scope.row)">
                  </el-button>
                </el-tooltip>
                <el-tooltip content="拒绝" placement="top" v-if="scope.row.status === 'pending'">
                  <el-button 
                    size="mini"
                    type="danger"
                    icon="el-icon-close"
                    @click="handleReject(scope.row)">
                  </el-button>
                </el-tooltip>
                <el-tooltip content="取消预约" placement="top" v-if="['pending', 'approved'].includes(scope.row.status)">
                  <el-button 
                    size="mini"
                    type="warning"
                    icon="el-icon-delete"
                    @click="handleCancel(scope.row)">
                  </el-button>
                </el-tooltip>
              </el-button-group>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        class="pagination">
      </el-pagination>
    </el-card>
    
    <!-- 添加/编辑预约对话框 -->
    <reservation-form 
      :visible.sync="formVisible" 
      :reservation="currentReservation" 
      :is-add="isAdd"
      @success="handleFormSuccess">
    </reservation-form>
    
    <!-- 查看详情对话框 -->
    <reservation-detail
      :visible.sync="detailVisible"
      :reservation="currentReservation">
    </reservation-detail>
  </div>
</template>

<script>
import { reservationApi } from '@/api/reservations'
import ReservationForm from './components/ReservationForm'
import ReservationDetail from './components/ReservationDetail'

export default {
  name: 'ReservationManagement',
  components: {
    ReservationForm,
    ReservationDetail
  },
  data() {
    return {
      // 加载状态
      loading: false,
      // 预约列表
      reservationList: [],
      // 总记录数
      total: 0,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startDate: '',
        endDate: '',
        roomName: '',
        username: '',
        status: ''
      },
      // 表单对话框可见性
      formVisible: false,
      // 详情对话框可见性
      detailVisible: false,
      // 当前操作的预约
      currentReservation: {},
      // 是否为添加操作
      isAdd: false
    }
  },
  created() {
    this.fetchReservationList()
  },
  computed: {
  
  },
  methods: {
    // 格式化用途
    formatPurpose(purpose) {
      const purposeMap = {
        'student': '学生活动',
        'teaching': '教学',
        'meeting': '会议',
        'training': '培训',
        'exam': '考试',
        'other': '其他'
      }
      return purposeMap[purpose] || purpose
    },
    // 获取预约列表
    fetchReservationList() {
      this.loading = true
      reservationApi.getReservationList(this.queryParams).then(res => {
        // 判断返回的数据结构
        if (res.code === 1 && res.data) {
          this.reservationList = res.data.rows || res.data
          this.total = res.data.total || res.data.length || 0
        } else {
          this.reservationList = []
          this.total = 0
          this.$message.error(res.msg || '获取预约列表失败')
        }
      }).catch(error => {
        console.error('获取预约列表失败', error)
        this.$message.error('获取预约列表失败: ' + (error.message || '未知错误'))
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 处理日期变化
    handleDateChange(val) {
      if (val) {
        this.queryParams.startDate = val[0]
        this.queryParams.endDate = val[1]
      } else {
        this.queryParams.startDate = ''
        this.queryParams.endDate = ''
      }
    },
    
    // 查询
    handleQuery() {
      this.queryParams.pageNum = 1
      this.fetchReservationList()
    },
    
    // 重置查询条件
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.dateRange = []
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        startDate: '',
        endDate: '',
        roomName: '',
        userName: '',
        status: ''
      }
      this.fetchReservationList()
    },
    
    // 处理分页大小改变
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.fetchReservationList()
    },
    
    // 处理页码改变
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.fetchReservationList()
    },
    
    // 添加预约
    handleAdd() {
      this.isAdd = true
      this.currentReservation = {}
      this.formVisible = true
    },
    
    // 查看预约详情
    handleView(row) {
      this.currentReservation = JSON.parse(JSON.stringify(row))
      this.detailVisible = true
    },
    
    // 批准预约
    handleApprove(row) {
      this.$confirm('确认批准该预约申请吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(() => {
        reservationApi.updateReservation(row.id, { status: 'approved' }).then(res => {
          if (res.code === 1) {
            this.$message.success('预约已批准')
            this.fetchReservationList()
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        }).catch(error => {
          this.$message.error('操作失败: ' + (error.message || '未知错误'))
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 拒绝预约
    handleReject(row) {
      this.$prompt('请输入拒绝理由', '拒绝预约', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入拒绝的原因...',
        inputValidator: (value) => {
          if (!value) {
            return '请输入拒绝理由'
          }
          return true
        }
      }).then(({ value }) => {
        reservationApi.updateReservation(row.id, { 
          status: 'rejected',
          rejectReason: value
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('预约已拒绝')
            this.fetchReservationList()
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        }).catch(error => {
          this.$message.error('操作失败: ' + (error.message || '未知错误'))
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 取消预约
    handleCancel(row) {
      this.$confirm('确认取消该预约吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        reservationApi.cancelReservation(row.id).then(res => {
          if (res.code === 1) {
            this.$message.success('预约已取消')
            this.fetchReservationList()
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        }).catch(error => {
          this.$message.error('操作失败: ' + (error.message || '未知错误'))
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 表单提交成功处理
    handleFormSuccess() {
      this.fetchReservationList()
    },
    
    // 格式化状态
    formatStatus(status) {
      const statusMap = {
        'pending': '待审核',
        'approved': '已批准',
        'rejected': '已拒绝',
        'cancelled': '已取消',
        'completed': '已完成',
        'occupied': '已占用'
      }
      return statusMap[status] || '未知'
    },
    
    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'cancelled': 'info',
        'completed': 'primary',
        'occupied': 'danger'
      }
      return typeMap[status] || ''
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '-'
      
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    // 格式化日期时间
    formatDateTime(dateStr) {
      if (!dateStr) return '-'
      
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 计算练习时长
    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime) return '-'
      
      const start = new Date(startTime)
      const end = new Date(endTime)
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-'
      
      const diffMs = end.getTime() - start.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffHours > 0) {
        return `${diffHours}小时${diffMinutes}分钟`
      } else {
        return `${diffMinutes}分钟`
      }
    }
  }
}
</script>

<style scoped>
.reservation-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

.box-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.box-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.card-header h2 i {
  margin-right: 10px;
  font-size: 22px;
  color: #409EFF;
}

.add-btn {
  padding: 10px 16px;
  transition: all 0.3s;
}

.add-btn:hover {
  transform: scale(1.05);
}

.search-form {
  background-color: #f9fafc;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
}

.date-range-item {
  width: 360px;
}

.date-picker {
  width: 100%;
}

.search-btn {
  transition: all 0.3s;
}

.search-btn:hover {
  transform: translateY(-2px);
}

.reservation-table {
  margin: 15px 0;
  border-radius: 6px;
  overflow: hidden;
  font-size: 13px;
}

.room-name, .username, .created-time, .time-item, .duration-item {
  display: flex;
  align-items: center;
}

.room-name i, .username i, .created-time i, .time-item i, .duration-item i {
  margin-right: 6px;
  color: #606266;
}

.duration-item {
  color: #409EFF;
  font-weight: 500;
}

.time-range {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.compact-time {
  font-size: 12px;
}

.attendees-badge {
  margin-top: 5px;
}

.select-option {
  display: flex;
  align-items: center;
}

.operation-btns {
  display: flex;
  justify-content: center;
}

.action-group {
  display: inline-flex;
}

.action-group .el-button {
  padding: 5px 8px;
  transition: all 0.3s;
}

.action-group .el-button:hover {
  transform: scale(1.1);
}

.pagination {
  margin-top: 20px;
  text-align: right;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 1200px) {
  .date-range-item {
    width: 100%;
  }
}

/* 添加列表项入场动画 */
.el-table .el-table__row {
  transition: background-color 0.3s, transform 0.3s;
}

.el-table .el-table__row:hover {
  transform: translateX(5px);
  background-color: #f0f9ff !important;
}

/* 状态标签样式增强 */
.el-tag {
  font-weight: bold;
}

.facility-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style> 