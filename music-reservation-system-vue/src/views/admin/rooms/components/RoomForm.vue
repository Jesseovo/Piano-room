<template>
  <el-dialog
    :title="isAdd ? '添加琴房' : '编辑琴房'"
    :visible.sync="dialogVisible"
    width="650px"
    :close-on-click-modal="false"
    @closed="resetForm">

    <el-form
      :model="roomForm"
      :rules="rules"
      ref="roomForm"
      label-width="100px">

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="琴房号" prop="roomNumber">
            <el-input v-model="roomForm.roomNumber" placeholder="请输入琴房号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="琴房名称" prop="name">
            <el-input v-model="roomForm.name" placeholder="请输入琴房名称"></el-input>
          </el-form-item>
        </el-col>
      </el-row>


      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="房间数量" prop="capacity">
            <el-input-number v-model="roomForm.capacity" :min="1" :max="20" style="width: 100%"></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="roomForm.status">
              <el-radio :label="1">可用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

<!--      <el-form-item label="设备配置">-->
<!--        <el-checkbox-group v-model="selectedFacilities">-->
<!--          <el-checkbox label="投影�?></el-checkbox>-->
<!--          <el-checkbox label="电脑"></el-checkbox>-->
<!--          <el-checkbox label="麦克�?></el-checkbox>-->
<!--          <el-checkbox label="空调"></el-checkbox>-->
<!--          <el-checkbox label="智能黑板"></el-checkbox>-->
<!--        </el-checkbox-group>-->
<!--      </el-form-item>      -->
      <el-form-item label="座位配置">
        <el-card v-for="item in roomForm.capacity" :key="item">
          <p>房间序号:{{item}} </p>
          <div class="time-slot-config">
            <span>可选时间段:</span>
            <div class="time-slot-selection">
              <el-select 
                v-model="seats_date" 
                multiple 
                placeholder="请选择时间段"
                style="width: 300px; margin-right: 10px;">
                <el-option
                  v-for="option in options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value">
                </el-option>
              </el-select>
              <el-button type="primary" size="small" @click="showTimeSlotDialog = true">
                <i class="el-icon-plus"></i> 添加时间段
              </el-button>
            </div>
          </div>
        </el-card>
      </el-form-item>

      <!-- 自定义时间段对话框 -->
      <el-dialog
        title="添加自定义时间段"
        :visible.sync="showTimeSlotDialog"
        width="400px">
        <el-form :model="customTimeSlot" label-width="80px">
          <el-form-item label="开始时间">
            <el-time-picker
              v-model="customTimeSlot.start"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="选择开始时间">
            </el-time-picker>
          </el-form-item>
          <el-form-item label="结束时间">
            <el-time-picker
              v-model="customTimeSlot.end"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="选择结束时间">
            </el-time-picker>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="showTimeSlotDialog = false">取消</el-button>
          <el-button type="primary" @click="addCustomTimeSlot">确定</el-button>
        </div>
      </el-dialog>

      <el-form-item label="琴房描述" prop="description">
        <el-input
          type="textarea"
          v-model="roomForm.description"
          placeholder="请输入琴房描述"
          :rows="3">
        </el-input>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { roomApi } from '@/api/room'
import { roomTypeApi } from '@/api/roomType'
import { buildingApi } from '@/api/building'
import deptApi from '@/api/dept'

