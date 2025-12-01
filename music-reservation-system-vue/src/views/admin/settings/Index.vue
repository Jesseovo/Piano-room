<template>
  <div class="settings-container">
    <h2 class="page-title">系统设置</h2>

    <!-- 设置选项卡 -->
    <el-card shadow="hover" class="settings-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <div class="tab-header">
            <i class="el-icon-setting"></i>
            <span>基本设置</span>
          </div>
          <basic-settings ref="basicSettings" />
        </el-tab-pane>
<!--         
        <el-tab-pane label="预约设置" name="reservation">
          <div class="tab-header">
            <i class="el-icon-date"></i>
            <span>预约设置</span>
          </div>
          <reservation-settings ref="reservationSettings" />
        </el-tab-pane>
        
        <el-tab-pane label="通知设置" name="notification">
          <div class="tab-header">
            <i class="el-icon-bell"></i>
            <span>通知设置</span>
          </div>
          <notification-settings ref="notificationSettings" />
        </el-tab-pane>
        
        <el-tab-pane label="安全设置" name="security">
          <div class="tab-header">
            <i class="el-icon-lock"></i>
            <span>安全设置</span>
          </div>
          <security-settings ref="securitySettings" />
        </el-tab-pane> -->
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import BasicSettings from './components/BasicSettings.vue'
import ReservationSettings from './components/ReservationSettings.vue'
import NotificationSettings from './components/NotificationSettings.vue'
import SecuritySettings from './components/SecuritySettings.vue'

export default {
  name: 'Settings',
  components: {
    BasicSettings,
    ReservationSettings,
    NotificationSettings,
    SecuritySettings
  },
  data() {
    return {
      activeTab: 'basic',
      loading: false
    }
  },
  watch: {
    // 监听URL参数变化
    '$route.query.tab'(newVal) {
      if (newVal && ['basic', 'reservation', 'notification', 'security'].includes(newVal)) {
        this.activeTab = newVal
      }
    },
    // 监听标签页变化，更新URL
    activeTab(newVal) {
      this.$router.push({
        query: { ...this.$route.query, tab: newVal }
      }).catch(err => {
        // 忽略重复导航错误
        if (err.name !== 'NavigationDuplicated') {
          throw err
        }
      })
    }
  },
  mounted() {
    // 从URL中获取标签页参数
    const { tab } = this.$route.query
    if (tab && ['basic', 'reservation', 'notification', 'security'].includes(tab)) {
      this.activeTab = tab
    }
  },
  methods: {
    // 保存当前标签页的设置
    saveCurrentTab() {
      const refs = {
        basic: 'basicSettings',
        reservation: 'reservationSettings',
        notification: 'notificationSettings',
        security: 'securitySettings'
      }
      
      const currentRef = refs[this.activeTab]
      if (currentRef && this.$refs[currentRef]) {
        this.$refs[currentRef].saveSettings()
      }
    }
  }
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.tab-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.tab-header i {
  margin-right: 8px;
  font-size: 18px;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  padding: 0 16px;
  height: 40px;
  line-height: 40px;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}
</style> 