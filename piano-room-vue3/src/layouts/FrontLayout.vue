<template>
  <div class="front-layout" :class="{ 'has-mobile-bar': isMobile && authStore.isLoggedIn }">
    <!-- 顶部导航 - Y2K 风格 -->
    <header class="y2k-header" :class="{ scrolled: isScrolled }">
      <div class="header-inner page-container">
        <!-- Logo -->
        <div class="y2k-logo" @click="router.push('/')" @mouseenter="playHover">
          <img src="@/assets/logo.png" alt="琴房预约" class="logo-img" />
          <span class="logo-text">{{ systemName }}</span>
          <span class="logo-blink">_</span>
        </div>

        <!-- 导航菜单（桌面端） -->
        <nav class="y2k-nav" v-if="!isMobile">
          <router-link
            to="/"
            class="y2k-nav-link"
            :class="{ active: $route.path === '/' }"
            @mouseenter="playHover"
          >
            <span class="nav-icon">⌂</span>
            <span>首页</span>
          </router-link>
          <router-link
            to="/rooms"
            class="y2k-nav-link"
            :class="{ active: $route.path.startsWith('/rooms') }"
            @mouseenter="playHover"
          >
            <span class="nav-icon">♪</span>
            <span>预约琴房</span>
          </router-link>
          <router-link
            v-if="authStore.isLoggedIn"
            to="/my-reservations"
            class="y2k-nav-link"
            :class="{ active: $route.path === '/my-reservations' }"
            @mouseenter="playHover"
          >
            <span class="nav-icon">◈</span>
            <span>我的预约</span>
          </router-link>
          <router-link
            to="/help"
            class="y2k-nav-link"
            :class="{ active: $route.path === '/help' }"
            @mouseenter="playHover"
          >
            <span class="nav-icon">?</span>
            <span>帮助</span>
          </router-link>
        </nav>

        <!-- 右侧用户区 -->
        <div class="header-right">
          <template v-if="authStore.isLoggedIn">
            <el-dropdown trigger="click" @command="handleCommand" popper-class="y2k-dropdown">
              <div class="y2k-user-info" @mouseenter="playHover">
                <el-avatar :size="36" :src="authStore.user?.avatarUrl" class="y2k-avatar">
                  {{ authStore.user?.realName?.[0] || authStore.user?.username?.[0] }}
                </el-avatar>
                <span class="user-name" v-if="!isMobile">
                  {{ authStore.user?.realName || authStore.user?.username }}
                </span>
                <span class="user-arrow">▼</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="y2k-dropdown-menu">
                  <el-dropdown-item command="profile" @mouseenter="playHover">
                    <span class="dropdown-icon">👤</span> 个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="reservations" @mouseenter="playHover">
                    <span class="dropdown-icon">◈</span> 我的预约
                  </el-dropdown-item>
                  <el-dropdown-item v-if="authStore.isAdmin" command="admin" @mouseenter="playHover">
                    <span class="dropdown-icon">⚙</span> 管理后台
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout" class="logout-item" @mouseenter="playHover">
                    <span class="dropdown-icon">✕</span> 退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <button class="y2k-btn y2k-btn-sm" @click="router.push('/login')" @mouseenter="playHover">
              登录
            </button>
            <button class="y2k-btn y2k-btn-primary y2k-btn-sm" @click="router.push('/register')" @mouseenter="playHover">
              注册
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Y2K 风格页脚 -->
    <footer class="y2k-footer">
      <div class="footer-inner page-container">
        <div class="footer-content">
          <div class="footer-brand">
            <img src="@/assets/logo.png" alt="logo" class="footer-logo" />
            <span class="footer-name">{{ systemName }}</span>
          </div>
          <div class="footer-links">
            <router-link to="/rooms" class="footer-link" @mouseenter="playHover">预约琴房</router-link>
            <router-link to="/my-reservations" class="footer-link" @mouseenter="playHover">我的预约</router-link>
            <router-link to="/help" class="footer-link" @mouseenter="playHover">帮助</router-link>
          </div>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-bottom">
          <span class="footer-copy">© {{ currentYear }} {{ systemName }}</span>
          <span class="footer-pixel">♪ Y2K EDITION ♪</span>
        </div>
      </div>
    </footer>

    <!-- 移动端底部 Tab Bar（登录后显示） -->
    <nav v-if="isMobile && authStore.isLoggedIn" class="y2k-mobile-bar">
      <router-link
        to="/"
        class="mobile-tab"
        :class="{ active: $route.path === '/' }"
        @mouseenter="playHover"
      >
        <span class="tab-icon">⌂</span>
        <span>首页</span>
      </router-link>
      <router-link
        to="/rooms"
        class="mobile-tab"
        :class="{ active: $route.path.startsWith('/rooms') }"
        @mouseenter="playHover"
      >
        <span class="tab-icon">♪</span>
        <span>预约</span>
      </router-link>
      <router-link
        to="/my-reservations"
        class="mobile-tab"
        :class="{ active: $route.path === '/my-reservations' }"
        @mouseenter="playHover"
      >
        <span class="tab-icon">◈</span>
        <span>我的</span>
      </router-link>
      <router-link
        to="/profile"
        class="mobile-tab"
        :class="{ active: $route.path === '/profile' }"
        @mouseenter="playHover"
      >
        <span class="tab-icon">👤</span>
        <span>我</span>
      </router-link>
    </nav>

    <!-- 移动端未登录底部操作区 -->
    <div v-if="isMobile && !authStore.isLoggedIn" class="y2k-mobile-auth">
      <button class="y2k-btn y2k-btn-block" @click="router.push('/login')" @mouseenter="playHover">
        登录
      </button>
      <button class="y2k-btn y2k-btn-primary y2k-btn-block" @click="router.push('/register')" @mouseenter="playHover">
        注册
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { useSound } from '@/composables/useSound'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const { hover, confirm, error } = useSound()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('md')

