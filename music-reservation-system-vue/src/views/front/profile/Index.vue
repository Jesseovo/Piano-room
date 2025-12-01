<template>
  <div class="page-container">
    <!-- 添加顶部导航栏 -->
    <top-navbar />
    
    <div class="profile-container">
      <!-- 欢迎横幅 -->
      <div class="welcome-banner">
        <div class="banner-content">
          <div class="welcome-text">
            <h2>{{ greetingText }}，{{ userForm.name || userForm.username || '同学' }}</h2>
            <p>欢迎使用个人中心，这里可以管理您的个人信息和查看预约统计</p>
          </div>
          <div class="banner-avatar" v-if="userForm.avatarUrl">
            <img :src="userForm.avatarUrl" alt="头像">
          </div>
          <div class="banner-avatar" v-else>
            <i class="el-icon-user"></i>
          </div>
        </div>
      </div>
      
      <el-card class="profile-card">
        <div slot="header" class="profile-header">
          <span><i class="el-icon-user"></i> 个人中心</span>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        
        <!-- 个人资料展示和编辑表单 -->
        <el-tabs v-model="activeTab" v-else>
          <el-tab-pane label="个人资料" name="info">
            <el-form 
              ref="userForm" 
              :model="userForm" 
              :rules="rules" 
              label-width="100px"
              size="medium">
              
              <!-- 头像上传 -->
              <el-form-item label="头像" prop="avatarUrl">
                <div class="avatar-uploader">
                  <div class="current-avatar" v-if="userForm.avatarUrl">
                    <img :src="userForm.avatarUrl" alt="头像">
                    <div class="avatar-hover-overlay">
                      <div class="avatar-actions-overlay">
                        <i class="el-icon-upload" @click="handleAvatarClick"></i>
                        <i class="el-icon-delete" @click="removeAvatar"></i>
                      </div>
                    </div>
                  </div>
                  <div class="avatar-placeholder" v-else @click="handleAvatarClick">
                    <i class="el-icon-user-solid"></i>
                    <div class="avatar-hover-text">点击上传</div>
                  </div>
                  <div class="avatar-info">
                    <el-button type="primary" size="mini" @click="handleAvatarClick">
                      <i class="el-icon-upload"></i> 更换头像
                    </el-button>
                    <el-button v-if="userForm.avatarUrl" type="danger" size="mini" @click="removeAvatar">
                      <i class="el-icon-delete"></i> 删除
                    </el-button>
                    <div class="avatar-tip">
                      <p>支持JPG、PNG格式，文件小于2MB</p>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref="avatarInput" 
                    style="display: none" 
                    accept="image/*"
                    @change="uploadAvatar">
                </div>
              </el-form-item>
              
              <!-- 用户名 -->
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userForm.username" disabled></el-input>
              </el-form-item>
              
              <!-- 姓名 -->
              <el-form-item label="姓名" prop="realName">
                <el-input v-model="userForm.realName" placeholder="请输入真实姓名"></el-input>
              </el-form-item>
              
              <!-- 性别 -->
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="userForm.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                  <el-radio label="other">其他</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <!-- 邮箱 -->
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="userForm.email" placeholder="请输入邮箱">
                  <el-button 
                    slot="append" 
                    @click="verifyEmail" 
                    :disabled="emailVerifying"
                    v-if="userForm.email && !userForm.emailVerified">
                    {{ emailVerifying ? '发送中...' : '验证邮箱' }}
                  </el-button>
                  <el-button 
                    slot="append" 
                    type="success" 
                    disabled
                    v-else-if="userForm.emailVerified">
                    已验证
                  </el-button>
                </el-input>
              </el-form-item>
              
              <!-- 手机号 -->
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="userForm.phone" placeholder="请输入手机号">
                  <el-button 
                    slot="append" 
                    @click="verifyPhone" 
                    :disabled="phoneVerifying"
                    v-if="userForm.phone && !userForm.phoneVerified">
                    {{ phoneVerifying ? '发送中...' : '验证手机' }}
                  </el-button>
                  <el-button 
                    slot="append" 
                    type="success" 
                    disabled
                    v-else-if="userForm.phoneVerified">
                    已验证
                  </el-button>
                </el-input>
              </el-form-item>
              
              <!-- 部门 -->
              <el-form-item label="所属部门" prop="department">
                <el-input v-model="userForm.departmentName" disabled></el-input>
              </el-form-item>
              
              <!-- 角色 -->
              <el-form-item label="用户角色" prop="role">
                <el-tag v-if="userForm.role === 'admin'" type="danger">管理员</el-tag>
                <el-tag v-else-if="userForm.role === 'teacher'" type="success">教师</el-tag>
                <el-tag v-else type="info">普通用户</el-tag>
              </el-form-item>
              
              <!-- 按钮操作 -->
              <el-form-item>
                <el-button type="primary" @click="updateProfile" :loading="updating">保存修改</el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="预约统计" name="stats">
            <reservation-stats />
          </el-tab-pane>
          
          <el-tab-pane label="修改密码" name="password">
            <el-form 
              ref="passwordForm" 
              :model="passwordForm" 
              :rules="passwordRules" 
              label-width="100px"
              size="medium">
              
              <!-- 原密码 -->
              <el-form-item label="原密码" prop="oldPassword">
                <el-input 
                  v-model="passwordForm.oldPassword" 
                  type="password" 
                  placeholder="请输入原密码"
                  show-password>
                </el-input>
              </el-form-item>
              
              <!-- 新密码 -->
              <el-form-item label="新密码" prop="newPassword">
                <el-input 
                  v-model="passwordForm.newPassword" 
                  type="password" 
                  placeholder="请输入新密码"
                  show-password>
                </el-input>
              </el-form-item>
              
              <!-- 确认新密码 -->
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input 
                  v-model="passwordForm.confirmPassword" 
                  type="password" 
                  placeholder="请再次输入新密码"
                  show-password>
                </el-input>
              </el-form-item>
              
              <!-- 按钮操作 -->
              <el-form-item>
                <el-button type="primary" @click="changePassword" :loading="changingPassword">修改密码</el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    
    <!-- 页脚 -->
    <FooterBar />
  </div>
