<template>
  <div class="register-container">
    <div class="register-form-wrapper">
      <h2 class="register-title">注册账号</h2>
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerForm"
        class="register-form"
        label-position="top"
        :size="'small'"
        label-width="80px"
      >
        <el-row :gutter="20">
          <!-- 左侧列 -->
          <el-col :xs="24" :sm="24" :md="12">
            <!-- 用户名 -->
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="registerForm.username"
                prefix-icon="el-icon-user"
                placeholder="请输入用户名"
                clearable
              ></el-input>
            </el-form-item>
            <!-- 学号 -->
            <el-form-item label="学号" prop="studentId">
              <el-input
                v-model="registerForm.studentId"
                prefix-icon="el-icon-user"
                placeholder="请输入学号"
                clearable
              ></el-input>
            </el-form-item>
            <!-- 密码 -->
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="registerForm.password"
                prefix-icon="el-icon-lock"
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
              ></el-input>
            </el-form-item>
            
            <!-- 确认密码 -->
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                prefix-icon="el-icon-lock"
                type="password"
                placeholder="请再次输入密码"
                show-password
                clearable
              ></el-input>
            </el-form-item>
          
            <!-- 邮箱 -->
            <el-form-item label="邮箱" prop="email">
              <div class="code-input-group">
                <el-input
                  v-model="registerForm.email"
                  prefix-icon="el-icon-message"
                  placeholder="请输入邮箱"
                  clearable
                ></el-input>
                <el-button 
                  type="primary" 
                  size="small"
                  :disabled="emailCodeSent || !isEmailValid" 
                  @click="sendEmailCode"
                  :loading="sendingEmailCode"
                >{{ emailCodeSent ? `${emailCodeCountdown}s` : '获取验证码' }}</el-button>
              </div>
            </el-form-item>
            
            <!-- 邮箱验证码 -->
            <el-form-item label="邮箱验证码" prop="emailCode">
              <el-input
                v-model="registerForm.emailCode"
                prefix-icon="el-icon-key"
                placeholder="请输入邮箱验证码"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          
          <!-- 右侧列 -->
          <el-col :xs="24" :sm="24" :md="12">
            <!-- 真实姓名 -->
            <el-form-item label="真实姓名" prop="realName">
              <el-input
                v-model="registerForm.realName"
                prefix-icon="el-icon-s-custom"
                placeholder="请输入真实姓名"
                clearable
              ></el-input>
            </el-form-item>
            
            <!-- 用户类型 -->
            <el-form-item label="用户类型" prop="userType">
              <el-select v-model="registerForm.userType" placeholder="请选择用户类型" style="width: 100%">
                <el-option label="学生" value="student">
                  <i class="el-icon-user-solid"></i> 学生
                </el-option>
                <el-option label="教师" value="teacher">
                  <i class="el-icon-s-custom"></i> 教师
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 学院 -->
            <el-form-item label="学院" prop="deptId">
              <el-select v-model="registerForm.deptId" placeholder="请选择学院" style="width: 100%">
                <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
              </el-select>
            </el-form-item>
          
            <!-- 手机号码 -->
            <!-- <el-form-item label="手机号码" prop="phone">
              <div class="code-input-group">
                <el-input
                  v-model="registerForm.phone"
                  prefix-icon="el-icon-mobile-phone"
                  placeholder="请输入手机号码"
                  clearable
                ></el-input>
                <el-button 
                  type="primary" 
                  size="small"
                  :disabled="phoneCodeSent || !isPhoneValid" 
                  @click="sendPhoneCode"
                  :loading="sendingPhoneCode"
                >{{ phoneCodeSent ? `${phoneCodeCountdown}s` : '获取验证码' }}</el-button>
              </div>
            </el-form-item> -->
            
            <!-- 手机验证码 -->
            <!-- <el-form-item label="手机验证码" prop="phoneCode">
              <el-input
                v-model="registerForm.phoneCode"
                prefix-icon="el-icon-key"
                placeholder="请输入手机验证码"
                clearable
              ></el-input>
            </el-form-item> -->
          
            <!-- 验证码 -->
            <el-form-item label="验证码" prop="captcha">
              <div class="captcha-container">
                <el-input
                  v-model="registerForm.captcha"
                  prefix-icon="el-icon-key"
                  placeholder="请输入验证码"
                  clearable
                ></el-input>
                <img :src="captchaUrl" alt="验证码" class="captcha-img" @click="refreshCaptcha" />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <!-- 同意用户协议 -->
        <el-form-item prop="agreement" class="agreement-item">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <el-link type="primary" @click="showAgreement">《用户协议》</el-link>
            和
            <el-link type="primary" @click="showPrivacy">《隐私政策》</el-link>
          </el-checkbox>
        </el-form-item>
        
        <!-- 注册按钮 -->
        <el-form-item class="register-btn-item">
          <el-button
            type="primary"
            :loading="registering"
            class="register-button"
            @click="handleRegister"
          >注册</el-button>
          <div class="register-options">
            <router-link to="/login" class="register-link">返回登录</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 用户协议对话框 -->
    <el-dialog
      title="用户协议"
      :visible.sync="agreementVisible"
      width="50%"
    >
      <div class="agreement-content">
        <h3>琴房预约系统用户协议</h3>
        <p>欢迎使用琴房预约系统，本协议是您与系统提供方之间关于使用琴房预约系统的各项服务所订立的协议。</p>
        <h4>1. 服务内容</h4>
        <p>琴房预约系统提供琴房预约、查询等相关服务。用户可通过本系统进行琴房资源的查看与预约申请。</p>
        <h4>2. 用户账号</h4>
        <p>用户注册时应提供真实、准确的个人资料，并保证资料的真实性与有效性。用户应妥善保管账号密码，因账号密码保管不当造成的损失由用户自行承担。</p>
        <h4>3. 用户行为规范</h4>
        <p>用户不得利用本系统从事违法活动，不得恶意占用琴房资源，不得影响系统正常运行。</p>
        <h4>4. 服务变更、中断或终止</h4>
        <p>系统提供方保留随时修改或中断服务的权利，系统提供方行使修改或中断服务的权利，不需对用户或第三方负责。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="agreementVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    
    <!-- 隐私政策对话框 -->
    <el-dialog
      title="隐私政策"
      :visible.sync="privacyVisible"
      width="50%"
    >
      <div class="agreement-content">
        <h3>琴房预约系统隐私政策</h3>
        <p>本隐私政策介绍了琴房预约系统如何收集、使用和保护您的个人信息。</p>
        <h4>1. 信息收集</h4>
        <p>我们会收集您的基本个人信息（如姓名、邮箱、手机号码）以提供账号注册和预约服务。</p>
        <h4>2. 信息使用</h4>
        <p>我们使用收集的信息来提供、维护和改进我们的服务，同时用于用户身份验证和预约确认。</p>
        <h4>3. 信息安全</h4>
        <p>我们采取合理的安全措施保护您的个人信息不被未经授权的访问、使用或披露。</p>
        <h4>4. 信息共享</h4>
        <p>除法律法规要求或经您同意外，我们不会与第三方共享您的个人信息。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="privacyVisible = false">关闭</el-button>
      </span>
    </el-dialog>
    
    <!-- 页脚 -->
    <!-- <FooterBar /> -->
  </div>
