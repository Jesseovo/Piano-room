<template>
  <el-dialog :title="title" :visible="localVisible" @update:visible="handleVisibleChange" width="550px" @close="handleClose">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      
      <el-form-item label="学号" prop="studentId">
        <el-input v-model="form.studentId" placeholder="请输入学号"></el-input>
      </el-form-item>
      
      <el-form-item label="姓名" prop="realName">
        <el-input v-model="form.realName" placeholder="请输入姓名"></el-input>
      </el-form-item>
      
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
      </el-form-item>
      
      <el-form-item label="年级" prop="grade" v-if="form.userType === 'STUDENT'">
        <el-select v-model="form.grade" placeholder="请选择年级" style="width: 100%">
          <el-option label="大一" value="1"></el-option>
          <el-option label="大二" value="2"></el-option>
          <el-option label="大三" value="3"></el-option>
          <el-option label="大四" value="4"></el-option>
          <el-option label="研一" value="5"></el-option>
          <el-option label="研二" value="6"></el-option>
          <el-option label="研三" value="7"></el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="专业" prop="major" v-if="form.userType === 'STUDENT'">
        <el-input v-model="form.major" placeholder="请输入专业"></el-input>
      </el-form-item>
      
      <el-form-item label="用户类型" prop="userType">
        <el-select v-model="form.userType" placeholder="请选择用户类型" style="width: 100%">
          <el-option label="学生" value="STUDENT"></el-option>
          <el-option label="教师" value="TEACHER"></el-option>
          <el-option label="管理员" value="ADMIN"></el-option>
        </el-select>
      </el-form-item>
      
      
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      
    
     
        <el-form-item label="密码" :error="passwordError" :required="false" v-if="isAdd">
          <el-input 
            type="password" 
            v-model="form.password" 
            placeholder="请输入密码"
            @blur="validatePassword"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" :error="confirmPasswordError" :required="false" v-if="isAdd">
          <el-input 
            type="password" 
            v-model="form.confirmPassword" 
            placeholder="请再次输入密码"
            @blur="validateConfirmPassword"
          ></el-input>
        </el-form-item>
    
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { userApi } from '@/api/user'

