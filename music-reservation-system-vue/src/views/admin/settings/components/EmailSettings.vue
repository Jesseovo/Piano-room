<template>
  <div class="email-settings">
    <el-form :model="formData" :rules="rules" ref="emailForm" label-width="120px" size="medium">
      <!-- 是否启用邮件服务 -->
      <el-form-item label="启用邮件" prop="enabled">
        <el-switch v-model="formData.enabled"></el-switch>
        <div class="form-tip">启用后系统将可以发送邮件通知</div>
      </el-form-item>
      
      <!-- SMTP服务器 -->
      <el-form-item label="SMTP服务器" prop="smtpHost" :required="formData.enabled">
        <el-input v-model="formData.smtpHost" placeholder="例如: smtp.example.com" :disabled="!formData.enabled"></el-input>
        <div class="form-tip">邮件服务器地址，如：smtp.163.com</div>
      </el-form-item>
      
      <!-- SMTP端口 -->
      <el-form-item label="SMTP端口" prop="smtpPort" :required="formData.enabled">
        <el-input-number v-model="formData.smtpPort" :min="1" :max="65535" :disabled="!formData.enabled"></el-input-number>
        <div class="form-tip">常用端口: 25, 465(SSL), 587(TLS)</div>
      </el-form-item>
      
      <!-- 是否使用SSL/TLS -->
      <el-form-item label="安全连接" prop="useSSL">
        <el-select v-model="formData.useSSL" placeholder="选择安全连接类型" :disabled="!formData.enabled">
          <el-option label="不使用" value="NONE"></el-option>
          <el-option label="SSL" value="SSL"></el-option>
          <el-option label="TLS" value="TLS"></el-option>
        </el-select>
        <div class="form-tip">如果SMTP需要加密连接，请选择对应类型</div>
      </el-form-item>
      
      <!-- 邮箱账号 -->
      <el-form-item label="邮箱账号" prop="username" :required="formData.enabled">
        <el-input v-model="formData.username" placeholder="发件人邮箱账号" :disabled="!formData.enabled"></el-input>
      </el-form-item>
      
      <!-- 邮箱密码/授权码 -->
      <el-form-item label="邮箱密码" prop="password" :required="formData.enabled">
        <el-input 
          v-model="formData.password" 
          type="password" 
          placeholder="邮箱密码或授权码" 
          :disabled="!formData.enabled"
          show-password
        ></el-input>
        <div class="form-tip">部分邮箱（如QQ邮箱）需要使用授权码而非登录密码</div>
      </el-form-item>
      
      <!-- 发件人名称 -->
      <el-form-item label="发件人名称" prop="senderName" :required="formData.enabled">
        <el-input v-model="formData.senderName" placeholder="显示的发件人名称" :disabled="!formData.enabled"></el-input>
        <div class="form-tip">收件人看到的发件人名称</div>
      </el-form-item>
      
      <!-- 测试邮件接收地址 -->
      <el-form-item label="测试接收邮箱" prop="testEmail" v-if="formData.enabled">
        <el-input v-model="formData.testEmail" placeholder="用于接收测试邮件的邮箱地址"></el-input>
      </el-form-item>
      
      <!-- 测试按钮 -->
      <el-form-item v-if="formData.enabled">
        <el-button 
          type="primary" 
          @click="testEmailSettings"
          :loading="testing"
          :disabled="!formData.testEmail"
        >
          发送测试邮件
        </el-button>
      </el-form-item>
      
      <!-- 保存按钮 -->
      <el-form-item>
        <el-button type="primary" @click="saveSettings" :loading="loading">保存设置</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { settingsApi } from '@/api/settings.js'

export default {
  name: 'EmailSettings',
  data() {
    // 验证邮箱格式
    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      
      const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (!emailRegex.test(value)) {
        callback(new Error('请输入正确的邮箱格式'))
      } else {
        callback()
      }
    }
    
    return {
      loading: false,
      testing: false,
      formData: {
        enabled: false,
        smtpHost: '',
        smtpPort: 465,
        useSSL: 'SSL',
        username: '',
        password: '',
        senderName: '琴房预约管理系统',
        testEmail: ''
      },
      rules: {
        smtpHost: [
          { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
        ],
        smtpPort: [
          { required: true, message: '请输入SMTP端口', trigger: 'change' },
          { type: 'number', message: '端口必须为数字', trigger: 'change' }
        ],
        username: [
          { required: true, message: '请输入邮箱账号', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入邮箱密码或授权码', trigger: 'blur' }
        ],
        senderName: [
          { required: true, message: '请输入发件人名称', trigger: 'blur' }
        ],
        testEmail: [
          { validator: validateEmail, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // this.fetchEmailSettings()
  },
  methods: {
    // 获取邮件设置
    fetchEmailSettings() {
      this.loading = true
      
      settingsApi.getNotificationSettings().then(response => {
        if (response.code === 1 && response.data) {
          // 邮件设置应该是通知设置的一部分
          const emailSettings = response.data.email || {}
          this.formData = { ...this.formData, ...emailSettings }
        } else {
          this.$message.error(response.msg || '获取邮件设置失败')
        }
      }).catch(error => {
        console.error('获取邮件设置失败:', error)
        this.$message.error('获取邮件设置失败：' + error.message)
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 保存邮件设置
    saveSettings() {
      // 如果没有启用邮件服务，跳过验证直接保存
      if (!this.formData.enabled) {
        this.submitSave();
        return;
      }
      
      this.$refs.emailForm.validate(valid => {
        if (!valid) return;
        this.submitSave();
      })
    },
    
    // 提交保存
    submitSave() {
      this.loading = true
      
      // 准备通知设置数据，只更新email部分
      const notificationSettings = {
        email: { ...this.formData }
      }
      // 不需要将测试邮箱保存到设置中
      delete notificationSettings.email.testEmail
      
      settingsApi.updateNotificationSettings(notificationSettings).then(response => {
        if (response.code === 1) {
          this.$message.success('邮件设置保存成功')
        } else {
          this.$message.error(response.msg || '保存失败')
        }
      }).catch(error => {
        console.error('保存邮件设置失败:', error)
        this.$message.error('保存失败：' + error.message)
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 测试邮件设置
    testEmailSettings() {
      if (!this.formData.testEmail) {
        this.$message.warning('请输入测试接收邮箱地址')
        return
      }
      
      // 验证邮箱格式
      const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (!emailRegex.test(this.formData.testEmail)) {
        this.$message.error('请输入正确的邮箱格式')
        return
      }
      
      this.testing = true
      
      const testParams = {
        ...this.formData,
        content: '这是一封测试邮件，如果您收到此邮件，说明邮件设置正确。'
      }
      
      settingsApi.sendTestEmail(testParams).then(response => {
        if (response.code === 1) {
          this.$message.success('测试邮件发送成功，请查收')
        } else {
          this.$message.error(response.msg || '测试邮件发送失败')
        }
      }).catch(error => {
        console.error('发送测试邮件失败:', error)
        this.$message.error('测试邮件发送失败：' + error.message)
      }).finally(() => {
        this.testing = false
      })
    },
    
    // 重置表单
    resetForm() {
      this.$refs.emailForm.resetFields()
      this.fetchEmailSettings()
    }
  }
}
</script>

<style scoped>
.email-settings {
  padding: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style> 