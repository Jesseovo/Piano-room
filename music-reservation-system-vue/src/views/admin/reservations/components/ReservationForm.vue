<template>
  <el-dialog
    :title="isAdd ? '添加预约' : '编辑预约'"
    :visible.sync="dialogVisible"
    width="650px"
    @close="closeDialog">
    
    <el-form
      :model="reservationForm"
      :rules="rules"
      ref="reservationForm"
      label-width="100px"
      v-loading="loading">
      
      <!-- 琴房选择 -->
      <el-form-item label="琴房" prop="roomId">
        <el-select
          v-model="reservationForm.roomId"
          placeholder="请选择琴房"
          style="width: 100%">
          <el-option
            v-for="room in roomList"
            :key="room.id"
            :label="room.name"
            :value="room.id">
            <span>{{ room.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              (容量: {{ room.capacity }}人)
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      
      <!-- 日期选择 -->
      <el-form-item label="预约日期" prop="date">
        <el-date-picker
          v-model="reservationForm.date"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
          @change="handleDateChange">
        </el-date-picker>
      </el-form-item>
      
      <!-- 时间槽选择 -->
      <el-form-item label="时间段" prop="timeSlotIndex">
        <div v-if="loading" class="loading-container">
          <el-skeleton animated :rows="3"></el-skeleton>
        </div>
        <div v-else-if="!timeSlots.length" class="no-slots">
          <el-alert
            title="请先选择琴房和日期，然后查询可用时段"
            type="info"
            :closable="false">
          </el-alert>
        </div>
        <div v-else>
          <el-radio-group v-model="reservationForm.timeSlotIndex">
            <div class="time-slots-container">
              <el-radio
                v-for="(slot, index) in timeSlots"
                :key="index"
                :label="index"
                :disabled="!slot.available"
                class="time-slot-radio">
                <div class="time-slot">
                  <span class="time">{{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}</span>
                  <el-tag
                    v-if="!slot.available"
                    type="danger"
                    size="mini">{{ slot.conflictReason || '不可用' }}</el-tag>
                  <el-tag
                    v-else
                    type="success"
                    size="mini">可用</el-tag>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
          <div class="check-btn-wrapper">
            <el-button type="info" size="small" @click="fetchAvailableTimeSlots">重新查询可用时段</el-button>
          </div>
        </div>
      </el-form-item>
      
      <!-- 预约用途 -->
      <el-form-item label="用途" prop="purpose">
        <el-input
          v-model="reservationForm.purpose"
          type="textarea"
          :rows="2"
          placeholder="请描述预约琴房的用途">
        </el-input>
      </el-form-item>
      
      <!-- 参与人数 -->
      <el-form-item label="参与人数" prop="attendees">
        <el-input-number
          v-model="reservationForm.attendees"
          :min="1"
          :max="selectedRoom ? selectedRoom.capacity : 999"
          :disabled="!selectedRoom"
          style="width: 120px">
        </el-input-number>
        <span class="capacity-hint" v-if="selectedRoom">
          (琴房容量: {{ selectedRoom.capacity }}人)
        </span>
      </el-form-item>
      
      <!-- 额外设备需求 -->
      <el-form-item label="设备需求" prop="equipmentNeeds">
        <el-checkbox-group v-model="reservationForm.equipmentNeeds">
          <el-checkbox label="投影仪">投影仪</el-checkbox>
          <el-checkbox label="音响设备">音响设备</el-checkbox>
          <el-checkbox label="电脑">电脑</el-checkbox>
          <el-checkbox label="麦克风">麦克风</el-checkbox>
          <el-checkbox label="白板">白板</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <!-- 备注 -->
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="reservationForm.remarks"
          type="textarea"
          :rows="2"
          placeholder="任何其他需要说明的信息">
        </el-input>
      </el-form-item>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { reservationApi } from '@/api/reservations'
import { roomApi } from '@/api/room'

export default {
  name: 'ReservationForm',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    reservation: {
      type: Object,
      default: () => ({})
    },
    isAdd: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      submitting: false,
      roomList: [],
      timeSlots: [],
      reservationForm: {
        id: undefined,
        roomId: undefined,
        date: null,
        timeSlotIndex: null,
        startTime: null,
        endTime: null,
        purpose: '',
        attendees: 1,
        equipmentNeeds: [],
        remarks: ''
      },
      rules: {
        roomId: [
          { required: true, message: '请选择琴房', trigger: 'change' }
        ],
        date: [
          { required: true, message: '请选择预约日期', trigger: 'change' }
        ],
        timeSlotIndex: [
          { required: true, message: '请选择时间段', trigger: 'change' }
        ],
        purpose: [
          { required: true, message: '请描述预约用途', trigger: 'blur' },
          { max: 200, message: '用途描述不能超过200个字符', trigger: 'blur' }
        ],
        attendees: [
          { required: true, message: '请填写参与人数', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (this.selectedRoom && value > this.selectedRoom.capacity) {
                callback(new Error(`参与人数不能超过琴房容量（${this.selectedRoom.capacity}人）`));
              } else {
                callback();
              }
            }, 
            trigger: 'change' 
          }
        ]
      }
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
    selectedRoom() {
      return this.roomList.find(room => room.id === this.reservationForm.roomId) || null
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.init()
      }
    }
  },
  methods: {
    init() {
      // 获取琴房列表
      this.fetchRoomList()
      
      // 初始化表单
      this.resetForm()
      
      // 如果是编辑模式，填充表单数据
      if (!this.isAdd && this.reservation && this.reservation.id) {
        this.fillFormWithReservation()
      }
    },
    
    // 获取琴房列表
    fetchRoomList() {
      this.loading = true
      roomApi.list({ status: 1 }).then(res => {
        if (res.code === 1 && res.data) {
          this.roomList = res.data.rows || res.data || []
        } else {
          this.$message.error(res.msg || '获取琴房列表失败')
        }
      }).catch(error => {
        console.error('获取琴房列表失败', error)
        this.$message.error('获取琴房列表失败: ' + (error.message || '未知错误'))
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 获取可用时间槽
    fetchAvailableTimeSlots() {
      if (!this.reservationForm.roomId || !this.reservationForm.date) {
        this.$message.warning('请先选择琴房和日期')
        return
      }
      
      this.loading = true
      this.timeSlots = []
      
      const params = {
        roomId: this.reservationForm.roomId,
        date: this.formatDate(this.reservationForm.date)
      }
      
      // 如果是编辑模式，排除当前预约自身的时间段
      if (!this.isAdd && this.reservation && this.reservation.id) {
        params.excludeReservationId = this.reservation.id
      }
      
      reservationApi.getAvailability(params).then(res => {
        if (res.code === 1 && res.data) {
          this.timeSlots = res.data || []
          
          // 如果编辑模式下原时间段不在列表中，添加进去
          if (!this.isAdd && this.reservation && this.reservation.startTime && this.reservation.endTime) {
            this.addEditingTimeSlot()
          }
        } else {
          this.$message.error(res.msg || '获取可用时段失败')
        }
      }).catch(error => {
        console.error('获取可用时段失败', error)
        this.$message.error('获取可用时段失败: ' + (error.message || '未知错误'))
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 为编辑模式添加原时间段到列表中
    addEditingTimeSlot() {
      const startTime = new Date(this.reservation.startTime)
      const endTime = new Date(this.reservation.endTime)
      
      // 检查原时间段是否存在于列表中
      const existingSlotIndex = this.timeSlots.findIndex(slot => 
        new Date(slot.startTime).getTime() === startTime.getTime() && 
        new Date(slot.endTime).getTime() === endTime.getTime()
      )
      
      if (existingSlotIndex === -1) {
        // 添加原时间段并标记为可用
        this.timeSlots.push({
          startTime: startTime,
          endTime: endTime,
          available: true,
          conflictReason: '(当前预约的时间段)'
        })
        
        // 设置选中的时间段索引
        this.reservationForm.timeSlotIndex = this.timeSlots.length - 1
      } else {
        // 如果原时间段存在于列表中，设置为可用并选中
        this.timeSlots[existingSlotIndex].available = true
        this.reservationForm.timeSlotIndex = existingSlotIndex
      }
    },
    
    // 填充编辑模式的表单数据
    fillFormWithReservation() {
      // 复制预约数据
      const reservationData = JSON.parse(JSON.stringify(this.reservation))
      
      // 设置表单数据
      this.reservationForm.id = reservationData.id
      this.reservationForm.roomId = reservationData.roomId
      
      // 从开始时间提取日期
      if (reservationData.startTime) {
        this.reservationForm.date = new Date(reservationData.startTime)
      }
      
      this.reservationForm.purpose = reservationData.purpose || ''
      this.reservationForm.attendees = reservationData.attendees || 1
      this.reservationForm.equipmentNeeds = reservationData.equipmentNeeds || []
      this.reservationForm.remarks = reservationData.remarks || ''
      
      // 获取可用时间槽，会在回调中设置timeSlotIndex
      this.fetchAvailableTimeSlots()
    },
    
    // 处理日期变化
    handleDateChange() {
      // 日期变化后需要重新获取可用时间槽
      this.timeSlots = []
      this.reservationForm.timeSlotIndex = null
      this.fetchAvailableTimeSlots()
    },
    
    // 格式化日期为yyyy-MM-dd
    formatDate(date) {
      if (!date) return ''
      
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      
      return `${year}-${month}-${day}`
    },
    
    // 格式化时间为HH:mm
    formatTime(dateStr) {
      if (!dateStr) return ''
      
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      return `${hours}:${minutes}`
    },
    
    // 提交表单
    submitForm() {
      // 判断当前时间是否小于22:00（点击预约按钮时立即判断）
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTimeInMinutes = currentHour * 60 + currentMinute
      const closeTimeInMinutes = 22 * 60 // 22:00转换为分钟
      
      if (currentTimeInMinutes >= closeTimeInMinutes) {
        this.$message.warning('琴房暂未开放')
        return
      }
      
      this.$refs.reservationForm.validate(valid => {
        if (!valid) return
        
        if (this.timeSlots.length === 0 || this.reservationForm.timeSlotIndex === null) {
          this.$message.warning('请选择有效的时间段')
          return
        }
        
        // 获取选中的时间段
        const selectedSlot = this.timeSlots[this.reservationForm.timeSlotIndex]
        if (!selectedSlot || !selectedSlot.available) {
          this.$message.warning('所选时间段不可用')
          return
        }
        
        this.submitting = true
        
        // 构建预约数据
        const reservationData = {
          ...this.reservationForm,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime
        }
        
        // 移除不需要的字段
        delete reservationData.date
        delete reservationData.timeSlotIndex
        
        // 如果是编辑模式
        if (!this.isAdd && this.reservation.id) {
          reservationApi.updateReservation(this.reservation.id, reservationData)
            .then(this.handleSubmitSuccess)
            .catch(this.handleSubmitError)
            .finally(() => {
              this.submitting = false
            })
        } else {
          // 新增模式
          reservationApi.createReservation(reservationData)
            .then(this.handleSubmitSuccess)
            .catch(this.handleSubmitError)
            .finally(() => {
              this.submitting = false
            })
        }
      })
    },
    
    // 处理提交成功
    handleSubmitSuccess(res) {
      if (res.code === 1) {
        this.$message.success(this.isAdd ? '预约创建成功' : '预约更新成功')
        this.dialogVisible = false
        this.$emit('success')
      } else {
        this.$message.error(res.msg || '操作失败')
      }
    },
    
    // 处理提交错误
    handleSubmitError(error) {
      console.error('提交预约失败', error)
      this.$message.error('操作失败: ' + (error.message || '未知错误'))
    },
    
    // 重置表单
    resetForm() {
      this.timeSlots = []
      
      if (this.$refs.reservationForm) {
        this.$refs.reservationForm.resetFields()
      }
      
      this.reservationForm = {
        id: undefined,
        roomId: undefined,
        date: new Date(),
        timeSlotIndex: null,
        startTime: null,
        endTime: null,
        purpose: '',
        attendees: 1,
        equipmentNeeds: [],
        remarks: ''
      }
    },
    
    // 关闭对话框
    closeDialog() {
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.time-slots-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.time-slot-radio {
  display: block;
  margin: 8px 0;
  padding: 8px;
  border-radius: 4px;
}

.time-slot-radio:hover {
  background-color: #f5f7fa;
}

.time-slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.time {
  font-weight: bold;
}

.capacity-hint {
  margin-left: 10px;
  color: #909399;
  font-size: 13px;
}

.loading-container {
  padding: 10px 0;
}

.no-slots {
  margin: 10px 0;
}

.check-btn-wrapper {
  text-align: center;
  margin-top: 10px;
}
</style> 