const systemName = computed(() => settingsStore.basicSettings?.systemName || '皮埃诺预约系统')
const currentYear = new Date().getFullYear()
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

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
      error() // 退出音效
      router.push('/login')
    })
  } else if (cmd === 'profile') {
    confirm()
    router.push('/profile')
  } else if (cmd === 'reservations') {
    confirm()
    router.push('/my-reservations')
  } else if (cmd === 'admin') {
    confirm()
    router.push('/admin')
  }
}
</script>

<style scoped>
/* ===== Y2K 布局基础 ===== */
.front-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.front-layout.has-mobile-bar {
  padding-bottom: 64px;
}

/* ===== Y2K 头部导航 ===== */
.y2k-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--y2k-bg);
  border-bottom: 2px solid var(--y2k-border);
  height: 64px;
  transition: all 0.2s ease;
}

.y2k-header.scrolled {
  box-shadow: 0 4px 0 rgba(45, 0, 102, 0.1);
}

.header-inner {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Logo */
.y2k-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex-shrink: 0;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
  image-rendering: pixelated;
}

.logo-text {
  font-family: var(--y2k-font-pixel);
  font-size: 18px;
  font-weight: 400;
  color: var(--y2k-text);
  text-shadow: 2px 2px 0px var(--y2k-accent-pink);
  white-space: nowrap;
}

.logo-blink {
  font-family: var(--y2k-font-pixel);
  font-size: 18px;
  color: var(--y2k-accent-cyan);
  animation: y2k-blink 1s step-end infinite;
}

/* 导航链接 */
.y2k-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.y2k-nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  color: var(--y2k-text);
  text-decoration: none;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.y2k-nav-link:hover {
  background: var(--y2k-accent-pink);
  color: white;
  border-color: var(--y2k-border);
  box-shadow: 4px 4px 0px var(--y2k-shadow);
  transform: translate(-2px, -2px);
}

.y2k-nav-link.active,
.y2k-nav-link.router-link-active,
.y2k-nav-link.router-link-exact-active {
  background: var(--y2k-text);
  color: white;
  border-color: var(--y2k-text);
  box-shadow: 4px 4px 0px var(--y2k-accent-pink);
}

