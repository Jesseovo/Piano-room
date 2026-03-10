<template>
  <div class="y2k-login-page">
    <!-- 左侧 Banner - Y2K 风格 -->
    <div class="y2k-banner">
      <div class="banner-content">
        <div class="banner-logo">
          <img src="@/assets/logo.png" alt="logo" class="logo-img" />
          <span class="logo-text">皮埃诺预约系统</span>
          <span class="logo-blink y2k-blink">_</span>
        </div>

        <h1 class="banner-title">
          <span class="title-line">随时预约</span>
          <span class="title-line">属于你的练琴时光</span>
        </h1>

        <div class="banner-features">
          <div class="feature-item y2k-float">
            <span class="feature-icon">◆</span>
            <span>即时生效，无需等待审核</span>
          </div>
          <div class="feature-item y2k-float-delay">
            <span class="feature-icon">◆</span>
            <span>签到签退，保障诚信使用</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">◆</span>
            <span>违约记录，阶梯惩罚机制</span>
          </div>
        </div>
      </div>

      <!-- Y2K 装饰像素 -->
      <div class="deco-pixel p1">▓</div>
      <div class="deco-pixel p2">░</div>
      <div class="deco-pixel p3">▒</div>
      <div class="deco-pixel p4">█</div>
    </div>

    <!-- 右侧登录表单 - Y2K 风格 -->
    <div class="y2k-form-area">
      <div class="y2k-form-card" :class="{ shake: isShaking }">
        <!-- 移动端 Logo -->
        <div class="y2k-mobile-logo">
          <img src="@/assets/logo.png" alt="logo" />
          <span>皮埃诺预约</span>
          <span class="blink">_</span>
        </div>

        <div class="form-header">
          <h2 class="y2k-heading y2k-heading-md">用户登录</h2>
          <p class="form-subtitle">请输入您的账号和密码</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="y2k-login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              clearable
              @focus="playFocus"
              @mouseenter="playHover"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              clearable
              @focus="playFocus"
              @mouseenter="playHover"
            />
          </el-form-item>

          <el-form-item label="验证码" prop="captcha">
            <div class="y2k-captcha-row">
              <el-input
                v-model="form.captcha"
                placeholder="请输入图中验证码"
                size="large"
                :prefix-icon="Key"
                clearable
                @focus="playFocus"
                @mouseenter="playHover"
              />
              <div class="y2k-captcha-wrap" title="点击刷新验证码" @click="loadCaptcha">
                <img v-if="captchaUrl" :src="captchaUrl" class="captcha-img" alt="验证码" />
                <div v-else class="captcha-placeholder">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                </div>
                <div class="captcha-overlay">↻</div>
              </div>
            </div>
          </el-form-item>

          <div class="form-extra">
            <router-link to="/forgot-password" class="y2k-link" @mouseenter="playHover">
              忘记密码？
            </router-link>
          </div>

          <button
            type="button"
            class="y2k-btn y2k-btn-primary y2k-btn-block y2k-btn-pulse"
            :disabled="loading"
            @click="handleLogin"
            @mouseenter="playHover"
          >
            <span v-if="!loading">【 登 录 】</span>
            <span v-else>登录中...</span>
          </button>

          <div class="y2k-register-tip">
            还没有账号？
            <router-link to="/register" class="y2k-link-bold" @mouseenter="playHover">
              立即注册 →
            </router-link>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 音效提示 -->
    <div class="y2k-sound-hint" v-if="!audioInitialized">
      点击任意处启用音效 🔊
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock, Key, Loading } from '@element-plus/icons-vue'
import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import { useSound } from '@/composables/useSound'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { init, hover, click, confirm, error, focus, isInitialized } = useSound()

const formRef = ref<FormInstance>()
const loading = ref(false)
const captchaUrl = ref('')
const isShaking = ref(false)
const audioInitialized = ref(false)

const form = ref({ username: '', password: '', captcha: '' })

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度 3-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度 6-20 个字符', trigger: 'blur' },
  ],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

function playHover() {
  if (audioInitialized.value) hover()
}

function playClick() {
  if (audioInitialized.value) click()
}

function playFocus() {
  if (audioInitialized.value) focus()
}

function initAudio() {
  if (!audioInitialized.value) {
    init()
    audioInitialized.value = true
  }
}

function triggerShake() {
  isShaking.value = true
  setTimeout(() => { isShaking.value = false }, 600)
}

