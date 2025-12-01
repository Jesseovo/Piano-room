<template>
  <div class="reset-password-container">
    <div class="reset-form-wrapper">
      <div class="form-header">
        <i class="el-icon-key"></i>
        <h2 class="form-title">重置密码</h2>
        <p class="form-subtitle">请设置您的新密码</p>
      </div>
      
      <el-form ref="resetForm" :model="resetForm" :rules="rules" label-position="top" @submit.native.prevent>
        <div class="form-body">
          <el-form-item prop="password" label="新密码">
            <el-input
              v-model="resetForm.password"
              :type="passwordType"
              placeholder="请输入新密码"
              @input="checkPasswordStrength"
              prefix-icon="el-icon-lock"
            >
              <i
                slot="suffix"
                :class="passwordType === 'password' ? 'el-icon-view' : 'el-icon-hide'"
                @click="togglePasswordVisibility('password')"
              ></i>
            </el-input>
          </el-form-item>
          
          <div v-if="resetForm.password" class="password-strength" :style="{ borderLeftColor: strengthColor }">
            <div class="strength-header">
              <span class="strength-label">密码强度:</span>
              <span class="strength-text" :class="strengthClass">{{ strengthText }}</span>
            </div>
            <el-progress :percentage="strengthPercentage" :color="strengthColor" :show-text="false"></el-progress>
            <div class="strength-feedback">{{ strengthFeedback }}</div>
          </div>
          
          <el-form-item prop="confirmPassword" label="确认密码">
            <el-input
              v-model="resetForm.confirmPassword"
              :type="confirmPasswordType"
              placeholder="请再次输入密码"
              prefix-icon="el-icon-lock"
            >
              <i
                slot="suffix"
                :class="confirmPasswordType === 'password' ? 'el-icon-view' : 'el-icon-hide'"
                @click="togglePasswordVisibility('confirm')"
              ></i>
            </el-input>
          </el-form-item>
        </div>
        
        <div class="form-actions">
          <el-button
            type="primary"
            class="submit-button"
            :loading="loading"
            @click="handleReset"
          >
            <i class="el-icon-check"></i>确认重置
          </el-button>
          <el-button
            type="default"
            class="back-button"
            @click="goToLogin"
          >
            <i class="el-icon-back"></i>返回登录
          </el-button>
        </div>
      </el-form>
    </div>
    
    <!-- 页脚 -->
    <!-- <FooterBar /> -->
  </div>
</template>

<script>
import { userApi } from '@/api/user';
import FooterBar from '@/views/front/components/FooterBar.vue';