</template>

<script>
import { userApi } from '@/api/user';
import  deptApi  from '@/api/dept';
import FooterBar from '@/views/front/components/FooterBar.vue';

export default {
  name: 'Register',
  components: {
    FooterBar
  },
  data() {
    // 确认密码验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    
    // 邮箱验证
    const validateEmail = (rule, value, callback) => {
      const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (!emailRegex.test(value)) {
        callback(new Error('请输入有效的邮箱地址'));
      } else {
        callback();
      }
    };
    
    // 手机号验证
    const validatePhone = (rule, value, callback) => {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(value)) {
        callback(new Error('请输入有效的手机号码'));
      } else {
        callback();
      }
    };
    
    return {
      // 注册表单
      registerForm: {
        studentId:'',
        username: '',
        password: '',
        confirmPassword: '',
        realName: '',
        email: '',
        deptId: '',
        emailCode: '',
        phone: '',
        phoneCode: '',
        userType: 'student',
        captcha: '',
        agreement: false
      },
      // 学院列表
      departmentList: [],
      
      // 表单验证规则
      registerRules: {
        deptId: [
          { required: true, message: '请选择学院', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '姓名长度应在2到20个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        emailCode: [
          { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
          { len: 4, message: '邮箱验证码长度应为4位', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        phoneCode: [
          { required: true, message: '请输入手机验证码', trigger: 'blur' },
          { len: 6, message: '手机验证码长度应为6位', trigger: 'blur' }
        ],
        userType: [
          { required: true, message: '请选择用户类型', trigger: 'change' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 6, message: '验证码长度不正确', trigger: 'blur' }
        ],
        agreement: [
          { validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error('请阅读并同意用户协议和隐私政策'));
            } else {
              callback();
            }
          }, trigger: 'change' }
        ],
        studentId: [
          { required: true, message: '请输入学号', trigger: 'blur' },
          { min: 10, max: 10, message: '学号长度应为10位', trigger: 'blur' }
        ]
      },
      
      // 验证码URL
      captchaUrl: '',
      
      // 状态标志
      registering: false,
      sendingEmailCode: false,
      sendingPhoneCode: false,
      emailCodeSent: false,
      phoneCodeSent: false,
      emailCodeTimer: null,
      phoneCodeTimer: null,
      emailCodeCountdown: 60,
      phoneCodeCountdown: 60,
      
      // 对话框显示控制
      agreementVisible: false,
      privacyVisible: false
    };
  },
  
  computed: {
    // 邮箱是否有效
    isEmailValid() {
      const emailRegex = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      return emailRegex.test(this.registerForm.email);
    },
    
    // 手机号是否有效
    isPhoneValid() {
      const phoneRegex = /^1[3-9]\d{9}$/;
      return phoneRegex.test(this.registerForm.phone);
    }
  },
  
  created() {
    this.refreshCaptcha();
    this.getDepartmentList();

   
  },
  
  beforeDestroy() {
    // 清除定时器
    this.clearTimers();
  },
  
  methods: {
    // 获取学院列表
    getDepartmentList() {
      console.log('获取学院列表');
      deptApi.list().then(response => {
        if(response && response.code == 1){
          this.departmentList = response.data;
        }
      });
    },
    // 刷新验证码
    refreshCaptcha() {
      this.captchaUrl = '';
      const params = {
        type: 1
      };
      userApi.getCaptcha(params).then(response => {
        if (response && response.data) {
          this.captchaUrl = response.data;
        } else {
          this.$message.error('获取验证码失败');
        }
      }).catch(error => {
        console.error('获取验证码出错', error);
        this.$message.error('获取验证码出错');
      });
    },
    
    // 发送邮箱验证码
    sendEmailCode() {
      if (!this.isEmailValid) {
        this.$message.warning('请输入有效的邮箱地址');
        return;
      }
      
      this.sendingEmailCode = true;

      console.log('发送邮箱验证码', this.registerForm.email);
      const params = {
        email: this.registerForm.email,
        type: '0'
      };
      console.log('发送邮箱验证码参数', params);

      userApi.sendEmailCode(params).then(response => {
        this.sendingEmailCode = false;
        
        if (response && response.code == 1) {
          this.$message.success('验证码已发送到您的邮箱');
          this.startEmailCodeCountdown();
        } else {
          this.$message.error(response.msg || '发送验证码失败');
        }
      }).catch(error => {
        this.sendingEmailCode = false;
        console.error('发送邮箱验证码出错', error);
        this.$message.error('发送验证码出错，请稍后再试');
      });
    },
    
    // 发送手机验证码
    sendPhoneCode() {
      if (!this.isPhoneValid) {
        this.$message.warning('请输入有效的手机号码');
        return;
      }
      
      this.sendingPhoneCode = true;
      
      userApi.sendPhoneCode(this.registerForm.phone).then(response => {
        this.sendingPhoneCode = false;
        
        if (response && response.data) {
          this.$message.success('验证码已发送到您的手机');
          this.startPhoneCodeCountdown();
        } else {
          this.$message.error(response.msg || '发送验证码失败');
        }
      }).catch(error => {
        this.sendingPhoneCode = false;
        console.error('发送手机验证码出错', error);
        this.$message.error('发送验证码出错，请稍后再试');
      });
    },
    
    // 开始邮箱验证码倒计时
    startEmailCodeCountdown() {
      this.emailCodeSent = true;
      this.emailCodeCountdown = 60;
      
      this.emailCodeTimer = setInterval(() => {
        if (this.emailCodeCountdown > 0) {
          this.emailCodeCountdown--;
        } else {
          this.emailCodeSent = false;
          clearInterval(this.emailCodeTimer);
        }
      }, 1000);
    },
    
    // 开始手机验证码倒计时
    startPhoneCodeCountdown() {
      this.phoneCodeSent = true;
      this.phoneCodeCountdown = 60;
      
      this.phoneCodeTimer = setInterval(() => {
        if (this.phoneCodeCountdown > 0) {
          this.phoneCodeCountdown--;
        } else {
          this.phoneCodeSent = false;
          clearInterval(this.phoneCodeTimer);
        }
      }, 1000);
    },
    
    // 清除定时器
    clearTimers() {
      if (this.emailCodeTimer) {
        clearInterval(this.emailCodeTimer);
      }
      
      if (this.phoneCodeTimer) {
        clearInterval(this.phoneCodeTimer);
      }
    },
    
    // 处理注册
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (!valid) {
          return false;
        }
        
        this.registering = true;
        
        // 构建注册参数
        const registerParams = {
          username: this.registerForm.username,
          password: this.registerForm.password,
          realName: this.registerForm.realName,
          email: this.registerForm.email,
          emailCode: this.registerForm.emailCode,
          phone: this.registerForm.phone,
          phoneCode: this.registerForm.phoneCode,
          userType: this.registerForm.userType,
          captchaCode: this.registerForm.captcha,
          deptId: this.registerForm.deptId,
          studentId: this.registerForm.studentId
        };
        
        console.log('注册表单数据:', registerParams);
        
        userApi.register(registerParams).then(response => {
          this.registering = false;
          
          if (response && response.code == 1) {
            this.$message.success('注册成功，请登录');
            this.$router.push('/login');
          } else {
            this.refreshCaptcha();
            this.$message.error(response.msg || '注册失败');
          }
        }).catch(error => {
          this.registering = false;
          this.refreshCaptcha();
          console.error('注册出错', error);
          this.$message.error('注册出错，请稍后再试');
        });
      });
    },
    
    // 显示用户协议
    showAgreement() {
      this.agreementVisible = true;
    },
    
    // 显示隐私政策
    showPrivacy() {
      this.privacyVisible = true;
    }
  }
};
</script>

