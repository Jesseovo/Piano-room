<template>
  <div class="page-wrapper">
    <div class="page-container">
      <!-- 页头 -->
      <div class="page-head">
        <h1 class="y2k-page-title">♪ 预约琴房</h1>
        <p class="y2k-page-sub">先到先得 · 即时生效 · 手快有手慢无</p>
      </div>

      <div class="content-layout">
        <!-- 左侧筛选栏 -->
        <aside class="filter-sidebar">
          <div class="y2k-filter-card">
            <div class="y2k-filter-header">
              <span>▣ 筛选条件</span>
            </div>
            <div class="y2k-filter-body">
              <div class="filter-field">
                <label class="y2k-label">预约日期</label>
                <el-date-picker
                  v-model="filter.date"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="选择日期"
                  :disabled-date="disabledDate"
                  style="width:100%"
                />
              </div>

              <div class="filter-field">
                <label class="y2k-label">关键字</label>
                <el-input v-model="filter.keyword" placeholder="搜索琴房名称" clearable @keyup.enter="handleSearch" />
              </div>

              <button class="y2k-search-btn" @click="handleSearch">
                ○ 搜索
              </button>
              <button class="y2k-reset-btn" @click="handleReset">重置筛选</button>
            </div>
          </div>
        </aside>

        <!-- 右侧琴房列表 -->
        <div class="rooms-main">
          <!-- 工具栏 -->
          <div class="y2k-toolbar">
            <span v-if="!loading" class="rooms-count">
              共找到 <strong>{{ rooms.length }}</strong> 间琴房
            </span>
            <div class="view-switch">
              <button
                class="y2k-view-btn"
                :class="{ active: viewMode === 'card' }"
                @click="viewMode = 'card'"
                title="卡片视图"
              >▦</button>
              <button
                class="y2k-view-btn"
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
                title="列表视图"
              >☰</button>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="skeleton-grid">
            <div v-for="n in 6" :key="n" class="y2k-skeleton" />
          </div>

          <!-- 空状态 -->
          <div v-else-if="rooms.length === 0" class="y2k-empty">
            <span class="empty-icon">♩</span>
            <p>暂无符合条件的琴房</p>
          </div>

          <!-- 卡片视图 -->
          <div v-else-if="viewMode === 'card'" class="rooms-card-grid">
            <div
              v-for="room in rooms"
              :key="room.id"
              class="y2k-room-card"
              @click="room.status === 1 && openSlotDialog(room)"
            >
              <!-- Y2K 卡片头部 -->
              <div class="y2k-card-head">
                <span class="room-icon">♪</span>
                <span
                  class="y2k-status-badge"
                  :class="room.status === 1 ? 'badge-ok' : 'badge-off'"
                >
                  {{ room.status === 1 ? '可预约' : '维护中' }}
                </span>
              </div>

              <!-- 卡片信息 -->
              <div class="y2k-card-body">
                <h3 class="y2k-room-name">{{ room.name }}</h3>
                <div class="y2k-room-meta">
                  <span>◎ {{ room.buildingName || '综合楼' }}</span>
                  <span>♟ {{ room.capacity || '-' }} 人</span>
                </div>
                <div v-if="room.facilities" class="y2k-facilities">
                  <span
                    v-for="f in getFacilities(room.facilities).slice(0, 3)"
                    :key="f"
                    class="y2k-facility-chip"
                  >{{ f }}</span>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="y2k-card-footer">
                <button
                  class="y2k-book-btn"
                  :class="room.status !== 1 ? 'y2k-book-btn-disabled' : ''"
                  :disabled="room.status !== 1"
                  @click.stop="room.status === 1 && openSlotDialog(room)"
                >
                  {{ room.status === 1 ? '【 立即抢占 】' : '暂不可用' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-else class="y2k-table-wrap">
            <table class="y2k-table">
              <thead>
                <tr>
                  <th>琴房名称</th>
                  <th>位置</th>
                  <th>容量</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in rooms" :key="room.id">
                  <td>{{ room.name }}</td>
                  <td>{{ room.buildingName || '综合楼' }}</td>
                  <td>{{ room.capacity || '-' }} 人</td>
                  <td>
                    <span class="y2k-status-badge" :class="room.status === 1 ? 'badge-ok' : 'badge-off'">
                      {{ room.status === 1 ? '可预约' : '维护中' }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="y2k-table-btn"
                      :disabled="room.status !== 1"
                      @click="room.status === 1 && openSlotDialog(room)"
                    >立即抢占</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 时段选择弹窗 ===== -->
    <el-dialog
      v-model="slotDialogVisible"
      :title="''"
      width="480px"
      :close-on-click-modal="false"
      class="y2k-dialog"
    >
      <template #header>
        <div class="y2k-dialog-title">
          <span>♪ {{ selectedRoom?.name }}</span>
          <span class="y2k-dialog-sub">选择练琴时段</span>
        </div>
      </template>

      <div class="slot-dialog-content">
        <!-- 日期选择 -->
        <div class="slot-date-row">
          <span class="y2k-label">预约日期：</span>
          <el-date-picker
            v-model="slotDate"
            type="date"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            @change="loadSlots"
            style="width: 160px"
            size="small"
          />
        </div>

        <!-- 时段加载中 -->
        <div v-if="loadingSlots" class="slots-loading">
          <div v-for="i in 4" :key="i" class="y2k-skeleton slot-skeleton" />
        </div>

        <!-- 无时段 -->
        <div v-else-if="dialogSlots.length === 0" class="y2k-empty-small">
          <span>♩ 该日期暂无可用时段</span>
        </div>

        <!-- 时段方块 Grid -->
        <div v-else class="dialog-slot-grid">
          <div
            v-for="slot in dialogSlots"
            :key="slot.id"
            class="dialog-slot-block"
            :class="[
              slot.available && !slot.isPast ? 'slot-free' : '',
              !slot.available ? 'slot-booked' : '',
              slot.isPast ? 'slot-past' : ''
            ]"
            @click="slot.available && !slot.isPast && openConfirmDialog(slot)"
          >
            <span class="slot-block-time">{{ slot.startTime }}<br/>{{ slot.endTime }}</span>
            <span v-if="slot.available && !slot.isPast && !slot.isStarted" class="slot-block-status free-text">可抢占</span>
            <span v-else-if="slot.available && !slot.isPast && slot.isStarted" class="slot-block-status ongoing-text">进行中可约</span>
            <span v-else-if="slot.isPast" class="slot-block-status past-text">已过期</span>
            <span v-else-if="slot.isMyReservation" class="slot-block-status booked-text">已预约</span>
            <span v-else class="slot-block-status booked-text">已满员</span>
            <span v-if="slot.available && !slot.isPast" class="pulse-dot-sm" />
            <span v-else-if="!slot.available" class="slot-lock-sm">🔒</span>
            <span v-else class="slot-lock-sm">⌛</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- ===== 确认预约弹窗 ===== -->
    <el-dialog
      v-model="confirmDialogVisible"
      title=""
      width="420px"
      :close-on-click-modal="false"
      class="y2k-dialog"
    >
      <template #header>
        <div class="y2k-dialog-title">
          <span>◆ 确认预约</span>
        </div>
      </template>

      <div class="confirm-content" v-if="pendingSlot">
        <div class="confirm-row">
          <span class="confirm-label">琴房</span>
          <span class="confirm-value pink">{{ selectedRoom?.name }}</span>
        </div>
        <div class="confirm-row">
          <span class="confirm-label">时段</span>
          <span class="confirm-value">
            {{ slotDate }} &nbsp; {{ pendingSlot.startTime }} — {{ pendingSlot.endTime }}
          </span>
        </div>
        <div class="confirm-tip">
          ⚠ 预约成功即时生效，请按时到场签到，违约将受到惩罚
        </div>
        <div class="confirm-remarks">
          <el-input
            v-model="quickRemarks"
            type="textarea"
            :rows="2"
            placeholder="备注（选填，最多100字）"
            maxlength="100"
            show-word-limit
          />
        </div>
      </div>

      <template #footer>
        <button class="y2k-cancel-btn" @click="confirmDialogVisible = false" :disabled="booking">取消</button>
        <button class="y2k-confirm-btn" @click="confirmQuickBook" :disabled="booking">
          {{ booking ? '抢占中...' : '【 确认预约 】' }}
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useRouter } from 'vue-router'
import { roomApi } from '@/api/room'
import { reservationApi } from '@/api/reservation'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const loading = ref(false)
const rooms = ref<any[]>([])
const viewMode = ref<'card' | 'list'>('card')

const filter = reactive({
  date: dayjs().format('YYYY-MM-DD'),
  keyword: '',
})

// ===== 时段配置（从 settingsStore 读取，fallback 默认值）=====
const slotStartHour = computed(() => settingsStore.basicSettings?.slotStartHour ?? 8)
const slotEndHour = computed(() => settingsStore.basicSettings?.slotEndHour ?? 22)
const slotDurationMinutes = computed(() => settingsStore.basicSettings?.slotDurationMinutes ?? 120)
const bookingResetHour = computed(() => settingsStore.basicSettings?.bookingResetHour ?? 0)
const maxAdvanceDays = computed(() => settingsStore.reservationSettings?.maxAdvanceDays ?? 7)

// ===== 时段弹窗状态 =====
const slotDialogVisible = ref(false)
const selectedRoom = ref<any>(null)
const slotDate = ref(dayjs().format('YYYY-MM-DD'))
const dialogSlots = ref<any[]>([])
const loadingSlots = ref(false)

// ===== 确认弹窗状态 =====
const confirmDialogVisible = ref(false)
const pendingSlot = ref<any>(null)
const quickRemarks = ref('')
const booking = ref(false)

/**
 * 禁用日期：根据 maxAdvanceDays 设置允许预约的日期范围
 * 如果当前时间还未到 bookingResetHour，则不允许选择明天及以后
 */
function disabledDate(d: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 今天之前的日期禁用
  if (d < today) return true

  // 计算最大可预约日期
  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + maxAdvanceDays.value)

  // 超过最大提前预约天数的日期禁用
  if (d >= maxDate) return true

  // 明天及以后的日期：只有当前时间 >= bookingResetHour 才开放
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (d >= tomorrow) {
    const currentHour = new Date().getHours()
    return currentHour < bookingResetHour.value
  }

  return false
}

