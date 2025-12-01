<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <!-- 左侧用户卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="user-card">
          <div class="user-avatar-container">
            <el-avatar :size="120" :src="userInfo.avatarUrl || defaultAvatar"></el-avatar>
            <div class="upload-avatar">
              <el-upload
                class="avatar-uploader"
                :action="baseURL+'/upload'"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarUploadSuccess"
              >
              <!-- :http-request="uploadAvatar" -->
                <el-button size="small" icon="el-icon-camera">更换头像</el-button>
              </el-upload>
            </div>
          </div>
          
          <div class="user-info">
            <h2>{{ userInfo.realName || userInfo.username }}</h2>
            <p class="user-role">
              <el-tag size="small" type="primary">{{ userTypeText }}</el-tag>
            </p>
            <p class="info-item">
              <i class="el-icon-user"></i> {{ userInfo.username }}
            </p>
            <p class="info-item" v-if="userInfo.departmentName">
              <i class="el-icon-office-building"></i> {{ userInfo.departmentName }}
            </p>
            <p class="info-item" v-if="userInfo.email">
              <i class="el-icon-message"></i> {{ userInfo.email }}
            </p>
            <p class="info-item" v-if="userInfo.phone">
              <i class="el-icon-mobile-phone"></i> {{ userInfo.phone }}
            </p>
            <p class="info-item" v-if="userInfo.lastLoginTime">
              <i class="el-icon-time"></i> 上次登录: {{ formatDateTime(userInfo.lastLoginTime) }}
            </p>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧信息编辑 -->
      <el-col :span="16">
        <el-tabs v-model="activeTab">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-card shadow="hover">
              <div slot="header" class="clearfix">
                <span>个人资料</span>
                <el-button 
                  style="float: right; padding: 3px 0" 
                  type="text"
                  @click="startEditing"
                  v-if="!editing"
                >
                  <i class="el-icon-edit"></i> 编辑
                </el-button>
              </div>
              
              <el-form 
                :model="userForm" 
                :rules="userRules" 
                ref="userForm" 
                label-width="100px"
                :disabled="!editing"
              >
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="userForm.username" disabled></el-input>
                </el-form-item>
                
                <el-form-item label="真实姓名" prop="realName">
                  <el-input v-model="userForm.realName"></el-input>
                </el-form-item>
                
                <el-form-item label="学号" prop="studentId" v-if="userInfo.userType === 'student'">
                  <el-input v-model="userForm.studentId"></el-input>
                </el-form-item>
                
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="userForm.email"></el-input>
                </el-form-item>
                
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="userForm.phone"></el-input>
                </el-form-item>
                
                <el-form-item v-if="editing">
                  <el-button type="primary" @click="saveUserInfo" :loading="saving">保存</el-button>
                  <el-button @click="cancelEdit">取消</el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
          
          <!-- 修改密码 -->
          <el-tab-pane label="修改密码" name="password">
            <el-card shadow="hover">
              <el-form 
                :model="passwordForm" 
                :rules="passwordRules" 
                ref="passwordForm" 
                label-width="100px"
              >
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input 
                    v-model="passwordForm.oldPassword" 
                    type="password" 
                    placeholder="请输入当前密码"
                    show-password
                  ></el-input>
                </el-form-item>
                
                <el-form-item label="新密码" prop="newPassword">
                  <el-input 
                    v-model="passwordForm.newPassword" 
                    type="password" 
                    placeholder="请输入新密码"
                    show-password
                  ></el-input>
                </el-form-item>
                
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input 
                    v-model="passwordForm.confirmPassword" 
                    type="password" 
                    placeholder="请再次输入新密码"
                    show-password
                  ></el-input>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="changePassword" :loading="changingPassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
          
          <!-- 账号安全 -->
          <el-tab-pane label="账号安全" name="security">
            <el-card shadow="hover">
              <el-form label-width="120px">
                <el-form-item label="账号状态">
                  <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'">
                    {{ userInfo.status === 1 ? '正常' : '禁用' }}
                  </el-tag>
                </el-form-item>
                
                <el-form-item label="登录保护">
                  <el-switch v-model="securitySettings.loginProtection"></el-switch>
                  <span class="setting-hint">开启后将会进行登录验证</span>
                </el-form-item>
                
                <el-form-item label="异地登录提醒">
                  <el-switch v-model="securitySettings.loginNotification"></el-switch>
                  <span class="setting-hint">开启后将通过邮件提醒异地登录</span>
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="saveSecuritySettings" :loading="savingSecurity">
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { userApi } from '@/api/user';

