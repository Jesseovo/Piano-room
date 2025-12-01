<template>
  <el-dialog :title="title" :visible="localVisible" @update:visible="handleVisibleChange" width="500px" @close="handleClose">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="院系名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入院系名称"></el-input>
      </el-form-item>
      <el-form-item label="院系代码" prop="code">
        <el-input v-model="form.code" placeholder="请输入院系代码"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import deptApi from '@/api/dept'

export default {
  name: 'DepartmentForm',
  props: {
    // 对话框标题
    title: {
      type: String,
      default: '添加院系'
    },
    // 对话框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 院系对象
    department: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 本地可见性控制
      localVisible: false,
      // 表单数据
      form: {
        id: undefined,
        name: '',
        code: ''
      },
      // 表单校验规则
      rules: {
        name: [
          { required: true, message: '请输入院系名称', trigger: 'blur' },
          { min: 2, max: 50, message: '院系名称长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入院系代码', trigger: 'blur' },
          { min: 2, max: 20, message: '院系代码长度在 2 到 20 个字符', trigger: 'blur' }
        ]
      },
      // 提交按钮加载状态
      submitLoading: false
    }
  },
  watch: {
    // 监听部门对象变化，更新表单数据
    department: {
      handler(val) {
        this.form = this.formatData(val)
      },
      immediate: true
    },
    // 监听外部visible变化，更新本地状态
    visible: {
      handler(newVal) {
        this.localVisible = newVal
      },
      immediate: true
    }
  },
  methods: {
    // 格式化数据，将接口返回的数据转换为表单需要的格式
    formatData(data) {
      // 复制原始数据，避免修改源对象
      const formatted = { ...data }
      
      // 打印原始数据的所有字段和对应值，方便调试
      // Object.keys(data).forEach(key => {
      //   console.log(`${key}: ${JSON.stringify(data[key])}`)
      // })
      
      return formatted
    },
    
    // 处理对话框可见性变化
    handleVisibleChange(val) {
      this.$emit('update:visible', val)
    },
    
    // 关闭对话框
    closeDialog() {
      this.$emit('update:visible', false)
    },
    
    // 提交表单
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        
        this.submitLoading = true
        
        // 判断是新增还是编辑
        const isAdd = !this.form.id
        const api = isAdd ? deptApi.add : deptApi.update
        
        api(this.form)
          .then(response => {
            if(response.code == 1){
              this.submitLoading = false
              this.$emit('success')
              this.$emit('update:visible', false)
              this.handleClose()
            }else{
              this.$message.error(response.msg || '操作失败')
              this.submitLoading = false
            }
          })
          .catch(error => {
            this.$message.error('操作失败: ' + (error.message || '未知错误'))
            this.submitLoading = false
          })
      })
    },
    
    // 关闭对话框后重置表单
    handleClose() {
      this.$refs.form.resetFields()
      this.form = {
        id: undefined,
        name: '',
        code: ''
      }
    }
  }
}
</script>

<style scoped>
.el-form {
  padding: 0 20px;
}
</style> 