async function loadCaptcha() {
  captchaUrl.value = ''
  try {
    const res = await userApi.getCaptcha(0)
    if (res?.code === 1) captchaUrl.value = res.data
  } catch {
    ElMessage.error('获取验证码失败，请刷新重试')
  }
}

async function handleLogin() {
  initAudio()
  click()

  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await userApi.login(form.value)
      if (res?.code === 1 && res.data?.token && res.data?.user) {
        authStore.login(res.data.token, res.data.user as any)
        confirm()
        ElMessage.success('登录成功，欢迎回来！')
        const redirect = route.query.redirect as string
        if (res.data.user.userType === 'admin' || res.data.user.userType === 'super_admin') {
          router.push('/admin')
        } else {
          router.push(redirect || '/')
        }
      } else {
        error()
        ElMessage.error(res?.msg || '用户名或密码错误')
        triggerShake()
        loadCaptcha()
      }
    } catch {
      error()
      triggerShake()
      loadCaptcha()
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  loadCaptcha()
  // 监听首次点击初始化音频
  const handler = () => {
    initAudio()
    document.removeEventListener('click', handler)
  }
  document.addEventListener('click', handler)
})
</script>

<style scoped>
/* ===== Y2K 登录页 ===== */
.y2k-login-page {
  display: flex;
  min-height: 100vh;
  background: var(--y2k-bg);
  position: relative;
}

/* ===== 左侧 Banner - Y2K 风格（使用 login-bg.jpg） ===== */
.y2k-banner {
  flex: 1;
  background-image: url('@/assets/login-bg.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  padding: 60px 56px;
  position: relative;
  overflow: hidden;
  border-right: 4px solid var(--y2k-border);
}

/* 轻微暗色遮罩：保证文字可读，不遮挡背景图 */
.y2k-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    160deg,
    rgba(0, 0, 0, 0.12) 0%,
    rgba(0, 0, 0, 0.32) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 2;
  max-width: 460px;
}

.banner-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo-img {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  border: 3px solid var(--y2k-border);
  box-shadow: 4px 4px 0px var(--y2k-shadow);
  object-fit: contain;
  image-rendering: pixelated;
}

.logo-text {
  font-family: var(--y2k-font-pixel);
  font-size: 20px;
  font-weight: 400;
  color: white;
  text-shadow: 3px 3px 0px var(--y2k-border);
}

.logo-blink {
  font-family: var(--y2k-font-pixel);
  font-size: 20px;
  color: var(--y2k-accent-yellow);
  text-shadow: 2px 2px 0px var(--y2k-border);
}

.banner-title {
  margin-bottom: 24px;
}

.title-line {
  display: block;
  font-family: var(--y2k-font-pixel);
  font-size: 36px;
  font-weight: 400;
  color: white;
  text-shadow: 3px 3px 0px var(--y2k-border);
  line-height: 1.3;
}

.banner-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  text-shadow: 2px 2px 0px var(--y2k-border);
}

.feature-icon {
  color: var(--y2k-accent-yellow);
  font-size: 12px;
}

/* 装饰像素字符 */
.deco-pixel {
  position: absolute;
  font-family: var(--y2k-font-pixel);
  font-size: 48px;
  color: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  animation: y2k-float 4s ease-in-out infinite;
}

.p1 { top: 10%; right: 15%; animation-delay: 0s; }
.p2 { top: 30%; right: 8%; font-size: 36px; animation-delay: 0.5s; }
.p3 { top: 60%; right: 20%; font-size: 60px; animation-delay: 1s; }
.p4 { bottom: 15%; right: 10%; font-size: 42px; animation-delay: 1.5s; }

/* ===== 右侧表单区 - Y2K 风格 ===== */
.y2k-form-area {
  width: 480px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: var(--y2k-bg);
}

.y2k-form-card {
  width: 100%;
  max-width: 360px;
  background: var(--y2k-bg-card);
  border: 3px solid var(--y2k-border);
  box-shadow: 6px 6px 0px var(--y2k-shadow);
  padding: 32px;
  transition: all 0.2s ease;
}

.y2k-form-card:hover {
  box-shadow: 8px 8px 0px var(--y2k-shadow);
}

.y2k-form-card.shake {
  animation: y2k-shake 0.5s ease;
}

@keyframes y2k-shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-8px); }
  30% { transform: translateX(8px); }
  50% { transform: translateX(-6px); }
  70% { transform: translateX(6px); }
}

