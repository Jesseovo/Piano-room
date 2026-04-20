<template>
  <div class="admin-layout">
    <!-- 侧边栏 - Y2K 风格 -->
    <aside class="y2k-aside" :class="{ collapsed: isCollapsed }">
      <!-- 品牌 Logo -->
      <div class="aside-brand">
        <img src="@/assets/logo.png" alt="logo" class="brand-logo" />
        <span v-if="!isCollapsed" class="brand-name">皮埃诺·管理台</span>
        <span v-if="!isCollapsed" class="brand-blink">_</span>
      </div>

      <!-- 导航菜单 -->
      <el-scrollbar class="aside-scroll">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          router
          class="y2k-admin-menu"
          :collapse-transition="false"
        >
          <el-menu-item index="/admin/dashboard" @mouseenter="playHover">
            <el-icon><Odometer /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>

          <el-menu-item index="/admin/rooms" @mouseenter="playHover">
            <el-icon><House /></el-icon>
            <template #title>琴房管理</template>
          </el-menu-item>

          <el-menu-item index="/admin/reservations" @mouseenter="playHover">
            <el-icon><Calendar /></el-icon>
            <template #title>预约管理</template>
          </el-menu-item>

          <el-menu-item index="/admin/users" @mouseenter="playHover">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>

          <el-menu-item index="/admin/statistics" @mouseenter="playHover">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>数据统计</template>
          </el-menu-item>

          <el-menu-item index="/admin/maintenance" @mouseenter="playHover">
            <el-icon><Tools /></el-icon>
            <template #title>维修管理</template>
          </el-menu-item>

          <el-menu-item index="/admin/practice-duration" @mouseenter="playHover">
            <el-icon><Timer /></el-icon>
            <template #title>时长管理</template>
          </el-menu-item>

          <el-menu-item index="/admin/operation-logs" @mouseenter="playHover">
            <el-icon><Document /></el-icon>
            <template #title>操作日志</template>
          </el-menu-item>

          <el-menu-item v-if="authStore.isSuperAdmin" index="/admin/admins" @mouseenter="playHover">
            <el-icon><UserFilled /></el-icon>
            <template #title>管理员管理</template>
          </el-menu-item>

          <div class="menu-sep"></div>

          <el-menu-item index="/admin/settings" @mouseenter="playHover">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>

          <el-menu-item index="/admin/profile" @mouseenter="playHover">
            <el-icon><Avatar /></el-icon>
            <template #title>个人中心</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>

      <!-- 侧边栏底部 -->
      <div class="aside-footer" v-if="!isCollapsed">
        <span class="aside-footer-text">♪ Y2K EDITION ♪</span>
      </div>
    </aside>

    <!-- 主体区域 -->
    <div class="admin-main-wrap">
      <!-- 顶栏 -->
      <header class="y2k-topbar">
        <div class="topbar-left">
          <button class="y2k-collapse-btn" @click="isCollapsed = !isCollapsed" @mouseenter="playHover">
            <el-icon size="20"><component :is="isCollapsed ? 'Expand' : 'Fold'" /></el-icon>
          </button>
          <el-breadcrumb separator="›" class="y2k-breadcrumb">
            <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="topbar-right">
          <button class="y2k-icon-btn" @click="router.push('/')" @mouseenter="playHover" title="返回前台">
            <el-icon size="18"><HomeFilled /></el-icon>
          </button>

          <div class="topbar-divider"></div>

          <el-dropdown trigger="click" @command="handleCommand" popper-class="y2k-dropdown">
            <div class="y2k-topbar-user" @mouseenter="playHover">
              <el-avatar :size="32" :src="authStore.user?.avatarUrl" class="y2k-topbar-avatar">
                {{ authStore.user?.realName?.[0] }}
              </el-avatar>
              <span class="topbar-username">{{ authStore.user?.realName || authStore.user?.username }}</span>
              <el-icon size="12"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="y2k-dropdown-menu">
                <el-dropdown-item command="profile" @mouseenter="playHover">
                  <span class="dropdown-icon">👤</span> 个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout" class="logout-item" @mouseenter="playHover">
                  <span class="dropdown-icon">✕</span> 退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区 -->
      <main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useSound } from '@/composables/useSound'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { hover, error } = useSound()

const isCollapsed = ref(false)

const activeMenu = computed(() => route.path)

function playHover() {
  hover()
}

function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      authStore.logout()
      error()
      router.push('/login')
    })
  } else if (cmd === 'profile') {
    router.push('/admin/profile')
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--y2k-bg);
}

/* ===== 侧边栏 - Y2K 风格 ===== */
.y2k-aside {
  width: 220px;
  flex-shrink: 0;
  background: var(--y2k-bg-card);
  border-right: 2px solid var(--y2k-border);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  overflow: hidden;
}

.y2k-aside.collapsed {
  width: 64px;
}

.aside-brand {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 2px solid var(--y2k-border);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--y2k-text);
}

.brand-logo {
  height: 30px;
  width: auto;
  flex-shrink: 0;
  image-rendering: pixelated;
}