export default {
  name: 'UserForm',
  props: {
    // 对话框标题
    title: {
      type: String,
      default: '添加用户'
    },
    // 对话框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 用户对象
    user: {
      type: Object,
      default: () => ({})
    },
    // 是否为新增操作
    isAdd: {
      type: Boolean,
      default: true
    }
  },
  data() {
    // 自定义校验函数 - 确认密码
    const validateConfirmPassword = (rule, value, callback) => {
      if (this.form.password !== value) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    
    return {
      // 本地可见性控制
      localVisible: false,
      // 提交按钮加载状态
      submitLoading: false,
      // 密码验证错误
      passwordError: '',
      // 确认密码验证错误
      confirmPasswordError: '',
      // 表单数据
      form: {
        id: undefined,
        username: '',
        studentId: '',
        realName: '',
        phone: '',
        grade: '',
        major: '',
        userType: 'STUDENT',
        status: 1,
        password: '',
        confirmPassword: ''
      },
      // 表单校验规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        studentId: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { min: 3, max: 20, message: '学号长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { max: 20, message: '姓名长度不能超过 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[0-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        grade: [
          { required: false, message: '请选择年级', trigger: 'change' }
        ],
        major: [
          { required: false, message: '请输入专业', trigger: 'blur' },
          { max: 50, message: '专业名称不能超过 50 个字符', trigger: 'blur' }
        ],
        userType: [
          // { required: true, message: '请选择用户类型', trigger: 'change' }
        ],
        status: [
          // { required: true, message: '请选择状态', trigger: 'change' }
        ],
        // password: [
        //   // 完全移除初始的密码验证规则
        // ],
        confirmPassword: [
          // 完全移除初始的确认密码验证规则
        ]
      }
    }
  },
  watch: {
    // 监听isAdd属性变化
    isAdd: {
      handler(newVal) {
        // 根据是否为编辑模式调整验证规则
        if (!newVal) {
          // 编辑模式下，移除密码相关的验证规则
          this.rules.password = []
          this.rules.confirmPassword = []
          
          // 编辑模式下，调整其他字段的验证规则，只在有值时验证
          this.rules.phone = [
            { pattern: /^1[0-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
          ]
        } else {
          // 添加模式下的密码验证（仅验证格式，不验证必填）
          this.rules.password = [
            { validator: (rule, value, callback) => {
              // 如果没有输入密码，直接通过验证
              if (!value || value.trim() === '') {
                callback();
              } 
              // 如果输入了密码，检查长度
              else if (value.length < 6 || value.length > 20) {
                callback(new Error('密码长度在 6 到 20 个字符'));
              } else {
                callback();
              }
            }, trigger: 'blur' }
          ];
          
          this.rules.confirmPassword = [
            { validator: (rule, value, callback) => {
              // 如果没有设置密码，确认密码也可以为空
              if (!this.form.password || this.form.password.trim() === '') {
                callback();
              }
              // 如果设置了密码但没有确认，给出提示
              else if (!value || value.trim() === '') {
                callback(new Error('请确认密码'));
              } 
              // 检查密码一致性
              else if (value !== this.form.password) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            }, trigger: 'blur' }
          ];
          
          // 手机号不作为必填项，只校验格式
          this.rules.phone = [
            { pattern: /^1[0-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
          ]
        }
      },
      immediate: true
    },
    // 监听用户对象变化，更新表单数据
    user: {
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
    // 验证密码
    validatePassword() {
      this.passwordError = '';
      // 如果没有输入密码，不显示错误
      if (!this.form.password || this.form.password.trim() === '') {
        return;
      }
      // 如果输入了密码，验证格式
      if (this.form.password.length < 6 || this.form.password.length > 20) {
        this.passwordError = '密码长度在 6 到 20 个字符';
      }
      // 当密码变更时，重新验证确认密码
      if (this.form.confirmPassword) {
        this.validateConfirmPassword();
      }
    },
    
    // 验证确认密码
    validateConfirmPassword() {
      this.confirmPasswordError = '';
      // 如果没有设置密码，不需要验证确认密码
      if (!this.form.password || this.form.password.trim() === '') {
        return;
      }
      // 如果设置了密码但没有确认，给出提示
      if (!this.form.confirmPassword || this.form.confirmPassword.trim() === '') {
        this.confirmPasswordError = '请确认密码';
      } 
      // 检查密码一致性
      else if (this.form.confirmPassword !== this.form.password) {
        this.confirmPasswordError = '两次输入的密码不一致';
      }
    },
    
    
    // 格式化数据，将接口返回的数据转换为表单需要的格式
    formatData(data) {
      // 复制原始数据，避免修改源对象
      const formatted = { ...data }
      
      // 确保数值类型正确
      if (formatted.status !== undefined) {
        formatted.status = Number(formatted.status)
      }
      
      // 如果是新增，则添加密码字段
      if (!formatted.id) {
        formatted.password = ''
        formatted.confirmPassword = ''
      }
      
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
      // 如果填写了密码，验证密码格式
      if (this.form.password && this.form.password.trim() !== '') {
        this.validatePassword();
        this.validateConfirmPassword();
        if (this.passwordError || this.confirmPasswordError) {
          return;
        }
      }
      
      this.$refs.form.validate(valid => {
        if (!valid) return
        
        this.submitLoading = true
        
        // 构建提交数据，去除不需要的字段
        let submitData = { ...this.form }
        delete submitData.confirmPassword
        
        // 如果密码为空，删除密码字段（添加和编辑模式都适用）
        if (!submitData.password || submitData.password.trim() === '') {
          delete submitData.password
        }
        
        
        // 判断是否为编辑模式，如果是则只提交有值的字段
        if (!this.isAdd) {
          const cleanData = {}
          // 保留id字段，这是必需的
          cleanData.id = submitData.id
          
          // 只保留有值的字段（不为空或null的字段）
          Object.keys(submitData).forEach(key => {
            const value = submitData[key]
            if (key !== 'id' && value !== null && value !== undefined && value !== '') {
              cleanData[key] = value
            }
          })
          
          // 使用过滤后的数据
          submitData = cleanData
        }
        
        // 判断是新增还是编辑
        const apiMethod = this.isAdd ? 
        //新增用户  没实现
          (data => userApi.addUser(data)) : 
          //更新用户
          (data => userApi.updateUserInfo(data))
        
        apiMethod(submitData)
          .then(response => {
            if (response && response.code === 1) {
              this.$message.success(this.isAdd ? '添加成功' : '更新成功')
              this.$emit('success')
              this.$emit('update:visible', false)
              this.handleClose()
            } else {
              this.$message.error(response.msg || (this.isAdd ? '添加失败' : '更新失败'))
            }
            this.submitLoading = false
          })
          .catch(error => {
            console.error('提交失败:', error)
            this.$message.error('操作失败: ' + (error.message || '未知错误'))
            this.submitLoading = false
          })
      })
    },
    
    // 关闭对话框后重置表单
    handleClose() {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
      
      // 重置错误信息
      this.passwordError = '';
      this.confirmPasswordError = '';
      
      this.form = {
        id: undefined,
        username: '',
        studentId: '',
        realName: '',
        phone: '',
        grade: '',
        major: '',
        userType: 'STUDENT',
        status: 1,
        password: '',
        confirmPassword: ''
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