function getFacilities(facilities: string): string[] {
  if (!facilities) return []
  try {
    const parsed = JSON.parse(facilities)
    if (Array.isArray(parsed)) return parsed
    if (typeof parsed === 'object') return Object.keys(parsed)
  } catch { /* ignore */ }
  return facilities.split(',').map((s: string) => s.trim()).filter(Boolean)
}

async function loadRooms() {
  loading.value = true
  try {
    const res = await roomApi.search({
      date: filter.date || undefined,
      pageNum: 1,
      pageSize: 100,
    })
    if (res?.code === 1) {
      let data = res.data?.rows || res.data?.list || res.data || []
      if (filter.keyword) {
        const kw = filter.keyword.toLowerCase()
        data = data.filter((r: any) =>
          r.name?.toLowerCase().includes(kw) || r.roomNumber?.toLowerCase().includes(kw)
        )
      }
      rooms.value = data
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() { loadRooms() }

function handleReset() {
  filter.date = dayjs().format('YYYY-MM-DD')
  filter.keyword = ''
  loadRooms()
}

// ===== 打开时段弹窗 =====
function openSlotDialog(room: any) {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再进行预约')
    router.push('/login')
    return
  }
  selectedRoom.value = room
  slotDate.value = filter.date || dayjs().format('YYYY-MM-DD')
  slotDialogVisible.value = true
  loadSlots()
}

// ===== 加载时段 =====
async function loadSlots() {
  if (!selectedRoom.value) return
  loadingSlots.value = true
  dialogSlots.value = []
  try {
    const res = await reservationApi.getAvailability(selectedRoom.value.id, slotDate.value)
    if (res?.code === 1 && res.data) {
      dialogSlots.value = generateSlots(res.data as any[])
    } else {
      dialogSlots.value = generateSlots([])
    }
  } catch {
    dialogSlots.value = generateSlots([])
  } finally {
    loadingSlots.value = false
  }
}

// ===== 生成时段列表（从 settingsStore 读取配置）=====
function generateSlots(booked: any[]) {
  const slots: any[] = []
  const date = slotDate.value
  const now = dayjs()
  const startH = slotStartHour.value
  const endH = slotEndHour.value
  const durationMin = slotDurationMinutes.value
  const currentUserId = authStore.user?.id

  let cur = dayjs(date).hour(startH).minute(0).second(0)
  const endTime = dayjs(date).hour(endH).minute(0).second(0)

  const sorted = [...booked].sort((a, b) => dayjs(a.isoStart).valueOf() - dayjs(b.isoStart).valueOf())

  let idx = 0
  while (cur.isBefore(endTime)) {
    const slotEnd = cur.add(durationMin, 'minute')
    const actualEnd = slotEnd.isAfter(endTime) ? endTime : slotEnd

    const next = sorted[idx]
    if (next && dayjs(next.isoStart).isSame(cur)) {
      // 已预约时段
      const isMyReservation = currentUserId && next.userId === currentUserId
      slots.push({
        id: `booked-${idx}`,
        startTime: dayjs(next.isoStart).format('HH:mm'),
        endTime: dayjs(next.isoEnd).format('HH:mm'),
        isoStart: next.isoStart,
        isoEnd: next.isoEnd,
        available: false,
        isPast: false,
        isMyReservation,
      })
      cur = dayjs(next.isoEnd)
      idx++
    } else {
      // 只要结束时间晚于当前时间，就显示为可预约（允许预约已经开始但还未结束的时间段）
      const isEnded = actualEnd.isBefore(now)
      const isStarted = cur.isBefore(now)
      slots.push({
        id: cur.toISOString(),
        startTime: cur.format('HH:mm'),
        endTime: actualEnd.format('HH:mm'),
        isoStart: cur.toISOString(),
        isoEnd: actualEnd.toISOString(),
        available: true,
        isPast: isEnded,
        isStarted,
      })
      cur = actualEnd
    }
  }
  return slots
}

// ===== 打开确认弹窗 =====
function openConfirmDialog(slot: any) {
  pendingSlot.value = slot
  quickRemarks.value = ''
  confirmDialogVisible.value = true
}

// ===== 一键确认预约 =====
async function confirmQuickBook() {
  if (!pendingSlot.value || !selectedRoom.value) return
  booking.value = true
  try {
    const fmt = 'YYYY-MM-DD HH:mm:ss'
    const startTime = dayjs(pendingSlot.value.isoStart).format(fmt)
    const endTime = dayjs(pendingSlot.value.isoEnd).format(fmt)

    const res = await reservationApi.quickCreate({
      roomId: selectedRoom.value.id,
      startTime,
      endTime,
      remarks: quickRemarks.value || undefined,
    })

    if (res?.code === 1) {
      confirmDialogVisible.value = false
      ElMessage.success('预约成功！时段已锁定，请按时到场签到')
      await loadSlots()
    } else {
      ElMessage.error(res?.msg || '预约失败')
      await loadSlots()
    }
  } catch (e: any) {
    // 错误已在拦截器中提示，这里只刷新时段
    await loadSlots()
  } finally {
    booking.value = false
  }
}

onMounted(() => loadRooms())
</script>

<style scoped>
/* ===== 页头 ===== */
.page-head {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--y2k-border);
}

.y2k-page-title {
  font-family: var(--y2k-font-pixel);
  font-size: 28px;
  font-weight: 400;
  color: var(--y2k-text);
  margin-bottom: 6px;
}

.y2k-page-sub {
  font-size: 13px;
  color: var(--y2k-text-muted);
  font-family: var(--y2k-font-body);
}

/* ===== 布局 ===== */
.content-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* ===== 左侧筛选 ===== */
.filter-sidebar {
  width: 200px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}

.y2k-filter-card {
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0px var(--y2k-shadow);
}

.y2k-filter-header {
  font-family: var(--y2k-font-pixel);
  font-size: 15px;
  color: var(--y2k-text);
  padding: 12px 16px;
  border-bottom: 2px solid var(--y2k-border);
  background: var(--y2k-bg-dark);
}

.y2k-filter-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.y2k-label {
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  color: var(--y2k-text);
}

.y2k-search-btn {
  width: 100%;
  padding: 10px;
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  background: var(--y2k-accent-pink);
  color: white;
  border: 2px solid var(--y2k-accent-pink-dark);
  box-shadow: 4px 4px 0px var(--y2k-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
}

.y2k-search-btn:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px var(--y2k-shadow);
  background: var(--y2k-accent-cyan);
  border-color: var(--y2k-accent-cyan-dark);
}

.y2k-reset-btn {
  width: 100%;
  padding: 8px;
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  background: var(--y2k-bg);
  color: var(--y2k-text);
  border: 2px solid var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
}

.y2k-reset-btn:hover {
  background: var(--y2k-bg-dark);
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px var(--y2k-shadow);
}

/* ===== 右侧内容 ===== */
.rooms-main { flex: 1; min-width: 0; }

.y2k-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
}

