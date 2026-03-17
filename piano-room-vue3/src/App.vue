<template>
  <div id="app" @click="handleFirstInteraction" @keydown="handleFirstInteraction">
    <!-- Y2K 风格页面加载进度条 -->
    <div class="y2k-loading-bar" :class="{ active: isLoading, done: isDone }">
      <div class="y2k-loading-fill"></div>
    </div>

    <!-- Y2K 像素装饰 -->
    <div class="y2k-corner y2k-corner-tl">◢</div>
    <div class="y2k-corner y2k-corner-tr">◣</div>
    <div class="y2k-corner y2k-corner-bl">◥</div>
    <div class="y2k-corner y2k-corner-br">◤</div>

    <!-- 音效控制开关 -->
    <button
      class="y2k-sound-toggle"
      :class="{ muted: isMuted }"
      @click="toggleSound"
      @mouseenter="playHover"
      title="切换音效"
    >
      <span v-if="isMuted">🔇</span>
      <span v-else>🔊</span>
    </button>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSound } from '@/composables/useSound'

const router = useRouter()
const { init, toggleMute, hover, transition, isMuted, startAmbient } = useSound()

const isLoading = ref(false)
const isDone = ref(false)
const audioInitialized = ref(false)

let doneTimer: ReturnType<typeof setTimeout>

// 首次交互初始化音频
function handleFirstInteraction() {
  if (!audioInitialized.value) {
    init()
    startAmbient()
    audioInitialized.value = true
  }
}

// 切换音效
function toggleSound() {
  const newState = toggleMute()
  if (!newState) {
    // 取消静音时播放确认音
    handleFirstInteraction()
  }
}

// 播放悬停音
function playHover() {
  hover()
}

// 路由切换
router.beforeEach(() => {
  isDone.value = false
  isLoading.value = true
})

router.afterEach(() => {
  isDone.value = true
  transition() // 播放页面切换音效
  clearTimeout(doneTimer)
  doneTimer = setTimeout(() => {
    isLoading.value = false
    isDone.value = false
  }, 400)
})

onMounted(() => {
  // 添加全局键盘监听用于初始化
  window.addEventListener('keydown', handleFirstInteraction, { once: true })
})
</script>

<style>
/* ===== Y2K 风格全局样式 ===== */

/* 进度条 - Y2K 风格 */
.y2k-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  z-index: 10000;
  pointer-events: none;
  background: var(--y2k-bg-dark);
  border-bottom: 2px solid var(--y2k-border);
}

.y2k-loading-fill {
  width: 0%;
  height: 100%;
  background: var(--y2k-accent-pink);
  box-shadow: 0 0 10px var(--y2k-accent-pink);
  transition: width 0.3s ease;
}

.y2k-loading-bar.active .y2k-loading-fill {
  animation: y2k-loading 1.5s ease infinite;
}

.y2k-loading-bar.done .y2k-loading-fill {
  width: 100%;
  animation: none;
  background: var(--y2k-accent-cyan);
}

@keyframes y2k-loading {
  0% { width: 0%; }
  50% { width: 60%; }
  100% { width: 80%; }
}

/* 角落装饰 */
.y2k-corner {
  position: fixed;
  font-family: var(--y2k-font-pixel);
  font-size: 24px;
  color: var(--y2k-accent-pink);
  z-index: 9998;
  pointer-events: none;
  animation: y2k-float 3s ease-in-out infinite;
}

.y2k-corner-tl {
  top: 12px;
  left: 12px;
}

.y2k-corner-tr {
  top: 12px;
  right: 12px;
  animation-delay: 0.5s;
}

.y2k-corner-bl {
  bottom: 12px;
  left: 12px;
  animation-delay: 1s;
}

.y2k-corner-br {
  bottom: 12px;
  right: 12px;
  animation-delay: 1.5s;
}

/* 音效开关 */
.y2k-sound-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0px var(--y2k-shadow);
  cursor: pointer;
  z-index: 9997;
  transition: all 0.2s ease;
}

.y2k-sound-toggle:hover {
  background: var(--y2k-accent-pink);
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px var(--y2k-shadow);
}

.y2k-sound-toggle:active {
  transform: translate(4px, 4px);
  box-shadow: 0px 0px 0px var(--y2k-shadow);
}

.y2k-sound-toggle.muted {
  background: var(--y2k-bg-dark);
  opacity: 0.6;
}

/* 重置 Element Plus 字体 */
* {
  font-family: var(--y2k-font-body);
}

/* 确保像素字体用于标题 */
h1, h2, h3, h4, h5, h6,
.y2k-heading,
.el-card__header,
.el-dialog__header,
.el-button,
.el-tag,
.el-menu-item,
.el-tabs__item,
.el-pagination,
.el-notification__title,
.el-breadcrumb__inner,
.el-message {
  font-family: var(--y2k-font-pixel) !important;
}

/* 正文字体 */
p, span, div, li, td, th,
.el-input__inner,
.el-textarea__inner {
  font-family: var(--y2k-font-body) !important;
}
</style>