export default {
  name: 'UserProfile',
  data() {
    // 确认密码验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    
    return {
      // 默认头像
      defaultAvatar: require('@/assets/logo.png'),
      // 当前激活的选项卡
      activeTab: 'basic',
      // 是否正在编辑
      editing: false,
      // 是否正在保存
      saving: false,
      // 是否正在修改密码
      changingPassword: false,
      // 是否正在保存安全设置
      savingSecurity: false,
      
      // 用户信息
      userInfo: {},
      // 用户表单
      userForm: {
        id: '',
        username: '',
        realName: '',
        studentId: '',
        email: '',
        phone: '',
        departmentId: ''
      },
      // 密码表单
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      
      // 安全设置
      securitySettings: {
        loginProtection: false,
        loginNotification: false
      },
      
      // 用户表单验证规则
      userRules: {
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2到20个字符之间', trigger: 'blur' }
        ],
        studentId: [
          { required: false, message: '请输入学号', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
        ]
      },
      
      // 密码表单验证规则
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入当前密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    };
  },
  
  computed: {
    // 用户类型文本
    userTypeText() {
      const typeMap = {
        'admin': '管理员',
        'teacher': '教师',
        'student': '学生'
      };
      return typeMap[this.userInfo.userType] || this.userInfo.userType;
    }
  },
  
  created() {
    this.getUserInfo();
  },
  
  methods: {
    // 头像上传成功
    handleAvatarUploadSuccess(response,file) {
      this.userInfo.avatarUrl = response.data;
      // console.log(response.data);
      userApi.updateUserInfo(this.userInfo).then(response => {
        if (response && response.code === 1) {
          this.$message.success('头像上传成功');
        } else {
          this.$message.error(response.msg || '头像上传失败');
        }
      });
      
      localStorage.setItem('user', JSON.stringify(this.userInfo));
    },
    // 获取用户信息
    getUserInfo() {
      // 从localStorage中获取用户信息
      const userInfoStr = localStorage.getItem('user');
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr);
          this.userInfo = userInfo;
          this.initUserForm();
        } catch (error) {
          console.error('解析用户信息失败:', error);
        }
      }
      
      // 从API获取最新用户信息
      userApi.getUserById(this.userInfo.id).then(response => {
        if (response && response.code === 1) {
          this.userInfo = response.data;
          localStorage.setItem('user', JSON.stringify(this.userInfo));
          this.initUserForm();
        }
      }).catch(error => {
        console.error('获取用户信息失败:', error);
        this.$message.error('获取用户信息失败');
      });
    },
    
    // 初始化用户表单
    initUserForm() {
      this.userForm = {
        id: this.userInfo.id,
        username: this.userInfo.username,
        realName: this.userInfo.realName,
        studentId: this.userInfo.studentId,
        email: this.userInfo.email,
        phone: this.userInfo.phone,
        departmentId: this.userInfo.departmentId
      };
    },
    
    // 开始编辑
    startEditing() {
      this.editing = true;
    },
    
    // 取消编辑
    cancelEdit() {
      this.editing = false;
      this.initUserForm();
    },
    
    // 保存用户信息
    saveUserInfo() {
      this.$refs.userForm.validate(valid => {
        if (!valid) {
          return;
        }
        
        this.saving = true;
        
        userApi.updateUserInfo(this.userForm).then(response => {
          if (response && response.code === 1) {
            this.$message.success('保存成功');
            this.editing = false;
            this.getUserInfo(); // 刷新用户信息
          } else {
            this.$message.error(response.msg || '保存失败');
          }
        }).catch(error => {
          console.error('保存用户信息失败:', error);
          this.$message.error('保存失败，请稍后重试');
        }).finally(() => {
          this.saving = false;
        });
      });
    },
    
    // 修改密码
    changePassword() {
      this.$refs.passwordForm.validate(valid => {
        if (!valid) {
          return;
        }
        
        this.changingPassword = true;
        
        const data = {
          id: this.userInfo.id,
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword,
          againPassword: this.passwordForm.confirmPassword
        };
        
        userApi.changePassword(data).then(response => {
          if (response && response.code === 1) {
            this.$message.success('密码修改成功，请重新登录');
            this.passwordForm = {
              oldPassword: '',
              newPassword: '',
              confirmPassword: ''
            };
            
            // 清除登录信息
            setTimeout(() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userInfo');
              this.$router.push('/login');
            }, 1500);
          } else {
            this.$message.error(response.msg || '密码修改失败');
          }
        }).catch(error => {
          console.error('修改密码失败:', error);
          this.$message.error('修改密码失败，请稍后重试');
        }).finally(() => {
          this.changingPassword = false;
        });
      });
    },
    
    // 保存安全设置
    saveSecuritySettings() {
      this.savingSecurity = true;
      
      // 模拟API请求
      setTimeout(() => {
        this.$message.success('安全设置保存成功');
        this.savingSecurity = false;
      }, 1000);
    },
    
    // 头像上传前验证
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isJPG) {
        this.$message.error('上传头像图片只能是JPG或PNG格式!');
      }
      
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过2MB!');
      }
      
      return isJPG && isLt2M;
    },
    
    // 自定义上传头像
    uploadAvatar(option) {
      const formData = new FormData();
      formData.append('file', option.file);
      
      userApi.uploadAvatar(formData).then(response => {
        if (response && response.code === 1) {
          this.userInfo.avatarUrl = response.data;
          this.$message.success('头像上传成功');
          
          // 更新localStorage中的用户信息
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        } else {
          this.$message.error(response.msg || '头像上传失败');
        }
      }).catch(error => {
        console.error('上传头像失败:', error);
        this.$message.error('上传头像失败，请稍后重试');
      });
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      try {
        const date = new Date(dateTime);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
          date.getDate()
        ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
          date.getMinutes()
        ).padStart(2, '0')}`;
      } catch (error) {
        return dateTime;
      }
    }
  }
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.user-card {
  text-align: center;
  margin-bottom: 20px;
  height: calc(100% - 20px);
}

.user-avatar-container {
  margin: 20px 0;
}

.upload-avatar {
  margin-top: 10px;
}

.user-info {
  margin-top: 20px;
}

.user-info h2 {
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 500;
}

.user-role {
  margin-bottom: 15px;
}

.info-item {
  margin: 10px 0;
  text-align: left;
  padding-left: 40px;
  color: #606266;
}

.info-item i {
  margin-right: 8px;
}

.setting-hint {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.el-tabs {
  margin-bottom: 20px;
}

.el-card {
  margin-bottom: 20px;
}
</style> 