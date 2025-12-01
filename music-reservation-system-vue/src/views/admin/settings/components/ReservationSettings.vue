<template>
  <div class="reservation-settings">
    <el-form :model="formData" :rules="rules" ref="reservationForm" label-width="180px" size="medium">
      <h3 class="section-title">预约规则</h3>
      
      <!-- 最大预约天数 -->
      <el-form-item label="最大预约提前天数" prop="maxReservationDaysAhead">
        <el-input-number 
          v-model="formData.maxReservationDaysAhead" 
          :min="1" 
          :max="90" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">用户可以提前多少天预约琴房（例如：7表示可以预约未来7天内的琴房）</div>
      </el-form-item>
      
      <!-- 最大预约时长 -->
      <el-form-item label="单次最大预约时长(小时)" prop="maxReservationHours">
        <el-input-number 
          v-model="formData.maxReservationHours" 
          :min="1" 
          :max="24" 
          :step="0.5"
        ></el-input-number>
        <div class="form-tip">单次预约最长可预约的时间（小时）</div>
      </el-form-item>
      
      <!-- 最小预约时长 -->
      <el-form-item label="单次最小预约时长(小时)" prop="minReservationHours">
        <el-input-number 
          v-model="formData.minReservationHours" 
          :min="0.5" 
          :max="4" 
          :step="0.5"
        ></el-input-number>
        <div class="form-tip">单次预约最短需要预约的时间（小时）</div>
      </el-form-item>
      
      <!-- 预约间隔设置 -->
      <el-form-item label="预约时间间隔(分钟)" prop="reservationTimeInterval">
        <el-select v-model="formData.reservationTimeInterval" placeholder="选择时间间隔">
          <el-option label="15分钟" :value="15"></el-option>
          <el-option label="30分钟" :value="30"></el-option>
          <el-option label="60分钟" :value="60"></el-option>
          <el-option label="90分钟" :value="90"></el-option>
          <el-option label="120分钟" :value="120"></el-option>
        </el-select>
        <div class="form-tip">预约开始时间和结束时间的最小间隔单位</div>
      </el-form-item>
      
      <!-- 使用预定时间段 -->
      <el-form-item label="使用预定时间段">
        <el-switch v-model="formData.usePresetTimeSlots"></el-switch>
        <div class="form-tip">启用后用户只能选择指定的时间段，而不是自由选择时间</div>
      </el-form-item>
      
      <el-divider></el-divider>
      <h3 class="section-title">预约限制</h3>
      
      <!-- 预约审核 -->
      <el-form-item label="预约需要审核">
        <el-switch v-model="formData.requireApproval"></el-switch>
        <div class="form-tip">启用后预约需要管理员审核通过才能生效</div>
      </el-form-item>
      
      <!-- 每日预约上限 -->
      <el-form-item label="每人每日预约上限" prop="maxReservationsPerDay">
        <el-input-number 
          v-model="formData.maxReservationsPerDay" 
          :min="1" 
          :max="10" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">每个用户每天最多可以预约的次数</div>
      </el-form-item>
      
      <!-- 每周预约上限 -->
      <el-form-item label="每人每周预约上限" prop="maxReservationsPerWeek">
        <el-input-number 
          v-model="formData.maxReservationsPerWeek" 
          :min="1" 
          :max="30" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">每个用户每周最多可以预约的次数</div>
      </el-form-item>
      
      <!-- 预约修改截止时间 -->
      <el-form-item label="预约修改截止时间(小时)" prop="reservationEditDeadline">
        <el-input-number 
          v-model="formData.reservationEditDeadline" 
          :min="0" 
          :max="48" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">预约开始前多少小时内不允许修改或取消（0表示可以随时修改）</div>
      </el-form-item>
      
      <!-- 黑名单限制 -->
      <el-form-item label="爽约次数限制" prop="noShowLimit">
        <el-input-number 
          v-model="formData.noShowLimit" 
          :min="0" 
          :max="10" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">用户在一定时期内爽约达到多少次后将被限制预约（0表示不限制）</div>
      </el-form-item>
      
      <!-- 黑名单限制天数 -->
      <el-form-item label="黑名单限制天数" prop="blacklistDays">
        <el-input-number 
          v-model="formData.blacklistDays" 
          :min="1" 
          :max="30" 
          :step="1"
          :disabled="formData.noShowLimit === 0"
        ></el-input-number>
        <div class="form-tip">达到爽约次数限制后，用户被禁止预约的天数</div>
      </el-form-item>
      
      <el-divider></el-divider>
      <h3 class="section-title">时间段设置</h3>
      <div class="time-slot-section" v-if="formData.usePresetTimeSlots">
        <p class="section-desc">设置预约系统可选择的时间段，用户只能选择这些预设的时间段进行预约。</p>
        
        <div class="time-slot-table">
          <el-table
            :data="timeSlots"
            border
            style="width: 100%"
          >
            <el-table-column prop="name" label="时间段名称" min-width="120"></el-table-column>
            <el-table-column prop="startTime" label="开始时间" min-width="150">
              <template #default="scope">
                {{ scope.row.startTime }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" min-width="150">
              <template #default="scope">
                {{ scope.row.endTime }}
              </template>
            </el-table-column>
            <el-table-column prop="enabled" label="启用状态" width="100">
              <template #default="scope">
                <el-switch v-model="scope.row.enabled" @change="updateTimeSlot(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button 
                  size="mini" 
                  type="primary" 
                  plain 
                  icon="el-icon-edit" 
                  @click="editTimeSlot(scope.row)"
                  circle
                ></el-button>
                <el-button 
                  size="mini" 
                  type="danger" 
                  plain 
                  icon="el-icon-delete" 
                  @click="deleteTimeSlot(scope.row)"
                  circle
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="add-time-slot">
            <el-button type="primary" icon="el-icon-plus" @click="showAddTimeSlotDialog">添加时间段</el-button>
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <el-button type="primary" @click="saveSettings" :loading="loading">保存设置</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-form>
    
    <!-- 添加/编辑时间段对话框 -->
    <el-dialog :title="dialogTitle" v-model="timeSlotDialogVisible" width="500px">
      <el-form :model="currentTimeSlot" :rules="timeSlotRules" ref="timeSlotForm" label-width="100px" size="medium">
        <el-form-item label="时间段名称" prop="name">
          <el-input v-model="currentTimeSlot.name" placeholder="如：上午第一节"></el-input>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker
            v-model="currentTimeSlot.startTime"
            format="HH:mm"
            placeholder="选择开始时间"
            style="width: 100%"
          ></el-time-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
            v-model="currentTimeSlot.endTime"
            format="HH:mm"
            placeholder="选择结束时间"
            style="width: 100%"
            :disabled-hours="disabledEndHours"
          ></el-time-picker>
        </el-form-item>
        <el-form-item label="启用状态" prop="enabled">
          <el-switch v-model="currentTimeSlot.enabled"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="timeSlotDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTimeSlot" :loading="timeSlotLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 假设存在设置API
// import { settingsApi } from '@/api/settings.js'

export default {
  name: 'ReservationSettings',
  data() {
    // 验证结束时间必须大于开始时间
    const validateEndTime = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择结束时间'))
        return
      }
      
      if (!this.currentTimeSlot.startTime) {
        callback()
        return
      }
      
      const startTime = new Date(this.currentTimeSlot.startTime)
      const endTime = new Date(value)
      
      if (endTime <= startTime) {
        callback(new Error('结束时间必须大于开始时间'))
      } else {
        callback()
      }
    }
    
    return {
      loading: false,
      timeSlotLoading: false,
      formData: {
        // 预约规则
        maxReservationDaysAhead: 7,
        maxReservationHours: 4,
        minReservationHours: 1,
        reservationTimeInterval: 30,
        usePresetTimeSlots: false,
        
        // 预约限制
        requireApproval: false,
        maxReservationsPerDay: 2,
        maxReservationsPerWeek: 5,
        reservationEditDeadline: 2,
        noShowLimit: 3,
        blacklistDays: 7
      },
      rules: {
        maxReservationDaysAhead: [
          { required: true, message: '请设置最大预约提前天数', trigger: 'change' }
        ],
        maxReservationHours: [
          { required: true, message: '请设置最大预约时长', trigger: 'change' }
        ],
        minReservationHours: [
          { required: true, message: '请设置最小预约时长', trigger: 'change' }
        ],
        reservationTimeInterval: [
          { required: true, message: '请选择预约时间间隔', trigger: 'change' }
        ],
        maxReservationsPerDay: [
          { required: true, message: '请设置每日预约上限', trigger: 'change' }
        ],
        maxReservationsPerWeek: [
          { required: true, message: '请设置每周预约上限', trigger: 'change' }
        ],
        reservationEditDeadline: [
          { required: true, message: '请设置预约修改截止时间', trigger: 'change' }
        ]
      },
      // 时间段设置
      timeSlots: [],
      currentTimeSlot: {
        id: null,
        name: '',
        startTime: '',
        endTime: '',
        enabled: true
      },
      timeSlotRules: {
        name: [
          { required: true, message: '请输入时间段名称', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' },
          { validator: validateEndTime, trigger: 'change' }
        ]
      },
      timeSlotDialogVisible: false,
      dialogTitle: '添加时间段'
    }
  },
  created() {
    this.fetchReservationSettings()
    this.fetchTimeSlots()
  },
  methods: {
    // 获取预约设置
    fetchReservationSettings() {
      this.loading = true
      
      // 模拟API调用，实际应用中应替换为真实API
      setTimeout(() => {
        // settingsApi.getReservationSettings().then(response => {
        //   if (response.success) {
        //     this.formData = {...this.formData, ...response.data}
        //   }
        // }).catch(error => {
        //   this.$message.error('获取预约设置失败：' + error.message)
        // }).finally(() => {
        //   this.loading = false
        // })
        
        // 模拟数据
        this.formData = {
          // 预约规则
          maxReservationDaysAhead: 7,
          maxReservationHours: 4,
          minReservationHours: 1,
          reservationTimeInterval: 30,
          usePresetTimeSlots: true,
          
          // 预约限制
          requireApproval: false,
          maxReservationsPerDay: 2,
          maxReservationsPerWeek: 5,
          reservationEditDeadline: 2,
          noShowLimit: 3,
          blacklistDays: 7
        }
        
        this.loading = false
      }, 800)
    },
    
    // 获取时间段列表
    fetchTimeSlots() {
      // 模拟API调用，实际应用中应替换为真实API
      setTimeout(() => {
        // settingsApi.getTimeSlots().then(response => {
        //   if (response.success) {
        //     this.timeSlots = response.data
        //   }
        // }).catch(error => {
        //   this.$message.error('获取时间段失败：' + error.message)
        // })
        
        // 模拟数据
        this.timeSlots = [
          { id: 1, name: '上午第一节', startTime: '08:00', endTime: '09:30', enabled: true },
          { id: 2, name: '上午第二节', startTime: '10:00', endTime: '11:30', enabled: true },
          { id: 3, name: '下午第一节', startTime: '13:30', endTime: '15:00', enabled: true },
          { id: 4, name: '下午第二节', startTime: '15:30', endTime: '17:00', enabled: true },
          { id: 5, name: '晚上', startTime: '18:30', endTime: '21:00', enabled: true }
        ]
      }, 800)
    },
    
    // 保存设置
    saveSettings() {
      this.$refs.reservationForm.validate(valid => {
        if (!valid) return
        
        this.loading = true
        
        // 模拟API调用，实际应用中应替换为真实API
        setTimeout(() => {
          // settingsApi.updateReservationSettings(this.formData).then(response => {
          //   if (response.success) {
          //     this.$message.success('保存成功')
          //   } else {
          //     this.$message.error(response.message || '保存失败')
          //   }
          // }).catch(error => {
          //   this.$message.error('保存失败：' + error.message)
          // }).finally(() => {
          //   this.loading = false
          // })
          
          // 模拟成功
          this.$message.success('预约设置保存成功')
          this.loading = false
        }, 800)
      })
    },
    
    // 重置表单
    resetForm() {
      this.$refs.reservationForm.resetFields()
      this.fetchReservationSettings()
    },
    
    // 显示添加时间段对话框
    showAddTimeSlotDialog() {
      this.dialogTitle = '添加时间段'
      this.currentTimeSlot = {
        id: null,
        name: '',
        startTime: '',
        endTime: '',
        enabled: true
      }
      this.timeSlotDialogVisible = true
    },
    
    // 编辑时间段
    editTimeSlot(timeSlot) {
      this.dialogTitle = '编辑时间段'
      // 深拷贝防止直接修改列表数据
      this.currentTimeSlot = JSON.parse(JSON.stringify(timeSlot))
      
      // 转换时间字符串为Date对象（用于时间选择器）
      if (typeof this.currentTimeSlot.startTime === 'string') {
        const [hours, minutes] = this.currentTimeSlot.startTime.split(':').map(Number)
        const date = new Date()
        date.setHours(hours, minutes, 0)
        this.currentTimeSlot.startTime = date
      }
      
      if (typeof this.currentTimeSlot.endTime === 'string') {
        const [hours, minutes] = this.currentTimeSlot.endTime.split(':').map(Number)
        const date = new Date()
        date.setHours(hours, minutes, 0)
        this.currentTimeSlot.endTime = date
      }
      
      this.timeSlotDialogVisible = true
    },
    
    // 保存时间段
    saveTimeSlot() {
      this.$refs.timeSlotForm.validate(valid => {
        if (!valid) return
        
        this.timeSlotLoading = true
        
        // 转换日期对象为时间字符串
        const startTime = this.formatTime(this.currentTimeSlot.startTime)
        const endTime = this.formatTime(this.currentTimeSlot.endTime)
        
        const timeSlotData = {
          ...this.currentTimeSlot,
          startTime,
          endTime
        }
        
        // 模拟API调用，实际应用中应替换为真实API
        setTimeout(() => {
          if (timeSlotData.id) {
            // 更新时间段
            // settingsApi.updateTimeSlot(timeSlotData).then(response => {
            //   if (response.success) {
            //     this.$message.success('更新时间段成功')
            //     this.fetchTimeSlots()
            //     this.timeSlotDialogVisible = false
            //   } else {
            //     this.$message.error(response.message || '更新时间段失败')
            //   }
            // }).catch(error => {
            //   this.$message.error('更新时间段失败：' + error.message)
            // }).finally(() => {
            //   this.timeSlotLoading = false
            // })
            
            // 模拟更新成功
            const index = this.timeSlots.findIndex(item => item.id === timeSlotData.id)
            if (index !== -1) {
              this.timeSlots[index] = timeSlotData
            }
            this.$message.success('更新时间段成功')
            this.timeSlotDialogVisible = false
          } else {
            // 添加时间段
            // settingsApi.addTimeSlot(timeSlotData).then(response => {
            //   if (response.success) {
            //     this.$message.success('添加时间段成功')
            //     this.fetchTimeSlots()
            //     this.timeSlotDialogVisible = false
            //   } else {
            //     this.$message.error(response.message || '添加时间段失败')
            //   }
            // }).catch(error => {
            //   this.$message.error('添加时间段失败：' + error.message)
            // }).finally(() => {
            //   this.timeSlotLoading = false
            // })
            
            // 模拟添加成功
            const newId = this.timeSlots.length > 0 ? Math.max(...this.timeSlots.map(t => t.id)) + 1 : 1
            this.timeSlots.push({
              ...timeSlotData,
              id: newId
            })
            this.$message.success('添加时间段成功')
            this.timeSlotDialogVisible = false
          }
          
          this.timeSlotLoading = false
        }, 800)
      })
    },
    
    // 更新时间段启用状态
    updateTimeSlot(timeSlot) {
      // 实际应用中应调用API更新状态
      this.$message.success(`${timeSlot.enabled ? '启用' : '禁用'}时间段成功`)
    },
    
    // 删除时间段
    deleteTimeSlot(timeSlot) {
      this.$confirm('确定要删除这个时间段吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟API调用，实际应用中应替换为真实API
        // settingsApi.deleteTimeSlot(timeSlot.id).then(response => {
        //   if (response.success) {
        //     this.$message.success('删除时间段成功')
        //     this.fetchTimeSlots()
        //   } else {
        //     this.$message.error(response.message || '删除时间段失败')
        //   }
        // }).catch(error => {
        //   this.$message.error('删除时间段失败：' + error.message)
        // })
        
        // 模拟删除成功
        const index = this.timeSlots.findIndex(item => item.id === timeSlot.id)
        if (index !== -1) {
          this.timeSlots.splice(index, 1)
        }
        this.$message.success('删除时间段成功')
      }).catch(() => {
        // 取消删除
      })
    },
    
    // 格式化时间为字符串
    formatTime(date) {
      if (!date) return ''
      
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    
    // 禁用早于开始时间的结束时间小时
    disabledEndHours() {
      if (!this.currentTimeSlot.startTime) return []
      
      const startHour = this.currentTimeSlot.startTime.getHours()
      return Array.from({ length: startHour }, (_, i) => i)
    }
  }
}
</script>

<style scoped>
.reservation-settings {
  padding: 10px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: #303133;
}

.section-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.el-divider {
  margin: 24px 0;
}

.time-slot-section {
  margin-top: 20px;
  margin-bottom: 30px;
}

.time-slot-table {
  margin-top: 15px;
}

.add-time-slot {
  margin-top: 15px;
  text-align: center;
}

.form-actions {
  margin-top: 30px;
}
</style> 