.y2k-mobile-logo {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.y2k-mobile-logo img {
  width: 36px;
  height: 36px;
  border: 2px solid var(--y2k-border);
  image-rendering: pixelated;
}

.y2k-mobile-logo span {
  font-family: var(--y2k-font-pixel);
  font-size: 16px;
  color: var(--y2k-text);
}

.y2k-mobile-logo .blink {
  font-family: var(--y2k-font-pixel);
  color: var(--y2k-accent-cyan);
  animation: y2k-blink 1s step-end infinite;
}

.form-header {
  margin-bottom: 24px;
  text-align: center;
}

.form-subtitle {
  font-family: var(--y2k-font-body);
  font-size: 13px;
  color: var(--y2k-text-muted);
  margin-top: 8px;
}

/* Y2K 表单样式 */
.y2k-login-form :deep(.el-form-item__label) {
  font-family: var(--y2k-font-pixel) !important;
  font-size: 13px !important;
  color: var(--y2k-text) !important;
  margin-bottom: 6px;
}

.y2k-login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.y2k-login-form :deep(.el-input__wrapper) {
  height: 44px;
  border-radius: 0 !important;
  background: var(--y2k-bg) !important;
  border: 2px solid var(--y2k-border) !important;
  box-shadow: none !important;
  transition: all 0.2s ease !important;
}

.y2k-login-form :deep(.el-input__wrapper:hover) {
  border-color: var(--y2k-accent-cyan) !important;
}

.y2k-login-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--y2k-accent-pink) !important;
  border-width: 3px !important;
}

.y2k-login-form :deep(.el-input__inner) {
  color: var(--y2k-text) !important;
  font-family: var(--y2k-font-body) !important;
}

/* 验证码行 */
.y2k-captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.y2k-captcha-row > .el-input {
  flex: 1;
}

.y2k-captcha-wrap {
  width: 100px;
  height: 44px;
  border: 2px solid var(--y2k-border);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s ease;
  background: var(--y2k-bg);
}

.y2k-captcha-wrap:hover {
  border-color: var(--y2k-accent-pink);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  transform: translate(-2px, -2px);
}

.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.captcha-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--y2k-bg-dark);
}

.captcha-overlay {
  position: absolute;
  inset: 0;
  background: var(--y2k-accent-pink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--y2k-font-pixel);
  font-size: 18px;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.y2k-captcha-wrap:hover .captcha-overlay {
  opacity: 0.9;
}

.loading-icon {
  animation: y2k-spin 1s linear infinite;
}

@keyframes y2k-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 额外行 */
.form-extra {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  margin-top: -4px;
}

.y2k-link {
  font-family: var(--y2k-font-pixel);
  font-size: 12px;
  color: var(--y2k-text-muted);
  text-decoration: none;
  transition: all 0.2s ease;
}

.y2k-link:hover {
  color: var(--y2k-accent-pink);
  text-shadow: 1px 1px 0px var(--y2k-shadow);
}

.y2k-link-bold {
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  color: var(--y2k-accent-pink);
  text-decoration: none;
  font-weight: 600;
}

.y2k-link-bold:hover {
  color: var(--y2k-accent-cyan);
}

/* Y2K 按钮 */
.y2k-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
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

.y2k-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--y2k-bg-dark);
}

.y2k-btn-primary {
  background: var(--y2k-accent-pink);
  color: white;
  border-color: var(--y2k-accent-pink-dark);
}

.y2k-btn-primary:hover {
  background: var(--y2k-accent-cyan);
  border-color: var(--y2k-accent-cyan-dark);
}

.y2k-btn-block {
  width: 100%;
  height: 48px;
}

/* 注册提示 */
.y2k-register-tip {
  text-align: center;
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  color: var(--y2k-text-secondary);
  margin-top: 16px;
}

/* 音效提示 */
.y2k-sound-hint {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--y2k-font-pixel);
  font-size: 12px;
  color: var(--y2k-text-muted);
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  padding: 8px 16px;
  z-index: 100;
  animation: y2k-blink 2s step-end infinite;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .y2k-banner {
    display: none;
  }

  .y2k-form-area {
    width: 100%;
    padding: 24px 16px;
  }

  .y2k-form-card {
    padding: 24px;
    box-shadow: 4px 4px 0px var(--y2k-shadow);
  }

  .y2k-mobile-logo {
    display: flex;
  }

  .y2k-sound-hint {
    bottom: 24px;
  }
}
</style>
