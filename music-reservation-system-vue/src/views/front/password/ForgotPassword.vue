<template>
  <div class="forgot-password-container">
    <div class="forgot-form-wrapper">
      <div class="form-header">
        <i class="el-icon-key"></i>
        <h2 class="form-title">找回密码</h2>
        <p class="form-subtitle">请选择找回密码的方式</p>
      </div>

      <!-- 找回方式选择 -->
      <div class="method-tabs">
        <el-radio-group v-model="resetMethod" size="medium">
          <el-radio-button label="email">
            <i class="el-icon-message"></i> 邮箱找回
          </el-radio-button>
          <el-radio-button label="phone">
            <i class="el-icon-mobile-phone"></i> 手机找回
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 邮箱找回表单 -->
      <el-form 
        v-show="resetMethod === 'email'"
        :model="emailForm" 
        :rules="emailRules" 
        ref="emailForm"
        label-position="top">
        
        <el-form-item label="邮箱地址" prop="email">
          <el-input 
            v-model="emailForm.email" 
            prefix-icon="el-icon-message" 
            placeholder="请输入邮箱地址">
          </el-input>
        </el-form-item>

        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-input">
            <el-input 
              v-model="emailForm.captcha" 
              prefix-icon="el-icon-key" 
              placeholder="请输入验证码">
            </el-input>
            <el-button 
              type="primary" 
              :disabled="emailCooldown > 0"
              class="captcha-button">
              {{ emailCooldown > 0 ? `重新发送(${emailCooldown}s)` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <div class="form-actions">
          <el-button 
            type="primary" 
            class="submit-button" 
            :loading="loading"
            @click="handleEmailReset">
            <i class="el-icon-right"></i> 下一步
          </el-button>
        </div>
      </el-form>

      <!-- 手机找回表单 -->
      <el-form 
        v-show="resetMethod === 'phone'"
        :model="phoneForm" 
        :rules="phoneRules" 
        ref="phoneForm"
        label-position="top">
        
        <el-form-item label="手机号码" prop="phone">
          <el-input 
            v-model="phoneForm.phone" 
            prefix-icon="el-icon-mobile-phone" 
            placeholder="请输入手机号码">
          </el-input>
        </el-form-item>

        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-input">
            <el-input 
              v-model="phoneForm.captcha" 
              prefix-icon="el-icon-key" 
              placeholder="请输入验证码">
            </el-input>
            <el-button 
              type="primary" 
              :disabled="phoneCooldown > 0"
              class="captcha-button">
              {{ phoneCooldown > 0 ? `重新发送(${phoneCooldown}s)` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <div class="form-actions">
          <el-button 
            type="primary" 
            class="submit-button" 
            :loading="loading"
            @click="handlePhoneReset">
            <i class="el-icon-right"></i> 下一步
          </el-button>
        </div>
      </el-form>

      <div class="back-login">
        <router-link to="/login">
          <el-button type="info" plain class="back-button">
            <i class="el-icon-arrow-left"></i> 返回登录
          </el-button>
        </router-link>
      </div>
    </div>

    <!-- 页脚 -->
    <!-- <FooterBar /> -->
  </div>
</template>

<script>
import { userApi } from '@/api/user';
import FooterBar from '@/views/front/components/FooterBar.vue';

export default {
  name: 'ForgotPassword',
  components: {
    FooterBar
  },
  data() {
    return {
      resetMethod: 'email', // 默认使用邮箱找回
      loading: false,
      
      // 邮箱找回表单
      emailForm: {
        email: '',
        captcha: ''
      },
      
      // 手机找回表单
      phoneForm: {
        phone: '',
        captcha: ''
      },
      
      // 邮箱验证码冷却时间
      emailCooldown: 0,
      
      // 手机验证码冷却时间
      phoneCooldown: 0,
      
      // 邮箱表单验证规则
      emailRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 6, message: '验证码长度应为4-6位', trigger: 'blur' }
        ]
      },
      
      // 手机表单验证规则
      phoneRules: {
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 6, message: '验证码长度应为4-6位', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 发送邮箱验证码
    sendEmailCode() {
      this.$refs.emailForm.validateField('email', (errorMessage) => {
        if (errorMessage) {
          return
        }
        
        // 验证通过，开始发送验证码
        this.emailCooldown = 60
        const timer = setInterval(() => {
          this.emailCooldown--
          if (this.emailCooldown <= 0) {
            clearInterval(timer)
          }
        }, 1000)
        
        // 这里添加发送验证码的API调用
        this.$message.success(`验证码已发送至邮箱: ${this.emailForm.email}`)
      })
    },
    
    // 发送手机验证码
    sendPhoneCode() {
      this.$refs.phoneForm.validateField('phone', (errorMessage) => {
        if (errorMessage) {
          return
        }
        
        // 验证通过，开始发送验证码
        this.phoneCooldown = 60
        const timer = setInterval(() => {
          this.phoneCooldown--
          if (this.phoneCooldown <= 0) {
            clearInterval(timer)
          }
        }, 1000)
        
        // 这里添加发送验证码的API调用
        this.$message.success(`验证码已发送至手机: ${this.phoneForm.phone}`)
      })
    },
    
    // 邮箱找回处理
    handleEmailReset() {
      this.$refs.emailForm.validate(valid => {
        if (!valid) return
        
        this.loading = true
        
        // 模拟验证过程
        setTimeout(() => {
          this.loading = false
          // 跳转到重置密码页面，并传递必要参数
          this.$router.push({
            path: '/reset-password',
            query: {
              type: 'email',
              email: this.emailForm.email
            }
          })
        }, 1000)
      })
    },
    
    // 手机找回处理
    handlePhoneReset() {
      this.$refs.phoneForm.validate(valid => {
        if (!valid) return
        
        this.loading = true
        
        // 模拟验证过程
        setTimeout(() => {
          this.loading = false
          // 跳转到重置密码页面，并传递必要参数
          this.$router.push({
            path: '/reset-password',
            query: {
              type: 'phone',
              phone: this.phoneForm.phone
            }
          })
        }, 1000)
      })
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('@/assets/images/login-bg.jpg');
  background-size: cover;
  background-position: center;
  padding: 40px 0;
}

.forgot-form-wrapper {
  width: 420px;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 25px;
}

.form-header i {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 10px;
}

.form-title {
  font-size: 24px;
  color: #303133;
  margin: 10px 0;
}

.form-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 5px 0 0;
}

.method-tabs {
  margin-bottom: 25px;
  text-align: center;
}

.method-tabs .el-radio-group {
  width: 100%;
}

.method-tabs .el-radio-button {
  width: 50%;
}

.method-tabs .el-radio-button__inner {
  width: 100%;
}

.captcha-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-input .el-input {
  flex: 1;
}

.captcha-button {
  white-space: nowrap;
  min-width: 120px;
}

.form-actions {
  margin-top: 10px;
}

.submit-button {
  width: 100%;
}

.back-login {
  margin-top: 20px;
  text-align: center;
}

.back-button {
  width: 100%;
}

@media (max-width: 480px) {
  .forgot-form-wrapper {
    width: 90%;
    padding: 20px;
  }
  
  .captcha-input {
    flex-direction: column;
    gap: 10px;
  }
  
  .captcha-button {
    width: 100%;
  }
}
</style> 