<template>
  <div class="login-container">
    <!-- 返回首页按钮 -->
    <div class="back-to-home">
      <el-button type="text" icon="el-icon-back" @click="goToHome">返回首页</el-button>
    </div>
    
    <div class="login-form-wrapper">
      <!-- logo -->
      <div v-if="logo" class="login-logo">
        <el-image :src="logo" fit="contain" />
      </div>
      <h2 class="login-title">琴房预约系统</h2>
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginForm"
        class="login-form"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-user"
            placeholder="请输入用户名"
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="el-icon-lock"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
            @keyup.enter.native="handleLogin"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              prefix-icon="el-icon-key"
              placeholder="请输入验证码"
              clearable
              @keyup.enter.native="handleLogin"
            ></el-input>
            <img :src="captchaUrl" alt="验证码" class="captcha-img" @click="refreshCaptcha" />
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >登录</el-button>
        </el-form-item>
        
        <div class="login-options">
          <!-- 注册账号入口已移除 -->
          <router-link to="/reset-password" class="login-link">忘记密码</router-link>
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
import { settingsApi } from '@/api/settings';

export default {
  name: 'Login',
  components: {
    FooterBar
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        captcha: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度应在6到20个字符之间', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 6, message: '验证码长度不正确', trigger: 'blur' }
        ]
      },
      captchaUrl: '',
      loading: false,
      logo: ''
    };
  },
  created() {
    this.getBaseSetting();
    this.refreshCaptcha();
  },
  methods: {
    // 返回首页
    goToHome() {
      this.$router.push('/');
    },
    // 获取基础设置
    getBaseSetting() {
      settingsApi.getBasicSettings().then(response => {
        if (response && response.code == 1 && response.data) {
          const data = response.data;
          if(data.logo){
            this.logo = data.logo;
          }
        }
      }).catch(error => {
        console.error('获取基础设置失败', error);
      });
    },
    // 刷新验证码
    refreshCaptcha() {
      this.captchaUrl = '';
      const params = {
        type: '0'
      };
      userApi.getCaptcha(params).then(response => {
        if (response && response.code === 1) {
          this.captchaUrl = response.data;
        } else {
          this.$message.error((response && response.msg) || '获取验证码失败');
        }
      }).catch(error => {
        console.error('获取验证码出错', error);
        this.$message.error('获取验证码出错');
      });
    },
    
    // 处理登录
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          return false;
        }
        
        this.loading = true;
        
        userApi.login(this.loginForm).then(response => {
          this.loading = false;
          console.log(response);
          
          if (response && response.code == 1) {
            const data = response.data || {};

            // 检查必要的数据是否存在
            if (!data.token || !data.user) {
              this.$message.error('登录成功但获取用户数据失败，请联系管理员');
              return;
            }

            // 存储token和用户信息到Vuex
            this.$store.dispatch('saveAuth', {
              token: data.token,
              user: data.user
            });
            
            // 根据用户角色跳转到不同页面
            if (data.user.userType == 'admin' || data.user.userType == 'super_admin') {
              this.$router.push('/admin');
            } else {
              // 如果有重定向参数，则跳转到该页面
              const redirect = this.$route.query.redirect;
              if (redirect) {
                this.$router.push(redirect);
              } else {
                this.$router.push('/');
              }
            }

            this.$message.success('登录成功');
          } else {
            this.refreshCaptcha();
            this.$message.error((response && response.msg) || '登录失败');
          }
        }).catch(error => {
          this.loading = false;
          this.refreshCaptcha();
          console.error('登录出错', error);
          this.$message.error('登录出错，请稍后再试');
        });
      });
    }
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('@/assets/images/login-bg.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}

.back-to-home {
  position: absolute;
  top: 20px;
  left: 20px;
}

.back-to-home .el-button {
  font-size: 16px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 8px 15px;
  border-radius: 20px;
  transition: all 0.3s;
}

.back-to-home .el-button:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

.login-form-wrapper {
  width: 380px;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.login-logo .el-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
}

.login-title {
  font-size: 26px;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-img {
  height: 40px;
  margin-left: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.login-link {
  font-size: 14px;
  color: #409EFF;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style> 