<template>
  <div class="security-settings">
    <el-form :model="formData" :rules="rules" ref="securityForm" label-width="150px" size="medium">
      <h3 class="section-title">密码策略</h3>
      
      <!-- 密码长度要求 -->
      <el-form-item label="最小密码长度" prop="minPasswordLength">
        <el-input-number 
          v-model="formData.minPasswordLength" 
          :min="6" 
          :max="20" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">设置用户密码最小长度要求（建议8位以上）</div>
      </el-form-item>
      
      <!-- 密码复杂度要求 -->
      <el-form-item label="密码复杂度要求">
        <el-checkbox-group v-model="formData.passwordComplexity">
          <el-checkbox label="UPPERCASE">必须包含大写字母</el-checkbox>
          <el-checkbox label="LOWERCASE">必须包含小写字母</el-checkbox>
          <el-checkbox label="NUMBER">必须包含数字</el-checkbox>
          <el-checkbox label="SPECIAL">必须包含特殊字符</el-checkbox>
        </el-checkbox-group>
        <div class="form-tip">选择密码必须满足的复杂度条件</div>
      </el-form-item>
      
      <!-- 密码有效期 -->
      <el-form-item label="密码有效期（天）" prop="passwordExpiryDays">
        <el-input-number 
          v-model="formData.passwordExpiryDays" 
          :min="0" 
          :max="365" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">设置为0表示密码永不过期，大于0表示密码在指定天数后需要更改</div>
      </el-form-item>
      
      <el-divider></el-divider>
      <h3 class="section-title">登录策略</h3>
      
      <!-- 登录失败处理 -->
      <el-form-item label="允许登录失败次数" prop="maxLoginAttempts">
        <el-input-number 
          v-model="formData.maxLoginAttempts" 
          :min="1" 
          :max="10" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">超过此次数将触发账号锁定</div>
      </el-form-item>
      
      <!-- 账号锁定时间 -->
      <el-form-item label="账号锁定时间（分钟）" prop="accountLockTime">
        <el-input-number 
          v-model="formData.accountLockTime" 
          :min="5" 
          :max="1440" 
          :step="5"
        ></el-input-number>
        <div class="form-tip">账号被锁定后，需要等待的解锁时间</div>
      </el-form-item>
      
      <!-- 会话超时时间 -->
      <el-form-item label="会话超时时间（分钟）" prop="sessionTimeout">
        <el-input-number 
          v-model="formData.sessionTimeout" 
          :min="5" 
          :max="1440" 
          :step="5"
        ></el-input-number>
        <div class="form-tip">用户无操作后自动退出登录的时间</div>
      </el-form-item>
      
      <!-- 允许多设备登录 -->
      <el-form-item label="多设备同时登录">
        <el-switch v-model="formData.allowMultipleLogin"></el-switch>
        <div class="form-tip">是否允许同一账号在多设备同时登录</div>
      </el-form-item>
      
      <el-divider></el-divider>
      <h3 class="section-title">验证策略</h3>
      
      <!-- 登录验证码 -->
      <el-form-item label="登录验证码">
        <el-switch v-model="formData.loginCaptchaEnabled"></el-switch>
        <div class="form-tip">登录时是否需要输入图形验证码</div>
      </el-form-item>
      
      <!-- 敏感操作验证 -->
      <el-form-item label="敏感操作验证">
        <el-select v-model="formData.sensitiveOperationVerify" placeholder="选择验证方式">
          <el-option label="无需验证" value="NONE"></el-option>
          <el-option label="密码验证" value="PASSWORD"></el-option>
          <el-option label="短信验证" value="SMS"></el-option>
          <el-option label="邮箱验证" value="EMAIL"></el-option>
        </el-select>
        <div class="form-tip">执行敏感操作（如修改密码、删除账号等）时的验证方式</div>
      </el-form-item>
      
      <!-- 验证码有效期 -->
      <el-form-item label="验证码有效期（分钟）" prop="verificationCodeExpiry">
        <el-input-number 
          v-model="formData.verificationCodeExpiry" 
          :min="1" 
          :max="30" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">短信/邮件验证码的有效期限</div>
      </el-form-item>
      
      <el-divider></el-divider>
      <h3 class="section-title">安全日志</h3>
      
      <!-- 是否记录操作日志 -->
      <el-form-item label="记录操作日志">
        <el-switch v-model="formData.operationLogEnabled"></el-switch>
        <div class="form-tip">是否记录用户的关键操作日志</div>
      </el-form-item>
      
      <!-- 日志保留时间 -->
      <el-form-item label="日志保留时间（天）" prop="logRetentionDays">
        <el-input-number 
          v-model="formData.logRetentionDays" 
          :min="7" 
          :max="365" 
          :step="1"
        ></el-input-number>
        <div class="form-tip">系统日志保留的最长时间</div>
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
// 假设存在设置API
// import { settingsApi } from '@/api/settings.js'