export default {
  name: 'RoomForm',
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
    },
    // 是否为添加操作
    isAdd: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      buildingList: [],
      roomTypeList: [],
      deptList: [], // 院系列表
      // 提交中状态
      seats_date:[],
      options:[{
        value: "08:00 - 10:00",
        label: '08:00 - 10:00'
      },
        {
          value: "10:00 - 12:00",
          label: '10:00 - 12:00'
        },
        {
          value: "14:00 - 16:00",
          label: '14:00 - 16:00'
        },
        {
          value: "16:00 - 18:00",
          label: '16:00 - 18:00'
        },
        {
          value: "19:00 - 21:00",
          label: '19:00 - 21:00'
        }],
      // 自定义时间段对话框显示状态
      showTimeSlotDialog: false,
      // 自定义时间段表单
      customTimeSlot: {
        start: '',
        end: ''
      },
      submitting: false,
      // 表单数据
      roomForm: {
        id: undefined,
        roomNumber: '',
        name: '',
        buildingId: '',
        roomTypeId: '',
        departmentId: '', // 院系ID
        capacity: 50,
        floor: 1,
        facilities: '',
        status: 1,
        description: '',
        seats:[]
      },
      // 选中的设备
      selectedFacilities: [],
      // 表单验证规则
      rules: {
        roomNumber: [
          { required: true, message: '请输入琴房号', trigger: 'blur' },
          { max: 20, message: '琴房号长度不能超过20个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入琴房名称', trigger: 'blur' },
          { max: 50, message: '琴房名称长度不能超过50个字符', trigger: 'blur' }
        ],
        capacity: [
          { required: true, message: '请输入容纳人数', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 对话框可见性，用于支持.sync修饰符
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
    // 监听visible属性变化，当对话框显示时初始化表单
    visible(val) {
      if (val && this.isAdd) {
        // 重置表单初始值
        this.resetForm()
      }
      if (val) {
        // 当对话框显示时，重新获取琴房类型列表和院系列表
        this.fetchRoomTypeList()
        this.fetchDeptList() // 获取院系列表
      }
    },
    // 监听room属性变化，填充表单
    room: {
      handler(val) {
        if (val && Object.keys(val).length > 0 && !this.isAdd) {
          // 处理后端返回的数据格式
          if (typeof val.data === 'object' && val.data !== null) {
            // 如果返回的是嵌套在data中的对象
            this.roomForm = { ...val.data }
          } else {
            // 直接使用返回的对象
            this.roomForm = { ...val }
          }

          // 确保数字类型的字段是数字
          if (this.roomForm.capacity !== undefined) {
            this.roomForm.capacity = Number(this.roomForm.capacity)
          }
          if (this.roomForm.floor !== undefined) {
            this.roomForm.floor = Number(this.roomForm.floor)
          }
          if (this.roomForm.status !== undefined) {
            this.roomForm.status = Number(this.roomForm.status)
          }

          // 处理设施列表
          this.selectedFacilities = this.roomForm.facilities ? this.roomForm.facilities.split(',') : []
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // 组件创建时获取琴房类型列表和建筑列表
    this.fetchRoomTypeList()
    this.fetchBuildingList()
    this.fetchDeptList() // 获取院系列表
  },
  methods: {
    // 添加自定义时间段
    addCustomTimeSlot() {
      if (!this.customTimeSlot.start || !this.customTimeSlot.end) {
        this.$message.warning('请选择开始时间和结束时间')
        return
      }
      
      if (this.customTimeSlot.start >= this.customTimeSlot.end) {
        this.$message.warning('结束时间必须大于开始时间')
        return
      }
      
      const timeSlotLabel = `${this.customTimeSlot.start} - ${this.customTimeSlot.end}`
      const timeSlotValue = timeSlotLabel
      
      // 检查是否已存在相同的时间段
      const exists = this.options.some(option => option.value === timeSlotValue)
      if (exists) {
        this.$message.warning('该时间段已存在')
        return
      }
      
      // 添加到选项中
      this.options.push({
        value: timeSlotValue,
        label: timeSlotLabel
      })
      
      // 清空自定义时间段
      this.customTimeSlot = {
        start: '',
        end: ''
      }
      
      // 关闭对话框
      this.showTimeSlotDialog = false
      
      this.$message.success('时间段添加成功')
    },


    // 提交表单
    submitForm() {
      this.$refs.roomForm.validate(valid => {
        if (!valid) return

        // 处理设施
        this.roomForm.facilities = this.selectedFacilities.join(',')

        this.submitting = true

        this.roomForm.seats = []

        //拼接座位数据
        for (let i = 1; i <= this.roomForm.capacity; i++){
         let data = {
           seatsindex: "座位序号"+i,
           dates:[],
         }
          console.log("座位时间数据",this.seats_date)
          this.seats_date.forEach( (item) =>{
            let seatData= {
              date:item,
              username:"",
              id:"",
              status:''
            }
            data.dates.push(seatData)
            console.log("时间数据",data)
          })
          this.roomForm.seats.push(data)
        }
        // 构建提交数据
        const submitData = { ...this.roomForm }
        submitData.seats = JSON.stringify(this.roomForm.seats)

        // 根据是否为添加操作选择API
        const apiMethod = this.isAdd ? roomApi.save : roomApi.update

        apiMethod(submitData)
          .then(response => {
            // 提交成功
            this.$message({
              type: 'success',
              message: this.isAdd ? '添加成功' : '更新成功'
            })
            this.dialogVisible = false
            this.$emit('success')
          })
          .catch(error => {
            console.error('提交失败', error)
            this.$message.error('操作失败: ' + (error.message || '未知错误'))
          })
          .finally(() => {
            this.submitting = false
          })
      })
    },

    // 获取琴房类型列表
    fetchRoomTypeList() {
      // 这里应该调用API获取琴房类型列表
      console.log('获取琴房类型列表')
    },

    // 获取建筑列表
    fetchBuildingList() {
      // 这里应该调用API获取建筑列表
      console.log('获取建筑列表')
    },

    // 获取院系列表
    fetchDeptList() {
      // 这里应该调用API获取院系列表
      console.log('获取院系列表')
    },

    // 重置表单
    resetForm() {
      if (this.$refs.roomForm) {
        this.$refs.roomForm.resetFields()
      }

      this.roomForm = {
        id: undefined,
        roomNumber: '',
        name: '',
        building: '',
        roomTypeId: '',
        deptId: '', // 院系ID
        capacity: 50,
        floor: 1,
        facilities: '',
        status: 1,
        description: '',
        seats: []
      }
      this.selectedFacilities = []
    }
  }
}
</script>

<style scoped>
.el-input-number {
  width: 100%;
}

.time-slot-config {
  margin-bottom: 15px;
}

.time-slot-config span {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #606266;
}

.time-slot-selection {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.el-card {
  margin-bottom: 15px;
}

.el-card p {
  margin: 0 0 10px 0;
  font-weight: bold;
  color: #303133;
}
</style>



