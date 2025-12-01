<template>
  <el-dialog 
    :title="isAdd ? '添加琴房类型' : '编辑琴房类型'" 
    :visible.sync="visible" 
    width="500px"
    @close="handleClose">
    <el-form 
      ref="roomTypeForm" 
      :model="form" 
      :rules="rules" 
      label-width="80px">
      <el-form-item label="类型名称" prop="typeName">
        <el-input v-model="form.typeName" placeholder="请输入琴房类型名称"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input 
          type="textarea" 
          v-model="form.description" 
          placeholder="请输入描述信息"
          :rows="4">
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { roomTypeApi } from '@/api/roomType'

export default {
  name: 'RoomTypeForm',
  props: {
    // 对话框可见性
    visible: {
      type: Boolean,
      required: true
    },
    // 当前操作的琴房类型对象
    roomType: {
      type: Object,
      required: true
    },
    // 是否为添加操作
    isAdd: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 表单数据
      form: {
        id: undefined,
        typeName: '',
        description: ''
      },
      // 表单验证规则
      rules: {
        typeName: [
          { required: true, message: '请输入琴房类型名称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        description: [
          { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
        ]
      },
      // 提交状态
      submitting: false
    }
  },
  watch: {
    // 监听可见性变化，当显示对话框时，初始化表单数据
    visible(val) {
      if (val) {
        this.initForm()
      }
    },
    // 监听roomType变化，当roomType变化时，更新表单数据
    roomType: {
      handler(val) {
        if (this.visible && val) {
          this.initForm()
        }
      },
      deep: true
    }
  },
  methods: {
    // 初始化表单数据
    initForm() {
      if (this.isAdd) {
        this.form = {
          id: undefined,
          typeName: '',
          description: ''
        }
      } else {
        this.form = {
          id: this.roomType.id,
          typeName: this.roomType.typeName,
          description: this.roomType.description
        }
      }
      // 重置表单验证
      this.$nextTick(() => {
        if (this.$refs.roomTypeForm) {
          this.$refs.roomTypeForm.clearValidate()
        }
      })
    },
    
    // 提交表单
    submitForm() {
      this.$refs.roomTypeForm.validate(valid => {
        if (!valid) return
        
        this.submitting = true
        
        const promise = this.isAdd ? 
          roomTypeApi.save(this.form) : 
          roomTypeApi.update(this.form)
        
        promise.then(response => {
          console.log('提交表单', response);
          
          if (response && response.code == 1) {
            this.$message.success(this.isAdd ? '添加成功' : '更新成功')
            this.closeDialog()
            this.$emit('success')
          } else {
            this.$message.error(response.msg || (this.isAdd ? '添加失败' : '更新失败'))
          }
          this.submitting = false
        }).catch(error => {
          console.error('提交失败', error)
          this.$message.error('操作失败，请重试')
          this.submitting = false
        })
      })
    },
    
    // 关闭对话框
    closeDialog() {
      this.$emit('update:visible', false)
    },
    
    // 处理对话框关闭
    handleClose() {
      this.form = {
        id: undefined,
        typeName: '',
        description: ''
      }
      this.submitting = false
    }
  }
}
</script> 