export default {
  name: 'SecuritySettings',
  data() {
    return {
      loading: false,
      formData: {
        // 密码策略
        minPasswordLength: 8,
        passwordComplexity: ['UPPERCASE', 'NUMBER'],
        passwordExpiryDays: 90,
        
        // 登录策略
        maxLoginAttempts: 5,
        accountLockTime: 30,
        sessionTimeout: 30,
        allowMultipleLogin: false,
        
        // 验证策略
        loginCaptchaEnabled: true,
        sensitiveOperationVerify: 'PASSWORD',
        verificationCodeExpiry: 10,
        
        // 安全日志
        operationLogEnabled: true,
        logRetentionDays: 90
      },
      rules: {
        minPasswordLength: [
          { required: true, message: '请设置最小密码长度', trigger: 'change' }
        ],
        passwordExpiryDays: [
          { required: true, message: '请设置密码有效期', trigger: 'change' }
        ],
        maxLoginAttempts: [
          { required: true, message: '请设置允许登录失败次数', trigger: 'change' }
        ],
        accountLockTime: [
          { required: true, message: '请设置账号锁定时间', trigger: 'change' }
        ],
        sessionTimeout: [
          { required: true, message: '请设置会话超时时间', trigger: 'change' }
        ],
        verificationCodeExpiry: [
          { required: true, message: '请设置验证码有效期', trigger: 'change' }
        ],
        logRetentionDays: [
          { required: true, message: '请设置日志保留时间', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchSecuritySettings()
  },
  methods: {
    // 获取安全设置
    fetchSecuritySettings() {
      this.loading = true
      
      // 模拟API调用，实际应用中应替换为真实API
      setTimeout(() => {
        // settingsApi.getSecuritySettings().then(response => {
        //   if (response.success) {
        //     this.formData = {...this.formData, ...response.data}
        //   }
        // }).catch(error => {
        //   this.$message.error('获取安全设置失败：' + error.message)
        // }).finally(() => {
        //   this.loading = false
        // })
        
        // 模拟数据
        this.formData = {
          // 密码策略
          minPasswordLength: 8,
          passwordComplexity: ['UPPERCASE', 'NUMBER'],
          passwordExpiryDays: 90,
          
          // 登录策略
          maxLoginAttempts: 5,
          accountLockTime: 30,
          sessionTimeout: 30,
          allowMultipleLogin: false,
          
          // 验证策略
          loginCaptchaEnabled: true,
          sensitiveOperationVerify: 'PASSWORD',
          verificationCodeExpiry: 10,
          
          // 安全日志
          operationLogEnabled: true,
          logRetentionDays: 90
        }
        
        this.loading = false
      }, 800)
    },
    
    // 保存设置
    saveSettings() {
      this.$refs.securityForm.validate(valid => {
        if (!valid) return
        
        this.loading = true
        
        // 模拟API调用，实际应用中应替换为真实API
        setTimeout(() => {
          // settingsApi.updateSecuritySettings(this.formData).then(response => {
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
          this.$message.success('安全设置保存成功')
          this.loading = false
        }, 800)
      })
    },
    
    // 重置表单
    resetForm() {
      this.$refs.securityForm.resetFields()
      this.fetchSecuritySettings()
    }
  }
}
</script>

<style scoped>
.security-settings {
  padding: 10px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: #303133;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.el-divider {
  margin: 24px 0;
}
</style> 