.rooms-count {
  font-family: var(--y2k-font-body);
  font-size: 13px;
  color: var(--y2k-text-muted);
}

.rooms-count strong {
  font-family: var(--y2k-font-pixel);
  color: var(--y2k-accent-pink);
  font-size: 16px;
}

.view-switch { display: flex; gap: 6px; }

.y2k-view-btn {
  width: 34px;
  height: 34px;
  font-size: 16px;
  background: var(--y2k-bg);
  border: 2px solid var(--y2k-border);
  box-shadow: 2px 2px 0px var(--y2k-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--y2k-text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.y2k-view-btn:hover,
.y2k-view-btn.active {
  background: var(--y2k-text);
  color: white;
  border-color: var(--y2k-text);
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px var(--y2k-shadow);
}

/* ===== 骨架屏 ===== */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.y2k-skeleton {
  background: linear-gradient(90deg, var(--y2k-bg-dark) 25%, var(--y2k-bg-card) 50%, var(--y2k-bg-dark) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border: 2px solid var(--y2k-border);
}

.y2k-skeleton { height: 200px; }
.slot-skeleton { height: 52px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== 空状态 ===== */
.y2k-empty {
  padding: 60px 0;
  text-align: center;
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0px var(--y2k-shadow);
}

.empty-icon { display: block; font-size: 48px; margin-bottom: 12px; }

.y2k-empty p {
  font-family: var(--y2k-font-pixel);
  color: var(--y2k-text-muted);
}

.y2k-empty-small {
  text-align: center;
  padding: 32px;
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  color: var(--y2k-text-muted);
}

/* ===== Y2K 卡片视图 ===== */
.rooms-card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.y2k-room-card {
  background: var(--y2k-bg-card);
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0px var(--y2k-shadow);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
}

.y2k-room-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px var(--y2k-shadow);
  border-color: var(--y2k-accent-pink);
}

.y2k-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--y2k-bg-dark);
  border-bottom: 2px solid var(--y2k-border);
}

.room-icon {
  font-size: 28px;
  color: var(--y2k-accent-pink);
  animation: y2k-float 3s ease-in-out infinite;
}

@keyframes y2k-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.y2k-status-badge {
  font-family: var(--y2k-font-pixel);
  font-size: 12px;
  padding: 4px 10px;
  border: 2px solid;
  box-shadow: 2px 2px 0px var(--y2k-shadow);
}

.badge-ok { background: #32cd32; border-color: #228b22; color: white; }
.badge-off { background: #808080; border-color: #555; color: white; }

.y2k-card-body {
  padding: 14px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.y2k-room-name {
  font-family: var(--y2k-font-pixel);
  font-size: 15px;
  color: var(--y2k-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.y2k-room-meta {
  display: flex;
  gap: 14px;
  font-size: 13px;
  color: var(--y2k-text-secondary);
  font-family: var(--y2k-font-body);
}

.y2k-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 22px;
}

.y2k-facility-chip {
  font-family: var(--y2k-font-pixel);
  font-size: 11px;
  padding: 2px 8px;
  background: var(--y2k-bg);
  border: 1px solid var(--y2k-border);
  color: var(--y2k-text);
}

.y2k-card-footer {
  padding: 12px 16px;
  border-top: 2px solid var(--y2k-border);
  background: var(--y2k-bg);
}

.y2k-book-btn {
  width: 100%;
  padding: 10px;
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  background: var(--y2k-accent-pink);
  color: white;
  border: 2px solid var(--y2k-accent-pink-dark);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
  animation: y2k-pulse-opacity 2.5s ease-in-out infinite;
}

.y2k-book-btn:hover {
  background: var(--y2k-text);
  border-color: var(--y2k-text);
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px var(--y2k-shadow);
  animation: none;
}

.y2k-book-btn-disabled {
  background: #aaa !important;
  border-color: #888 !important;
  cursor: not-allowed !important;
  animation: none !important;
  box-shadow: 2px 2px 0px #555 !important;
}

@keyframes y2k-pulse-opacity {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.82; }
}

/* ===== 列表视图 ===== */
.y2k-table-wrap {
  overflow-x: auto;
  border: 2px solid var(--y2k-border);
  box-shadow: 4px 4px 0px var(--y2k-shadow);
}

.y2k-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--y2k-bg-card);
}

.y2k-table th {
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  color: var(--y2k-text);
  background: var(--y2k-bg-dark);
  padding: 12px 14px;
  border-bottom: 2px solid var(--y2k-border);
  border-right: 1px solid var(--y2k-border);
  text-align: left;
}

.y2k-table td {
  font-family: var(--y2k-font-body);
  font-size: 13px;
  color: var(--y2k-text);
  padding: 10px 14px;
  border-bottom: 1px solid var(--y2k-border);
  border-right: 1px solid rgba(45, 0, 102, 0.15);
}

.y2k-table tr:hover td { background: var(--y2k-bg-dark); }

.y2k-table-btn {
  padding: 6px 14px;
  font-family: var(--y2k-font-pixel);
  font-size: 12px;
  background: var(--y2k-accent-pink);
  color: white;
  border: 2px solid var(--y2k-accent-pink-dark);
  box-shadow: 2px 2px 0px var(--y2k-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
}

.y2k-table-btn:hover {
  background: var(--y2k-text);
  border-color: var(--y2k-text);
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px var(--y2k-shadow);
}

.y2k-table-btn:disabled {
  background: #aaa;
  border-color: #888;
  cursor: not-allowed;
  box-shadow: 1px 1px 0px #555;
}

/* ===== 弹窗样式 ===== */
.y2k-dialog-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.y2k-dialog-title > span:first-child {
  font-family: var(--y2k-font-pixel);
  font-size: 18px;
  color: var(--y2k-text);
}

.y2k-dialog-sub {
  font-family: var(--y2k-font-body) !important;
  font-size: 13px !important;
  color: var(--y2k-text-muted) !important;
  text-shadow: none !important;
}

/* 时段弹窗内容 */
.slot-dialog-content { padding: 4px 0; }

.slot-date-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--y2k-border);
}

.slots-loading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ===== 时段方块 Grid（2 列）===== */
.dialog-slot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.dialog-slot-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 8px;
  min-height: 88px;
  text-align: center;
  border: 2px solid var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  transition: all 0.2s ease;
  position: relative;
  gap: 6px;
}