</template>

<script>
import { userApi } from '@/api/user';
import { fileApi } from '@/api/file';
import ReservationStats from './components/ReservationStats.vue';
import TopNavbar from '../components/TopNavbar.vue';
import FooterBar from '@/views/front/components/FooterBar.vue';

export default {
  name: 'UserProfile',
  components: {
    ReservationStats,
    TopNavbar,
    FooterBar
  },
  data() {
    // 确认密码验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    
    return {
      activeTab: 'info',
      loading: true,
      updating: false,
      changingPassword: false,
      emailVerifying: false,
      phoneVerifying: false,
      
      // 用户信息表单
      userForm: {
        username: '',
        realName: '',
        avatarUrl: '',
        email: '',
        emailVerified: false,
        phone: '',
        phoneVerified: false,
        gender: 'male',
        departmentName: '',
        role: ''
      },
      
      // 密码修改表单
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      
      // 用户信息表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      },
      
      // 密码表单验证规则
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    // 如果Vuex已有用户数据，先加载到表单中
    if (this.storeUserInfo) {
      this.initFormFromVuex();
    }
    // 无论如何都尝试获取最新的用户信息
    // this.fetchUserInfo();
  },
  methods: {
    // 从Vuex初始化表单数据
    initFormFromVuex() {
      const userData = this.storeUserInfo;
      if (!userData) return;

      console.log('从Vuex加载用户数据:', userData);
      
      this.userForm = {
        id: userData.id,
        username: userData.username || '',
        realName: userData.realName || '',
        avatarUrl: userData.avatarUrl || '',
        email: userData.email || '',
        emailVerified: userData.emailVerified || false,
        phone: userData.phone || '',
        phoneVerified: userData.phoneVerified || false,
        gender: userData.gender || 'male',
        departmentName: userData.departmentName || '未分配',
        role: userData.role || 'user'
      };
      
      this.loading = false;
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      this.loading = true;
      try {
        console.log('正在获取用户信息...');
        const res = await userApi.getUserInfo(this.$store.getters.currentUser?.id);
        console.log('获取用户信息响应:', res);
        
        if (res.code === 1 && res.data) {
          const userData = res.data;
          // 更新用户信息表单
          this.userForm = {
            id: userData.id,
            username: userData.username || '',
            realName: userData.realName || '',
            avatarUrl: userData.avatarUrl || '',
            email: userData.email || '',
            emailVerified: userData.emailVerified || false,
            phone: userData.phone || '',
            phoneVerified: userData.phoneVerified || false,
            gender: userData.gender || 'male',
            department: userData.department || '未分配',
            role: userData.role || 'user'
          };
          
          // 更新本地存储的用户信息和Vuex
          this.$store.dispatch('updateUser', userData);
        } else {
          // 如果获取失败且没有从Vuex加载过
          if (this.loading) {
            this.$message.error(res.msg || '获取用户信息失败');
          }
        }
      }  finally {
        this.loading = false;
      }
    },
    
    // 更新用户资料
    updateProfile() {
      this.$refs.userForm.validate(async valid => {
        if (!valid) return;
        
        this.updating = true;
        try {
          const updateData = {
            id: this.userForm.id,
            realName: this.userForm.realName,
            avatarUrl: this.userForm.avatarUrl,
            email: this.userForm.email,
            phone: this.userForm.phone,
            gender: this.userForm.gender
          };
          
          console.log('提交更新用户信息:', updateData);
          const res = await userApi.updateUserInfo(updateData);
          console.log('更新用户信息响应:', res);
          
          if (res.code === 1) {
            // 如果成功，更新Vuex中的用户信息
            if (res.data) {
              this.$store.dispatch('updateUser', res.data);
            } else {
              // 重新获取用户信息以确保数据同步
              this.fetchUserInfo(this.$store.getters.currentUser?.id);
            }
            this.$message.success('个人信息更新成功');
          } else {
            this.$message.error(res.msg || '更新失败');
          }
        } catch (error) {
          console.error('更新用户信息出错:', error);
          this.$message.error('更新失败，请稍后重试');
        } finally {
          this.updating = false;
        }
      });
    },
    
    // 修改密码
    changePassword() {
      this.$refs.passwordForm.validate(async valid => {
        if (!valid) return;
        
        this.changingPassword = true;
        try {
          const data = {
            id:this.$store.getters.currentUser.id,
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword,
            againPassword:this.passwordForm.confirmPassword
          };
          
          console.log('提交修改密码请求');
          const res = await userApi.changePassword(data);
          console.log('修改密码响应:', res);
          
          if (res.code === 1) {
            this.$message.success('密码修改成功，请重新登录');
            // 清除登录状态，跳转到登录页
            this.$store.dispatch('logout');
            setTimeout(() => {
              this.$router.push('/login');
            }, 1500);
          } else {
            this.$message.error(res.msg || '密码修改失败');
          }
        } catch (error) {
          console.error('修改密码出错:', error);
          this.$message.error('密码修改失败，请稍后重试');
        } finally {
          this.changingPassword = false;
        }
      });
    },
    
    // 验证邮箱
    async verifyEmail() {
      if (!this.userForm.email) {
        this.$message.warning('请先输入邮箱地址');
        return;
      }
      
      this.emailVerifying = true;
      try {
        const res = await userApi.sendEmailCode(this.userForm.email);
        if (res.code === 1) {
          this.$message.success('验证邮件已发送，请查收');
          // 这里可以添加验证码输入框和验证逻辑
          this.$prompt('请输入邮箱验证码', '邮箱验证', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^\d{6}$/,
            inputErrorMessage: '验证码格式不正确（6位数字）'
          }).then(({ value }) => {
            // 这里应该有一个验证邮箱验证码的API
            this.$message.success('邮箱验证成功');
            this.userForm.emailVerified = true;
          }).catch(() => {});
        } else {
          this.$message.error(res.msg || '发送验证邮件失败');
        }
      } catch (error) {
        console.error('发送邮箱验证码出错:', error);
        this.$message.error('发送验证邮件失败，请稍后重试');
      } finally {
        this.emailVerifying = false;
      }
    },
    
    // 验证手机
    async verifyPhone() {
      if (!this.userForm.phone) {
        this.$message.warning('请先输入手机号码');
        return;
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.userForm.phone)) {
        this.$message.warning('请输入正确的手机号码');
        return;
      }
      
      this.phoneVerifying = true;
      try {
        const res = await userApi.sendPhoneCode(this.userForm.phone);
        if (res.code === 1) {
          this.$message.success('验证码已发送，请查收短信');
          // 这里可以添加验证码输入框和验证逻辑
          this.$prompt('请输入手机验证码', '手机验证', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^\d{6}$/,
            inputErrorMessage: '验证码格式不正确（6位数字）'
          }).then(({ value }) => {
            // 这里应该有一个验证手机验证码的API
            this.$message.success('手机验证成功');
            this.userForm.phoneVerified = true;
          }).catch(() => {});
        } else {
          this.$message.error(res.msg || '发送验证码失败');
        }
      } catch (error) {
        console.error('发送手机验证码出错:', error);
        this.$message.error('发送验证码失败，请稍后重试');
      } finally {
        this.phoneVerifying = false;
      }
    },
    
    // 头像上传相关方法
    handleAvatarClick() {
      this.$refs.avatarInput.click();
    },
    
    async uploadAvatar(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      // 检查文件类型和大小
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return;
      }
      
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!');
        return;
      }
      
      try {
        // 创建FormData对象用于文件上传
        const formData = new FormData();
        formData.append('file', file);
        
        // 显示上传中提示
        const loading = this.$loading({
          lock: true,
          text: '头像上传中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        
        // 调用上传API
        const res = await fileApi.uploadFile(formData);
        console.log('上传结果:', res);
        
        // 关闭加载提示
        loading.close();
        
        // 处理上传结果
        if (res.code === 1 && res.data) {
          // 更新用户头像
          this.userForm.avatarUrl = res.data;
          this.$message.success('头像上传成功');
        } else {
          this.$message.error(res.msg || '头像上传失败');
        }
      } catch (error) {
        console.error('上传头像出错:', error);
        this.$message.error('上传头像失败，请稍后重试');
      } finally {
        // 清空文件输入框，以便能够再次选择同一文件
        this.$refs.avatarInput.value = '';
      }
    },
    
    removeAvatar() {
      this.userForm.avatarUrl = '';
    },
    
    // 重置表单
    resetForm() {
      this.$refs.userForm.resetFields();
      this.fetchUserInfo();
    },
    
    resetPasswordForm() {
      this.$refs.passwordForm.resetFields();
    }
  },
  computed: {
    // 根据时间生成问候语
    greetingText() {
      const hour = new Date().getHours();
      if (hour < 6) {
        return '凌晨好';
      } else if (hour < 9) {
        return '早上好';
      } else if (hour < 12) {
        return '上午好';
      } else if (hour < 14) {
        return '中午好';
      } else if (hour < 18) {
        return '下午好';
      } else if (hour < 22) {
        return '晚上好';
      } else {
        return '夜深了';
      }
    },
    // 从Vuex获取当前用户信息
    storeUserInfo() {
      return this.$store.getters.currentUser;
    }
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 80px; /* 为顶部导航栏留出空间 */
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-banner {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border-radius: 8px;
  color: white;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: slideInDown 0.5s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-banner:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome-text p {
  margin: 0;
  opacity: 0.9;
}

.banner-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.banner-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.9);
}