export default {
  name: 'ResetPassword',
  components: {
    FooterBar
  },
  data() {
    // 确认密码验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.resetForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    
    return {
      // 重置密码表单
      resetForm: {
        password: '',
        confirmPassword: ''
      },
      // 表单验证规则
      rules: {
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 8, message: '密码长度不能少于8个字符', trigger: 'blur' },
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      passwordType: 'password',
      confirmPasswordType: 'password',
      loading: false,
      
      // 密码强度相关
      strengthPercentage: 0,
      strengthText: '请输入密码',
      strengthColor: '#DCDFE6',
      strengthFeedback: ''
    }
  },
  computed: {
    // 密码强度文本颜色
    strengthClass() {
      if (this.strengthPercentage <= 25) return 'strength-weak';
      if (this.strengthPercentage <= 50) return 'strength-medium';
      if (this.strengthPercentage <= 75) return 'strength-strong';
      return 'strength-very-strong';
    }
  },
  mounted() {
    // 获取URL参数
    const { type, email, phone } = this.$route.query
    if (!type || (!email && !phone)) {
      this.$message.warning('重置链接无效，即将返回找回密码页面')
      setTimeout(() => {
        this.$router.push('/forgot-password')
      }, 1500)
    }
  },
  methods: {
    // 检查密码强度
    checkPasswordStrength() {
      const password = this.resetForm.password
      let strength = 0
      let feedback = []

      if (password.length >= 8) {
        strength += 25
        feedback.push('长度符合要求')
      }
      
      if (password.match(/[a-z]/)) {
        strength += 25
        feedback.push('包含小写字母')
      }
      
      if (password.match(/[A-Z]/)) {
        strength += 25
        feedback.push('包含大写字母')
      }
      
      if (password.match(/[0-9]/)) {
        strength += 25
        feedback.push('包含数字')
      }

      this.strengthPercentage = strength
      
      if (strength <= 25) {
        this.strengthText = '弱'
        this.strengthColor = '#F56C6C'
      } else if (strength <= 50) {
        this.strengthText = '中'
        this.strengthColor = '#E6A23C'
      } else if (strength <= 75) {
        this.strengthText = '强'
        this.strengthColor = '#409EFF'
      } else {
        this.strengthText = '非常强'
        this.strengthColor = '#67C23A'
      }
      
      this.strengthFeedback = feedback.join('、') || '请输入密码'
    },
    
    // 重置密码处理
    handleReset() {
      this.$refs.resetForm.validate(valid => {
        if (!valid) return;
        
        this.loading = true;
        
        const { type, email, phone, token } = this.$route.query;
        const resetData = {
          password: this.resetForm.password,
          type: type,
          token: token // 确保包含重置令牌
        };
        
        if (type === 'email') {
          resetData.email = email;
        } else if (type === 'phone') {
          resetData.phone = phone;
        }
        
        console.log('提交重置密码数据:', resetData);
        
        // 调用API重置密码
        userApi.resetPassword(resetData)
          .then(response => {
            if (response && response.code === 1) {
              this.$message.success('密码重置成功！请使用新密码登录');
              this.$router.push('/login');
            } else {
              this.$message.error(response?.msg || '密码重置失败，请重试');
            }
          })
          .catch(error => {
            console.error('重置密码出错:', error);
            this.$message.error('重置密码出错: ' + (error.message || '未知错误'));
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    togglePasswordVisibility(type) {
      this[`${type}Type`] = this[`${type}Type`] === 'password' ? 'text' : 'password';
    },
    goToLogin() {
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('@/assets/images/login-bg.jpg');
  background-size: cover;
  background-position: center;
  padding: 40px 0;
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.reset-form-wrapper {
  width: 420px;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(0);
  transition: all 0.3s ease;
  animation: slideUp 0.6s ease-out;
}

.reset-form-wrapper:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.form-header {
  text-align: center;
  margin-bottom: 25px;
}

.form-header i {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 10px;
  animation: iconPulse 1.5s infinite alternate;
}

@keyframes iconPulse {
  from {
    transform: scale(1);
    opacity: 0.9;
  }
  to {
    transform: scale(1.1);
    opacity: 1;
  }
}

.form-title {
  font-size: 26px;
  color: #303133;
  margin: 10px 0;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 5px 0 0;
}

.el-form-item {
  transition: all 0.3s ease;
  margin-bottom: 22px;
}

.el-form-item:hover {
  transform: translateX(3px);
}

.el-input__inner {
  border-radius: 6px;
  transition: all 0.3s ease;
  height: 42px;
  line-height: 42px;
}

.el-input__icon {
  cursor: pointer;
  transition: all 0.3s ease;
}

.el-input__icon:hover {
  color: #409EFF;
  transform: scale(1.1);
}

.password-strength {
  margin-bottom: 24px;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s ease;
  border-left: 3px solid #DCDFE6;
}

.password-strength:hover {
  background-color: #f2f6fc;
}

.strength-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.strength-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.strength-text {
  font-size: 13px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.strength-feedback {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.strength-weak {
  color: #F56C6C;
}

.strength-medium {
  color: #E6A23C;
}

.strength-strong {
  color: #409EFF;
}

.strength-very-strong {
  color: #67C23A;
}

.form-actions {
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submit-button, .back-button {
  width: 100%;
  height: 44px;
  font-size: 15px;
  letter-spacing: 0.5px;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.submit-button {
  background: linear-gradient(135deg, #409EFF 0%, #2e88e5 100%);
  border: none;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  background: linear-gradient(135deg, #66b1ff 0%, #409EFF 100%);
}

.submit-button:active {
  transform: translateY(0);
}

.back-button {
  border: 1px solid #c0c4cc;
  color: #606266;
}

.back-button:hover {
  color: #409EFF;
  border-color: #b3d8ff;
  background-color: #ecf5ff;
}

@media (max-width: 480px) {
  .reset-form-wrapper {
    width: 90%;
    padding: 25px 20px;
  }
  
  .form-header i {
    font-size: 42px;
  }
  
  .form-title {
    font-size: 22px;
  }
  
  .submit-button, .back-button {
    height: 42px;
  }
}
</style>

<style>
.el-form-item__label {
  font-weight: 500;
  font-size: 14px;
  color: #606266;
  transition: all 0.3s ease;
}

.el-form-item:hover .el-form-item__label {
  color: #409EFF;
}

.el-input__inner:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.el-progress-bar__inner {
  transition: all 0.5s ease;
}

.el-button i {
  margin-right: 5px;
  transition: all 0.3s ease;
}

.el-button:hover i {
  transform: scale(1.2);
}
</style> 