.slot-free {
  background: #f0fdf4;
  border-color: #86efac;
  cursor: pointer;
}

.slot-free:hover {
  border-color: #22c55e;
  box-shadow: 4px 4px 0px var(--y2k-shadow);
  transform: translate(-2px, -2px);
}

.slot-booked {
  background: var(--y2k-bg);
  border-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.6;
}

.slot-past {
  background: var(--y2k-bg-dark);
  border-color: #e5e7eb;
  cursor: not-allowed;
  opacity: 0.4;
}

.slot-block-time {
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  color: var(--y2k-text);
  line-height: 1.4;
}

.slot-block-status {
  font-size: 11px;
  font-family: var(--y2k-font-body);
}

.free-text { color: #16a34a; font-weight: 600; }
.booked-text { color: #9ca3af; }
.past-text { color: #d1d5db; }
.ongoing-text { color: #f59e0b; font-weight: 600; }

.slot-lock-sm { font-size: 14px; }

.pulse-dot-sm {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse-green 1.8s ease-out infinite;
}

@keyframes pulse-green {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* ===== 确认弹窗内容 ===== */
.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 0;
}

.confirm-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 2px solid var(--y2k-border);
  background: var(--y2k-bg);
}

.confirm-label {
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  color: var(--y2k-text-muted);
  flex-shrink: 0;
  min-width: 40px;
}

.confirm-value {
  font-family: var(--y2k-font-pixel);
  font-size: 14px;
  color: var(--y2k-text);
}

.confirm-value.pink {
  color: var(--y2k-accent-pink);
}

.confirm-tip {
  font-family: var(--y2k-font-body);
  font-size: 12px;
  color: #92400e;
  background: #fffbeb;
  padding: 8px 12px;
  border: 2px solid #fde68a;
  box-shadow: 2px 2px 0px var(--y2k-shadow);
}

.confirm-remarks { width: 100%; }

/* 弹窗按钮 */
.y2k-cancel-btn {
  padding: 10px 20px;
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  background: var(--y2k-bg);
  color: var(--y2k-text);
  border: 2px solid var(--y2k-border);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 10px;
}

.y2k-cancel-btn:hover {
  background: var(--y2k-bg-dark);
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px var(--y2k-shadow);
}

.y2k-cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.y2k-confirm-btn {
  padding: 10px 20px;
  font-family: var(--y2k-font-pixel);
  font-size: 13px;
  background: var(--y2k-accent-pink);
  color: white;
  border: 2px solid var(--y2k-accent-pink-dark);
  box-shadow: 3px 3px 0px var(--y2k-shadow);
  cursor: pointer;
  transition: all 0.2s ease;
}

.y2k-confirm-btn:hover {
  background: var(--y2k-text);
  border-color: var(--y2k-text);
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px var(--y2k-shadow);
}

.y2k-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .rooms-card-grid { grid-template-columns: repeat(2, 1fr); }
  .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .content-layout { flex-direction: column; }
  .filter-sidebar { width: 100%; position: static; }
  .rooms-card-grid { grid-template-columns: 1fr; }
  .skeleton-grid { grid-template-columns: 1fr; }
  .dialog-slot-grid { grid-template-columns: 1fr 1fr; }
}
</style>