.nav-icon {
  font-size: 16px;
}

/* 用户信息 */
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.y2k-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px 6px 6px;
  border: 2px solid var(--y2k-border);
  background: var(--y2k-bg-card);
  transition: all 0.2s ease;
}

.y2k-user-info:hover {
  background: var(--y2k-accent-pink);
  color: white;
  box-shadow: 4px 4px 0px var(--y2k-shadow);
  transform: translate(-2px, -2px);
}

.y2k-avatar {
  flex-shrink: 0;
  border: 2px solid var(--y2k-border);
  border-radius: 0 !important;
}

.user-name {
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  color: inherit;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-arrow {
  font-size: 10px;
  color: inherit;
}

/* ===== 按钮工具类 ===== */
.y2k-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  font-weight: 400;
  text-transform: uppercase;
  color: var(--y2k-text);
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0px var(--y2k-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
}

.y2k-btn:hover {
  background: var(--y2k-accent-pink);
  color: white;
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px var(--y2k-shadow);
}

.y2k-btn:active {
  transform: translate(4px, 4px);
  box-shadow: 0px 0px 0px var(--y2k-shadow);
}

.y2k-btn-sm {
  padding: 8px 16px;
  font-size: 12px;
}

.y2k-btn-block {
  flex: 1;
}

.y2k-btn-primary {
  background: var(--y2k-accent-pink);
  color: white;
  border-color: var(--y2k-accent-pink-dark);
}

.y2k-btn-primary:hover {
  background: var(--y2k-accent-pink);
  border-color: var(--y2k-border);
}

/* ===== 主内容区 ===== */
.main-content {
  flex: 1;
  background: var(--y2k-bg);
}

/* ===== Y2K 页脚 ===== */
.y2k-footer {
  background: var(--y2k-bg-card);
  border-top: 2px solid var(--y2k-border);
  padding: 24px 0;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-logo {
  height: 28px;
  opacity: 0.8;
  image-rendering: pixelated;
}

.footer-name {
  font-family: var(--y2k-font-pixel);
  font-size: 16px;
  color: var(--y2k-text);
  text-shadow: 2px 2px 0px var(--y2k-accent-pink);
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-link {
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  color: var(--y2k-text);
  text-decoration: none;
  padding: 6px 12px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.footer-link:hover {
  background: var(--y2k-accent-pink);
  color: white;
  border-color: var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  transform: translate(-2px, -2px);
}

.footer-divider {
  height: 2px;
  background: var(--y2k-border);
  margin: 16px 0;
  opacity: 0.3;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--y2k-font-pixel);
  font-size: 12px;
  color: var(--y2k-text-muted);
}

.footer-pixel {
  color: var(--y2k-accent-cyan);
}

/* ===== 移动端底部 Tab Bar ===== */
.y2k-mobile-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--y2k-bg);
  border-top: 2px solid var(--y2k-border);
  display: flex;
  align-items: stretch;
  z-index: 200;
  box-shadow: 0 -4px 0 rgba(45, 0, 102, 0.1);
}

.mobile-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: var(--y2k-text-muted);
  font-family: var(--y2k-font-pixel);
  font-size: 11px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.mobile-tab.active,
.mobile-tab.router-link-active,
.mobile-tab.router-link-exact-active {
  background: var(--y2k-text);
  color: white;
  border-color: var(--y2k-border);
}

.tab-icon {
  font-size: 20px;
}

/* 未登录移动端操作区 */
.y2k-mobile-auth {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background: var(--y2k-bg);
  border-top: 2px solid var(--y2k-border);
  display: flex;
  gap: 12px;
  z-index: 200;
  box-shadow: 0 -4px 0 rgba(45, 0, 102, 0.1);
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

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .header-inner {
    padding: 0 16px;
    gap: 16px;
  }

  .logo-text {
    font-size: 14px;
  }

  .footer-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-links {
    flex-wrap: wrap;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>
