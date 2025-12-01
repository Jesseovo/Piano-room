<template>
  <div class="navbar-container">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#409EFF"
      text-color="#fff"
      active-text-color="#ffd04b"
      router>
      
      <!-- 品牌Logo -->
      <div class="brand-container">
        <router-link to="/" class="brand-link">
          <i class="el-icon-school"></i>
          <span class="brand-title">琴房预约系统</span>
        </router-link>
      </div>
      
      <!-- 导航菜单项 -->
      <el-menu-item index="/">
        <i class="el-icon-s-home"></i>首页
      </el-menu-item>
      
      <el-menu-item index="/rooms">
        <i class="el-icon-date"></i>琴房预约
      </el-menu-item>
      
      <el-menu-item  @click="myReservations">
        <i class="el-icon-document-checked" ></i>我的预约
      </el-menu-item>
      
      <!-- 更多下拉菜单 -->
      <el-submenu index="more">
        <template slot="title">
          <i class="el-icon-info"></i>更多
        </template>
        <el-menu-item index="/help">
          <i class="el-icon-question"></i>帮助中心
        </el-menu-item>
        <el-menu-item index="/about">
          <i class="el-icon-office-building"></i>关于我们
        </el-menu-item>
      </el-submenu>
      
      <!-- 用户操作区域 -->
      <div class="user-container">
        <template v-if="!isLoggedIn">
          <el-button 
            type="text"
            class="login-btn"
            @click="$router.push('/login')">
            <i class="el-icon-right"></i>登录
          </el-button>
          <!-- 注册功能已移除 -->
        </template>
        <template v-else>
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-avatar-wrapper">
              <div class="user-avatar" v-if="userInfo.avatarUrl">
                <img :src="userInfo.avatarUrl" alt="头像">
              </div>
              <div class="user-avatar" v-else>
                <i class="el-icon-user"></i>
              </div>
              <span class="username">{{ userInfo.name || userInfo.username }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">
                <i class="el-icon-user"></i>个人信息
              </el-dropdown-item>
              <el-dropdown-item command="my-reservations">
                <i class="el-icon-document-checked"></i>我的预约
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <i class="el-icon-switch-button"></i>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </div>
    </el-menu>

  </div>
</template>

<script>
export default {
  name: 'TopNavbar',
  data() {
    return {
      activeIndex: '/',
      // 反馈功能已移除
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    userInfo() {
      return this.$store.getters.currentUser || {};
    }
  },
  watch: {
    $route(to) {
      this.activeIndex = to.path;
    }
  },
  created() {
    this.activeIndex = this.$route.path;
    if (this.isLoggedIn && !this.userInfo.username) {
      this.fetchUserInfo();
    }
  },
  methods: {
    myReservations(){
      if(!this.$store.getters.isLoggedIn){
        this.$message.error('请先登录')
        return
      }
      this.$router.push('/my-reservations')
    },
    async fetchUserInfo() {
      try {
        const { userApi } = await import('@/api/user');
        const res = await userApi.getUserInfo();
        if (res.code === 1 && res.data) {
          this.$store.dispatch('updateUser', res.data);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    handleUserCommand(command) {
      if (command === 'logout') {
        this.handleLogout();
      } else if (command === 'profile') {
        this.navigateTo('/profile');
      } else if (command === 'my-reservations') {
        this.navigateTo('/my-reservations');
      }
    },
    navigateTo(path) {
      if (this.$route.path === path) {
        return;
      }
      this.$router.push(path).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error('导航错误:', err);
        }
      });
    },
    handleLogout() {
      this.$confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('logout');
        this.$message.success('已成功退出登录')
        const currentPath = this.$route.path
        const needLoginPaths = ['/profile', '/my-reservations']
        if (needLoginPaths.includes(currentPath)) {
          this.$router.push('/')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.navbar-container {
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.el-menu-demo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 20px;
}

.brand-container {
  height: 60px;
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
}

.brand-link i {
  font-size: 24px;
  margin-right: 8px;
}

.brand-title {
  font-size: 18px;
  font-weight: bold;
}

.user-container {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.login-btn {
  color: #fff;
  border: 1px solid #fff;
  margin-right: 10px;
  padding: 8px 15px;
}

.register-btn {
  background-color: #fff;
  color: #409EFF;
  border: none;
  padding: 8px 15px;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  overflow: hidden;
}

.user-avatar i {
  color: #fff;
  font-size: 20px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.username {
  color: #fff;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 5px;
}

.el-icon--right {
  color: #fff;
}

/* 覆盖Element-UI菜单样式 */
:deep(.el-menu--horizontal > .el-menu-item) {
  height: 60px;
  line-height: 60px;
}

:deep(.el-menu--horizontal > .el-submenu .el-submenu__title) {
  height: 60px;
  line-height: 60px;
}

@media (max-width: 992px) {
  .el-menu-demo {
    flex-wrap: wrap;
    padding: 0 10px;
  }
  
  .brand-container {
    width: 100%;
    margin-right: 0;
    justify-content: center;
  }
  
  .user-container {
    width: 100%;
    justify-content: center;
    margin: 10px 0;
  }
}
</style> 