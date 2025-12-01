<template>
  <el-dialog
    title="预约详情"
    :visible.sync="dialogVisible"
    width="650px"
    custom-class="reservation-detail-dialog">
    
    <div class="dialog-header">
      <div class="reservation-title">
        <i class="el-icon-tickets"></i>
        <span>预约信息</span>
      </div>
      <el-tag size="medium" :type="getStatusType(reservation.status)" effect="dark">
        {{ formatStatus(reservation.status) }}
      </el-tag>
    </div>
    
    <el-divider></el-divider>
    
    <el-descriptions border :column="2" v-loading="loading" class="detail-descriptions" size="medium">
      <el-descriptions-item label="预约ID" :span="1">
        <i class="el-icon-notebook-2"></i> {{ reservation.id || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="申请时间" :span="1">
        <i class="el-icon-date"></i> {{ formatDate(reservation.createdAt) || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="琴房名称" :span="1">
        <i class="el-icon-school"></i> {{ reservation.roomName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="琴房位置" :span="1">
        <i class="el-icon-location"></i> {{ reservation.roomLocation || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="预约时间" :span="2">
        <div class="time-range-detail">
          <div class="time-item">
            <i class="el-icon-time"></i>
            <span class="time-label">开始时间：</span>
            <span class="time-value">{{ formatDateTime(reservation.startTime) || '-' }}</span>
          </div>
          <div class="time-divider">
            <i class="el-icon-arrow-right"></i>
          </div>
          <div class="time-item">
            <i class="el-icon-time"></i>
            <span class="time-label">结束时间：</span>
            <span class="time-value">{{ formatDateTime(reservation.endTime) || '-' }}</span>
          </div>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="预约人" :span="1">
        <i class="el-icon-user"></i> {{ reservation.username || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="联系方式" :span="1">
        <i class="el-icon-phone"></i> {{ reservation.phone || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="参与人数" :span="1">
        <i class="el-icon-user-solid"></i>
        <el-badge :value="reservation.attendees || 0" class="attendees-badge" type="primary"></el-badge>
      </el-descriptions-item>
      <el-descriptions-item label="预约用途" :span="1">
        <el-tag size="medium" effect="plain" type="info">
          <i class="el-icon-collection"></i> {{ formatPurpose(reservation.purpose) || '-' }}
        </el-tag>
      </el-descriptions-item>
<!--      <el-descriptions-item label="设备需求" :span="2">-->
<!--        <div class="equipment-tags">-->
<!--          <el-tag -->
<!--            v-for="(item, index) in equipmentNeedsList" -->
<!--            :key="index" -->
<!--            size="small"-->
<!--            effect="plain"-->
<!--            type="success"-->
<!--            class="equipment-tag">-->
<!--            <i class="el-icon-cpu"></i> {{ item }}-->
<!--          </el-tag>-->
<!--          <span v-if="!equipmentNeedsList.length" class="no-equipment">无特殊设备需求</span>-->
<!--        </div>-->
<!--      </el-descriptions-item>-->
      <el-descriptions-item label="备注" :span="2">
        <div class="remarks-content">
          <i class="el-icon-document"></i>
          <span v-if="reservation.remarks">{{ reservation.remarks == null ? '无备注信息' : reservation.remarks }}</span>
          <span v-else class="no-remarks">无备注信息</span>
        </div>
      </el-descriptions-item>
      <el-descriptions-item v-if="reservation.status === '2'" label="拒绝理由" :span="2">
        <div class="reject-reason">
          <i class="el-icon-warning"></i>
          <span>{{ reservation.rejectReason || '-' }}</span>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="最后更新" :span="2">
        <i class="el-icon-refresh"></i> {{ formatDateTime(reservation.updatedAt) || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    
    <div slot="footer" class="dialog-footer">
      <el-button icon="el-icon-close" @click="dialogVisible = false">关闭</el-button>
      <el-button-group v-if="reservation.status === '0'">
        <el-button 
          type="success" 
          icon="el-icon-check"
          @click="handleApprove">
          批准预约
        </el-button>
        <el-button 
          type="danger" 
          icon="el-icon-close"
          @click="handleReject">
          拒绝预约
        </el-button>
      </el-button-group>
      <el-button 
        v-if="['0', '1'].includes(reservation.status)"
        type="warning" 
        icon="el-icon-delete"
        @click="handleCancel">
        取消预约
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { reservationApi } from '@/api/reservations'

export default {
  name: 'ReservationDetail',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    reservation: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    equipmentNeedsList() {
      if (!this.reservation.equipmentNeeds) return []
      
      if (Array.isArray(this.reservation.equipmentNeeds)) {
        return this.reservation.equipmentNeeds
      }
      
      try {
        // 如果是字符串，尝试解析为JSON
        return JSON.parse(this.reservation.equipmentNeeds)
      } catch (error) {
        // 如果解析失败，返回空数组
        return []
      }
    },
    buildingInfo() {
      const { building, floor, roomNumber } = this.reservation
      const parts = []
      if (building) parts.push(building)
      if (floor) parts.push(`${floor}楼`)
      if (roomNumber) parts.push(roomNumber)
      
      return parts.length ? parts.join(' - ') : '-'
    }
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
    
    // 格式化状态
    formatStatus(status) {
      const statusMap = {
        '0': '待审核',
        '1': '已批准',
        '2': '已拒绝',
        '3': '已取消',
        '4': '已完成',
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
        '0': 'warning',
        '1': 'success',
        '2': 'danger',
        '3': 'info',
        '4': 'primary',
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'cancelled': 'info',
        'completed': 'primary',
        'occupied': 'danger'
      }
      return typeMap[status] || ''
    },
    
    // 批准预约
    handleApprove() {
      this.$confirm('确认批准该预约申请吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(() => {
        this.loading = true
        reservationApi.updateReservation(this.reservation.id, { status: '1' }).then(res => {
          if (res.code === 1) {
            this.$message.success('预约已批准')
            this.dialogVisible = false
            this.$emit('success')
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        }).catch(error => {
          this.$message.error('操作失败: ' + (error.message || '未知错误'))
        }).finally(() => {
          this.loading = false
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 拒绝预约
    handleReject() {
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
        this.loading = true
        reservationApi.updateReservation(this.reservation.id, { 
          status: '2',
          rejectReason: value
        }).then(res => {
          if (res.code === 1) {
            this.$message.success('预约已拒绝')
            this.dialogVisible = false
            this.$emit('success')
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        }).catch(error => {
          this.$message.error('操作失败: ' + (error.message || '未知错误'))
        }).finally(() => {
          this.loading = false
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 取消预约
    handleCancel() {
      this.$confirm('确认取消该预约吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        reservationApi.cancelReservation(this.reservation.id).then(res => {
          if (res.code === 1) {
            this.$message.success('预约已取消')
            this.dialogVisible = false
            this.$emit('success')
          } else {
            this.$message.error(res.msg || '操作失败')
          }
        }).catch(error => {
          this.$message.error('操作失败: ' + (error.message || '未知错误'))
        }).finally(() => {
          this.loading = false
        })
      }).catch(() => {
        // 取消操作
      })
    }
  }
}
</script>

<style scoped>
.reservation-detail-dialog {
  border-radius: 8px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reservation-title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.reservation-title i {
  font-size: 20px;
  margin-right: 8px;
  color: #409EFF;
}

.detail-descriptions {
  margin-bottom: 20px;
}

.time-range-detail {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.time-item {
  display: flex;
  align-items: center;
}

.time-item i {
  color: #606266;
  margin-right: 5px;
}

.time-label {
  font-weight: bold;
  margin-right: 5px;
}

.time-divider {
  color: #909399;
  margin: 0 10px;
}

.equipment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.equipment-tag {
  display: flex;
  align-items: center;
}

.equipment-tag i {
  margin-right: 4px;
}

.no-equipment, .no-remarks {
  color: #909399;
  font-style: italic;
}

.remarks-content {
  display: flex;
  align-items: flex-start;
}

.remarks-content i {
  margin-right: 8px;
  margin-top: 3px;
}

.reject-reason {
  display: flex;
  align-items: flex-start;
  color: #F56C6C;
}

.reject-reason i {
  margin-right: 8px;
  margin-top: 3px;
}

.attendees-badge {
  margin-left: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.dialog-footer .el-button-group {
  margin-left: 10px;
}

/* 对话框内的描述组件样式优化 */
:deep(.el-descriptions__label) {
  background-color: #f5f7fa;
  font-weight: bold;
}

:deep(.el-descriptions__content) {
  padding: 12px 15px;
}
</style> 