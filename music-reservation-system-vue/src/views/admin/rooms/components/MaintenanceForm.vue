<template>
  <el-dialog 
    title="琴房维护" 
    :visible.sync="dialogVisible"
    width="550px"
    :close-on-click-modal="false"
    @closed="resetForm">
    
    <el-form 
      :model="maintenanceForm" 
      :rules="rules" 
      ref="maintenanceForm" 
      label-width="100px">
      
      <div class="room-info">
        <div class="info-item">
          <span class="label">琴房:</span>
          <span class="value">{{ room.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">琴房号:</span>
          <span class="value">{{ room.roomNumber }}</span>
        </div>
      </div>
      
      <el-form-item label="维护类型" prop="maintenanceType">
        <el-select v-model="maintenanceForm.maintenanceType" placeholder="请选择维护类型" style="width: 100%">
          <el-option label="定期维护" value="定期维护"></el-option>
          <el-option label="设备维护" value="设备维护"></el-option>
          <el-option label="设备升级" value="设备升级"></el-option>
          <el-option label="其他" value="其他"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="开始日期" prop="startTime">
        <el-date-picker
          v-model="maintenanceForm.startTime"
          type="datetime"
          placeholder="选择开始日期时间"
          style="width: 100%">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="结束日期" prop="endTime">
        <el-date-picker
          v-model="maintenanceForm.endTime"
          type="datetime"
          placeholder="选择结束日期时间"
          style="width: 100%"
          :picker-options="endTimeOptions">
        </el-date-picker>
      </el-form-item>
      
      <el-form-item label="维护说明" prop="reason">
        <el-input 
          type="textarea" 
          v-model="maintenanceForm.reason" 
          placeholder="请输入维护说明"
          :rows="3">
        </el-input>
      </el-form-item>
      
      <el-form-item>
        <el-checkbox v-model="maintenanceForm.notifyUsers">通知已预约该琴房的用户</el-checkbox>
      </el-form-item>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="warning" @click="submitForm" :loading="submitting">
        <i class="el-icon-s-tools"></i> 确认维护
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { roomApi } from '@/api/room'

export default {
  name: 'MaintenanceForm',
  props: {
    // 对话框可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 琴房对象
    room: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    // 结束日期验证，必须大于开始日期
    const validateEndTime = (rule, value, callback) => {
      if (value && this.maintenanceForm.startTime) {
        if (value <= this.maintenanceForm.startTime) {
          callback(new Error('结束时间必须大于开始时间'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    
    return {
      // 加载状态
      loading: false,
      // 提交中状态
      submitting: false,
      // 表单数据
      maintenanceForm: {
        roomId: undefined,
        maintenanceType: '',
        startTime: '',
        endTime: '',
        reason: '',
        notifyUsers: true
      },
      // 结束日期选择配置
      endTimeOptions: {
        disabledDate: (time) => {
          if (this.maintenanceForm.startTime) {
            return time.getTime() < this.maintenanceForm.startTime.getTime()
          }
          return false
        }
      },
      // 表单验证规则
      rules: {
        maintenanceType: [
          { required: true, message: '请选择维护类型', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束日期', trigger: 'change' },
          { validator: validateEndTime, trigger: 'change' }
        ],
        // reason: [
        //   { required: true, message: '请输入维护说明', trigger: 'blur' },
        //   { max: 500, message: '维护说明长度不能超过500个字符', trigger: 'blur' }
        // ]
      }
    }
  },
  created() {
   
  },
  computed: {
    // 对话框可见性,用于支持.sync修饰符
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  watch: {
    // 监听对话框可见性变化
    visible(newVal) {
   
      if (newVal && this.room && this.room.id) {
      
        this.getMaintenanceInfo(this.room.id);
      }
    },
    
    // 监听房间数据变化
    room: {
      handler(newVal) {
        console.log('Room data changed:', newVal);
        if (this.visible && newVal && newVal.id) {
          // 当对话框可见且房间ID变化时，获取维护信息
          this.getMaintenanceInfo(newVal.id);
        }
      },
      deep: true
    }
  },
  methods: {
    // 提交表单
    submitForm() {
      this.$refs.maintenanceForm.validate(valid => {
        if (!valid) return;
        
        this.submitting = true;
        
        // 确保roomId存在
        if (!this.maintenanceForm.roomId && this.room && this.room.id) {
          this.maintenanceForm.roomId = this.room.id;
        }
        
        // 打印提交的表单数据（调试用）
        console.log('Submitting maintenance form:', this.maintenanceForm);
        
        // 构建维护请求数据
        const maintenanceData = {
          ...this.maintenanceForm
        };
        
        // 转换日期格式
        if (maintenanceData.startTime) {
          maintenanceData.startTime = this.formatDate(maintenanceData.startTime);
        }
        
        if (maintenanceData.endTime) {
          maintenanceData.endTime = this.formatDate(maintenanceData.endTime);
        }
        
        console.log('Formatted maintenance data:', maintenanceData); // 调试日志
        
        roomApi.updateOrSaveMaintenance(maintenanceData)
          .then(res => {
            // 判断请求是否成功
            if (res.code === 1) {
              this.$message({
                type: 'success',
                message: '琴房维护设置成功'
              });
              this.dialogVisible = false;
              this.$emit('success');
            } else {
              this.$message.error(res.msg || '设置维护失败');
            }
          })
          .catch(error => {
            console.error('提交失败', error);
            this.$message.error('设置维护失败: ' + (error.message || '未知错误'));
          })
          .finally(() => {
            this.submitting = false;
          });
      });
    },
    
    // 格式化日期为字符串
    formatDate(date) {
      if (!date) return null
      
      // 检查日期类型，如果是字符串则转换为Date对象
      if (typeof date === 'string') {
        date = new Date(date)
      }
      
      // 确保date是有效的Date对象
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error('Invalid date:', date)
        return null
      }
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    
    // 重置表单
    resetForm() {
      if (this.$refs.maintenanceForm) {
        this.$refs.maintenanceForm.resetFields();
      }
      
      // // 设置默认值，确保roomId正确
      // this.maintenanceForm = {
      //   roomId: this.room && this.room.id ? this.room.id : undefined,
      //   maintenanceType: '定期维护',
      //   startTime: new Date(), // 默认开始时间为当前时间
      //   endTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 默认结束时间为明天
      //   reason: '',
      //   notifyUsers: true
      // };
    },
    
    // 获取房间维护信息
    getMaintenanceInfo(roomId) {
      if (!roomId) {
        // console.warn('Room ID is missing, cannot fetch maintenance info');
        return;
      }
      
      // console.log('Getting maintenance info for room:', roomId); // 调试日志
      
      // 显示加载状态
      this.loading = true;
      
      // 调用API获取维护信息
      // 假设我们需要添加这个API，它应该返回该房间的维护记录
      roomApi.getMaintenanceByRoomId(roomId)
        .then(res => {
          this.loading = false;
          // console.log('Maintenance info response:', res); // 调试日志
          
          // 处理API返回的数据
          if (res.code === 1 && res.data) {
              // 处理日期字段，确保是Date对象
              const maintenanceData = { ...res.data };
              
              // 如果返回的时间是字符串，转换为Date对象
              if (maintenanceData.startTime && typeof maintenanceData.startTime === 'string') {
                maintenanceData.startTime = new Date(maintenanceData.startTime);
              }
              
              if (maintenanceData.endTime && typeof maintenanceData.endTime === 'string') {
                maintenanceData.endTime = new Date(maintenanceData.endTime);
              }
              
              this.maintenanceForm = maintenanceData;
          } else {
            this.resetForm();
            this.maintenanceForm.roomId = roomId;
          }
        })
        .catch(error => {
          this.loading = false;
          console.error('获取维护信息失败:', error);
          this.$message.error('获取维护信息失败');
          this.resetForm();
          this.maintenanceForm.roomId = roomId;
        });
    }
  }
}
</script>

<style scoped>
.room-info {
  background-color: #f8f9fa;
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.info-item {
  display: flex;
}

.label {
  color: #606266;
  margin-right: 5px;
  font-weight: bold;
}

.value {
  color: #303133;
}
</style> 