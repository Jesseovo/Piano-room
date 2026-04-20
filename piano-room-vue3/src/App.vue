<template>
  <div id="app">
    <div class="y2k-loading-bar" :class="{ active: isLoading, done: isDone }">
      <div class="y2k-loading-fill"></div>
    </div>

    <div class="y2k-corner y2k-corner-tl">◤</div>
    <div class="y2k-corner y2k-corner-tr">◥</div>
    <div class="y2k-corner y2k-corner-bl">◣</div>
    <div class="y2k-corner y2k-corner-br">◢</div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isLoading = ref(false)
const isDone = ref(false)

let doneTimer: ReturnType<typeof setTimeout>

router.beforeEach(() => {
  isDone.value = false
  isLoading.value = true
})

router.afterEach(() => {
  isDone.value = true
  clearTimeout(doneTimer)
  doneTimer = setTimeout(() => {
    isLoading.value = false
    isDone.value = false
  }, 400)
})
</script>

<style>
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

* {
  font-family: var(--y2k-font-body);
}

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

p, span, div, li, td, th,
.el-input__inner,
.el-textarea__inner {
  font-family: var(--y2k-font-body) !important;
}
</style>