<style scoped>
.register-container {
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

.register-form-wrapper {
  width: 700px;
  padding: 25px 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.register-title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.register-form {
  width: 100%;
}

.register-form .el-form-item {
  margin-bottom: 15px;
}

.register-form .el-form-item__label {
  padding-bottom: 4px;
  line-height: 1.2;
}

.register-button {
  width: 100%;
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-img {
  height: 32px;
  margin-left: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.register-options {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.register-link {
  font-size: 14px;
  color: #409EFF;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

.code-input-group {
  display: flex;
  align-items: center;
}

.code-input-group .el-input {
  flex: 1;
  margin-right: 8px;
}

.code-input-group .el-button {
  min-width: 90px;
  padding: 7px 10px;
}

.agreement-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 0 10px;
}

.agreement-content h3 {
  text-align: center;
  margin-bottom: 15px;
}

.agreement-content h4 {
  margin-top: 12px;
  margin-bottom: 8px;
}

.agreement-content p {
  line-height: 1.5;
  margin-bottom: 8px;
  color: #606266;
}

.agreement-item {
  margin-top: 0;
  margin-bottom: 10px;
}

.register-btn-item {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .register-form-wrapper {
    width: 90%;
    padding: 20px;
  }
  
  .register-title {
    font-size: 22px;
    margin-bottom: 15px;
  }
}
</style> 