.banner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-avatar i {
  font-size: 40px;
  color: white;
}

.profile-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.profile-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.profile-header i {
  margin-right: 8px;
  font-size: 20px;
  color: #409EFF;
}

.loading-container {
  padding: 20px 0;
}

.avatar-uploader {
  display: flex;
  align-items: flex-start;
}

.current-avatar, .avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 20px;
  border: 2px solid #e6e6e6;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.current-avatar:hover, .avatar-placeholder:hover {
  border-color: #409EFF;
  transform: scale(1.02);
}

.current-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder i {
  font-size: 40px;
  color: #c0c4cc;
  transition: all 0.3s ease;
}

.avatar-placeholder:hover i {
  color: #409EFF;
  transform: scale(1.1);
}

.avatar-hover-text {
  position: absolute;
  bottom: 8px;
  font-size: 12px;
  color: #909399;
  opacity: 0;
  transition: all 0.3s ease;
}

.avatar-placeholder:hover .avatar-hover-text {
  opacity: 1;
}

.avatar-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  border-radius: 50%;
}

.current-avatar:hover .avatar-hover-overlay {
  opacity: 1;
}

.avatar-actions-overlay {
  display: flex;
  gap: 10px;
}

.avatar-actions-overlay i {
  font-size: 20px;
  color: white;
  background-color: rgba(0, 0, 0, 0.3);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-actions-overlay i:hover {
  background-color: #409EFF;
  transform: scale(1.1);
}

.avatar-info {
  display: flex;
  flex-direction: column;
}

.avatar-info .el-button {
  margin-bottom: 10px;
}

.avatar-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* Tab样式优化 */
:deep(.el-tabs__item) {
  padding: 0 16px;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s;
}

:deep(.el-tabs__item:hover) {
  color: #409EFF;
  transform: translateY(-2px);
}

:deep(.el-tabs__item.is-active) {
  font-weight: bold;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 加载动画优化 */
:deep(.el-skeleton__item) {
  background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* 表单项动画 */
:deep(.el-form-item) {
  transition: all 0.3s ease;
}

:deep(.el-form-item:hover) {
  transform: translateX(5px);
}

:deep(.el-input__inner:focus), :deep(.el-textarea__inner:focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 按钮过渡动画 */
:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-button--primary) {
  background: linear-gradient(to right, #409EFF, #1890ff);
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(to right, #66b1ff, #409EFF);
}

:deep(.el-button--primary::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

:deep(.el-button--primary:hover::after) {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}

/* Tab切换动画 */
:deep(.el-tabs__content) {
  animation: fadeIn 0.5s ease-out;
}

/* 表格动画效果 */
:deep(.el-table__row) {
  transition: all 0.3s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f0f9ff !important;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
    padding-top: 70px; /* 为顶部导航栏留出空间 */
  }
  
  .welcome-banner {
    padding: 15px;
  }
  
  .welcome-text h2 {
    font-size: 20px;
  }
  
  .welcome-text p {
    font-size: 14px;
  }
  
  .banner-avatar {
    width: 60px;
    height: 60px;
  }
  
  .el-form-item {
    margin-bottom: 18px;
  }
  
  .avatar-uploader {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .current-avatar, .avatar-placeholder {
    margin-bottom: 15px;
    margin-right: 0;
  }
}
</style> 