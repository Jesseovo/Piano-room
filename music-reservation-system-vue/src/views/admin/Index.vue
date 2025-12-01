<template>

  <div style="height: 100%;"> 

  <div class="app-container">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar-container">
      <div class="sidebar-logo">
        <i class="el-icon-school"></i>
        <span>琴房预约系统</span>
      </div>
      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
        router>
        <el-menu-item index="/admin/dashboard">
          <i class="el-icon-s-data"></i>
          <span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/admin/reservations">
          <i class="el-icon-date"></i>
          <span>预约管理</span>
        </el-menu-item>

        <el-submenu index="1">

          <template slot="title">
            <i class="el-icon-office-building"></i>
            <span>琴房相关</span>
          </template>

          <el-menu-item index="/admin/rooms">
          <i class="el-icon-office-building"></i>
          <span>琴房管理</span>
          </el-menu-item>


          <!-- 维修记录 -->
          <el-menu-item index="/admin/maintenance">
            <i class="el-icon-warning-outline"></i>
            <span slot="title">维修管理</span>
          </el-menu-item>

          <!-- 时长管理 -->
          <el-menu-item index="/admin/practiceDuration">
            <i class="el-icon-timer"></i>
            <span slot="title">时长管理</span>
          </el-menu-item>

          <!-- <el-menu-item index="/admin/roomTypes">
          <i class="el-icon-office-building"></i>
          <span>琴房类型管理</span>
          </el-menu-item>

          <el-menu-item index="/admin/buildings">
          <i class="el-icon-office-building"></i>
          <span>建筑管理</span>
          </el-menu-item> -->


        </el-submenu>

        <!-- 二级菜单 -->
        <el-submenu  index="2">
          <template slot="title">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item v-permission="['super_admin']" index="/admin/admins">
            <i class="el-icon-s-cooperation"></i>
            <span>管理员管理</span>
          </el-menu-item>
          
        </el-submenu>
        
        <!-- <el-menu-item index="/admin/users">
          <i class="el-icon-user"></i>
          <span>用户管理</span>
        </el-menu-item> -->
        <!-- <el-menu-item index="/admin/departments">
          <i class="el-icon-s-cooperation"></i>
          <span>院系管理</span>
        </el-menu-item> -->
        <el-menu-item index="/admin/statistics">
          <i class="el-icon-s-marketing"></i>
          <span>统计分析</span>
        </el-menu-item>
        <!-- 公告管理、留言反馈功能已移除 -->


        <!-- 二级菜单 -->
        <el-submenu index="3">
          <template slot="title">
            <i class="el-icon-setting"></i>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/admin/settings">
            <i class="el-icon-setting"></i>
            <span>系统设置</span>
          </el-menu-item>
          <el-menu-item index="/admin/operationLogs">
            <i class="el-icon-setting"></i>
            <span>操作日志</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header height="60px" class="main-header">
        <div class="header-left">
          <i class="el-icon-s-fold toggle-sidebar"></i>
        </div>
        <div class="header-right">
          <!-- <el-badge :value="3" class="notification-badge">
            <i class="el-icon-bell"></i>
          </el-badge> -->
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <i class="el-icon-user"></i>
              <span>管理员</span>
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">
                <i class="el-icon-user"></i> 个人信息
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <i class="el-icon-setting"></i> 系统设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="app-main">
        <transition name="fade-transform" mode="out-in">
          <router-view/>
        </transition>
        
        <!-- <div style="height: 10vh;">
          <FooterBar />
        </div>      -->
      </el-main>
    </el-container>


 </div>


   
  </div>
</template>

<script>
import FooterBar from '@/views/front/components/FooterBar'
export default {
  components: {
    FooterBar
  },
  name: 'AdminLayout',
  data() {
    return {
      // 可以添加你需要的数据
    }
  },
  methods: {
    // 处理下拉菜单命令
    handleCommand(command) {
      switch (command) {
        case 'profile':
          // 跳转到个人信息页面
          this.$router.push('/admin/profile');
          break;
        case 'settings':
          // 跳转到系统设置页面
          this.$router.push('/admin/settings');
          break;
        case 'logout':
          // 退出登录
          this.$confirm('确认退出登录?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            // 清除登录信息
            // localStorage.removeItem('token');
            // localStorage.removeItem('userInfo');
            this.$store.dispatch('logout');
            // 跳转到登录页
            this.$router.push('/login');
            this.$message.success('已安全退出登录');
          }).catch(() => {
            this.$message.info('已取消退出登录');
          });
          break;
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar-container {
  background-color: #304156;
  height: 100%;
  overflow: hidden;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.sidebar-logo i {
  margin-right: 8px;
  font-size: 22px;
}

.sidebar-menu {
  border-right: none;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-sidebar {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.header-right {
  display: flex;
  align-items: center;
}

.notification-badge {
  margin-right: 20px;
  cursor: pointer;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-dropdown i:first-child {
  margin-right: 5px;
  font-size: 18px;
}

.user-dropdown span {
  margin: 0 5px;
}

.app-main {
  background-color: #f0f2f5;
  height: calc(100vh - 60px);
  overflow: auto;
  padding: 20px;
  position: relative;
}

/* 过渡动画 */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>


