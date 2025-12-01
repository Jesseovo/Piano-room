<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" @close="handleClose">
    <el-descriptions v-if="isEdit" class="margin-top" :column="1" border>
      <el-descriptions-item label="琴房名称">{{ form.roomName }}</el-descriptions-item>
      <el-descriptions-item label="维修类型">{{ form.maintenanceType }}</el-descriptions-item>
      <el-descriptions-item label="维修原因">{{ form.reason || '无' }}</el-descriptions-item>
      <el-descriptions-item label="开始时间">{{ form.startTime }}</el-descriptions-item>
      <el-descriptions-item label="结束时间">{{ form.endTime }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ form.createdAt }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ form.updatedAt }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ form.remark || '无' }}</el-descriptions-item>
      <el-descriptions-item label="维修状态">
        <el-select v-model="form.status" placeholder="请选择维修状态" style="width: 100%;">
          <el-option label="未开始" value="未开始"></el-option>
          <el-option label="进行中" value="进行中"></el-option>
          <el-option label="已完成" value="已完成"></el-option>
          <el-option label="已取消" value="已取消"></el-option>
        </el-select>
      </el-descriptions-item>
    </el-descriptions>
    
    <el-form v-else ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="琴房名称" prop="roomId">
        <el-select v-model="form.roomId" placeholder="请选择琴房" filterable>
          <el-option
            v-for="item in roomOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维修类型" prop="maintenanceType">
        <el-select v-model="form.maintenanceType" placeholder="请选择维修类型">
          <el-option label="定期维护" value="定期维护"></el-option>
          <el-option label="设备故障" value="设备故障"></el-option>
          <el-option label="环境整治" value="环境整治"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="维修原因" prop="reason">
        <el-input v-model="form.reason" type="textarea" :rows="3" placeholder="请输入维修原因"></el-input>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="form.startTime"
          type="datetime"
          placeholder="选择开始时间"
          value-format="yyyy-MM-dd HH:mm:ss">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="form.endTime"
          type="datetime"
          placeholder="选择结束时间"
          value-format="yyyy-MM-dd HH:mm:ss">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="维修状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择维修状态">
          <el-option label="未开始" value="未开始"></el-option>
          <el-option label="进行中" value="进行中"></el-option>
          <el-option label="已完成" value="已完成"></el-option>
          <el-option label="已取消" value="已取消"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息"></el-input>
      </el-form-item>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
// 修复：原先从 '@/api/room' 按需导入 listRooms，但该文件实际只导出了 roomApi
import { roomApi } from '@/api/room'

export default {
  name: 'MaintenanceForm',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    currentData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      roomOptions: [],
      form: {
        id: undefined,
        roomId: '',
        roomName: '',
        maintenanceType: '定期维护',
        reason: '',
        startTime: '',
        endTime: '',
        status: '未开始',
        remark: '',
        createdAt: '',
        updatedAt: ''
      },
      rules: {
        roomId: [
          { required: true, message: '请选择琴房', trigger: 'change' }
        ],
        maintenanceType: [
          { required: true, message: '请选择维修类型', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入维修原因', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择维修状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑维修状态' : '新增维修记录'
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.loadRooms()
        if (this.isEdit) {
          console.log('表单接收到的编辑数据:', this.currentData) // 调试用
          this.form = { ...this.currentData }
          // 确保roomId字段存在
          if (!this.form.roomId && this.form.id) {
            this.form.roomId = this.form.id
          }
        }
      }
    }
  },
  methods: {
    // 加载琴房列表
    loadRooms() {
      // 使用 roomApi.list 获取琴房列表
      roomApi.list({ page: 1, size: 999 }).then(response => {
        // 兼容不同后端返回结构：可能是 response.data.records 或 response.data.list
        const data = response.data || {}
        this.roomOptions = data.records || data.list || []
      })
    },
    // 处理关闭
    handleClose() {
      this.$refs.form && this.$refs.form.resetFields()
      this.form = {
        id: undefined,
        roomId: '',
        roomName: '',
        maintenanceType: '定期维护',
        reason: '',
        startTime: '',
        endTime: '',
        status: '未开始',
        remark: '',
        createdAt: '',
        updatedAt: ''
      }
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    // 处理提交
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          this.$emit('submit', this.form)
          this.submitLoading = false
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.el-descriptions {
  margin-bottom: 20px;
}
</style> 