.brand-name {
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  font-weight: 400;
  color: white;
  white-space: nowrap;
}

.brand-blink {
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  color: white;
  animation: y2k-blink 1s step-end infinite;
}

.aside-scroll {
  flex: 1;
}

/* ===== 菜单 - Y2K 风格 ===== */
.y2k-admin-menu {
  border: none !important;
  background: transparent !important;
  padding: 8px 0;
}

:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  font-family: var(--y2k-font-pixel) !important;
  font-size: 13px !important;
  color: var(--y2k-text) !important;
  border: 2px solid transparent;
  margin: 4px 8px;
  transition: all 0.2s ease !important;
}

:deep(.el-menu-item:hover) {
  background: var(--y2k-accent-pink) !important;
  color: white !important;
  border-color: var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  transform: translate(-2px, -2px);
}

:deep(.el-menu-item.is-active) {
  background: var(--y2k-text) !important;
  color: white !important;
  border-color: var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  font-weight: 600 !important;
}

:deep(.el-menu--collapse .el-menu-item) {
  margin: 4px 4px;
  padding: 0 16px !important;
}

:deep(.el-icon) {
  font-size: 16px;
}

.menu-sep {
  height: 2px;
  background: var(--y2k-border);
  margin: 8px 16px;
  opacity: 0.3;
}

.aside-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 2px solid var(--y2k-border);
  flex-shrink: 0;
  background: var(--y2k-bg-dark);
}

.aside-footer-text {
  font-family: var(--y2k-font-pixel);
  font-size: 11px;
  color: var(--y2k-accent-cyan);
}

/* ===== 主体区域 ===== */
.admin-main-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--y2k-bg);
}

/* ===== 顶栏 - Y2K 风格 ===== */
.y2k-topbar {
  height: 64px;
  background: var(--y2k-bg-card);
  border-bottom: 2px solid var(--y2k-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.y2k-collapse-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--y2k-bg);
  border: 2px solid var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  cursor: pointer;
  color: var(--y2k-text);
  transition: all 0.2s ease;
}

.y2k-collapse-btn:hover {
  background: var(--y2k-accent-pink);
  color: white;
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px var(--y2k-shadow);
}

.y2k-breadcrumb :deep(.el-breadcrumb__item) {
  font-family: var(--y2k-font-pixel) !important;
  font-size: 13px;
}

.y2k-breadcrumb :deep(.el-breadcrumb__separator) {
  color: var(--y2k-text-muted);
  font-family: var(--y2k-font-pixel);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.y2k-icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--y2k-bg);
  border: 2px solid var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  cursor: pointer;
  color: var(--y2k-text);
  transition: all 0.2s ease;
}

.y2k-icon-btn:hover {
  background: var(--y2k-accent-pink);
  color: white;
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px var(--y2k-shadow);
}

.topbar-divider {
  width: 2px;
  height: 24px;
  background: var(--y2k-border);
}

.y2k-topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border: 2px solid var(--y2k-border);
  background: var(--y2k-bg);
  transition: all 0.2s ease;
}

.y2k-topbar-user:hover {
  background: var(--y2k-accent-pink);
  color: white;
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  transform: translate(-2px, -2px);
}

.y2k-topbar-avatar {
  flex-shrink: 0;
  border: 2px solid var(--y2k-border);
  border-radius: 0 !important;
}

.topbar-username {
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  color: inherit;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 内容区 ===== */
.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* ===== 下拉菜单覆盖 ===== */
:global(.y2k-dropdown-menu) {
  border: 2px solid var(--y2k-border) !important;
  border-radius: 0 !important;
  background: var(--y2k-bg-card) !important;
  box-shadow: 4px 4px 0px var(--y2k-shadow) !important;
}

:global(.y2k-dropdown-menu .el-dropdown-menu__item) {
  font-family: var(--y2k-font-pixel) !important;
  font-size: 13px !important;
  color: var(--y2k-text) !important;
}

:global(.y2k-dropdown-menu .el-dropdown-menu__item:hover) {
  background: var(--y2k-accent-pink) !important;
  color: white !important;
}

.dropdown-icon {
  margin-right: 8px;
}

:global(.logout-item) {
  color: #ff4500 !important;
}

@media (max-width: 768px) {
  .y2k-aside {
    width: 72px;
  }

  .aside-brand {
    justify-content: center;
    padding: 0 12px;
  }

  .brand-name,
  .brand-blink,
  .aside-footer,
  .menu-sep {
    display: none;
  }

  .y2k-topbar {
    padding: 0 12px;
    gap: 8px;
  }

  .topbar-left {
    min-width: 0;
    gap: 10px;
  }

  .y2k-breadcrumb,
  .topbar-divider,
  .topbar-username {
    display: none;
  }

  .y2k-topbar-user {
    padding: 6px 8px;
  }

  .admin-content {
    padding: 16px 12px;
  }
}

@media (max-width: 480px) {
  .admin-content {
    padding: 12px 8px;
  }
}
</style>
