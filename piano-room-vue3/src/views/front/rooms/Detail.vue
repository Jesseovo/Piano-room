<template>
  <div class="room-detail-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/rooms' }">琴房查找</el-breadcrumb-item>
        <el-breadcrumb-item>琴房详情</el-breadcrumb-item>
      </el-breadcrumb>

      <el-skeleton v-if="loading" :rows="8" animated />

      <template v-else-if="room">
        <el-row :gutter="20">
          <!-- 左侧：基本信息 -->
          <el-col :xs="24" :md="16">
            <el-card class="info-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <div class="room-title-row">
                    <el-icon size="24" color="#409eff"><Headset /></el-icon>
                    <h2 class="room-title">{{ room.name }}</h2>
                    <el-tag :type="room.status === 1 ? 'success' : 'danger'">
                      {{ room.status === 1 ? '可预约' : '维护中' }}
                    </el-tag>
                  </div>
                </div>
              </template>

              <el-descriptions :column="2" border class="info-desc">
                <el-descriptions-item label="房间号">{{ room.roomNumber }}</el-descriptions-item>
                <el-descriptions-item label="楼层">{{ room.floor }}层</el-descriptions-item>
                <el-descriptions-item label="容量">{{ room.capacity }}人</el-descriptions-item>
                <el-descriptions-item label="类型">{{ (room as any).type || '-' }}</el-descriptions-item>
                <el-descriptions-item label="院系">{{ (room as any).departmentName || '-' }}</el-descriptions-item>
                <el-descriptions-item label="开放时间">{{ settingsStore.basicSettings?.slotStartHour ?? 8 }}:00 - {{ settingsStore.basicSettings?.slotEndHour ?? 22 }}:00</el-descriptions-item>
              </el-descriptions>

              <div class="section" v-if="room.facilities">
                <h4 class="section-title">设施设备</h4>
                <div class="facility-tags">
                  <el-tag
                    v-for="f in facilitiesList"
                    :key="f"
                    type="info"
                    effect="plain"
                    size="small"
                    class="facility-tag"
                  >{{ f }}</el-tag>
                </div>
              </div>

              <div class="section" v-if="room.description">
                <h4 class="section-title">琴房描述</h4>
                <p class="description">{{ room.description }}</p>
              </div>

              <div class="section">
                <h4 class="section-title">使用须知</h4>
                <ol class="notes-list">
                  <li>预约成功后请按时使用，如需取消请提前操作</li>
                  <li>请爱护琴房设施，保持琴房卫生</li>
                  <li>使用结束后请关闭电源、门窗</li>
                  <li>禁止在琴房内吸烟、饮食</li>
                  <li>如设备使用有问题，请联系管理员</li>
                </ol>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧：时段选择（图书馆式） -->
          <el-col :xs="24" :md="8">
            <el-card class="timeslot-card" shadow="never">
              <template #header>
                <div class="ts-header">
                  <span class="ts-title">
                    <el-icon><Calendar /></el-icon>
                    选择时段
                  </span>
                  <el-date-picker
                    v-model="selectedDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    size="small"
                    :disabled-date="disabledDate"
                    @change="loadTimeSlots"
                    style="width: 130px"
                  />
                </div>
              </template>

              <!-- 加载中 -->
              <div v-if="loadingSlots" class="slots-loading">
                <div v-for="i in 4" :key="i" class="slot-skeleton" />
              </div>

              <!-- 无时段 -->
              <div v-else-if="timeSlots.length === 0">
                <el-empty description="暂无可用时段" :image-size="80" />
              </div>

              <!-- 时段列表 -->
              <div v-else class="timeslot-list">
                <div
                  v-for="slot in timeSlots"
                  :key="slot.id"
                  class="timeslot-item"
                  :class="[slot.available ? 'slot-free' : 'slot-booked', slot.isPast ? 'slot-past' : '']"
                  @click="slot.available && !slot.isPast && handleSlotClick(slot)"
                >
                  <div class="slot-left">
                    <span class="slot-time">{{ slot.startTime }} - {{ slot.endTime }}</span>
                    <span class="slot-hint" v-if="slot.available && !slot.isPast && !slot.isStarted">点击立即抢占</span>
                    <span class="slot-hint ongoing-hint" v-else-if="slot.available && !slot.isPast && slot.isStarted">进行中可约</span>
                    <span class="slot-hint past-hint" v-else-if="slot.isPast">已过期</span>
                    <span class="slot-hint booked-hint" v-else-if="slot.isMyReservation">已预约</span>
                    <span class="slot-hint booked-hint" v-else>已满员</span>
                  </div>
                  <div class="slot-right">
                    <div v-if="slot.available && !slot.isPast" class="pulse-dot" />
                    <el-icon v-else-if="slot.isPast" class="slot-icon past-icon"><Clock /></el-icon>
                    <el-icon v-else class="slot-icon booked-icon"><Lock /></el-icon>
                  </div>
                </div>
              </div>

              <div class="book-footer">
                <el-button
                  type="primary"
                  class="book-btn"
                  :disabled="room.status !== 1"
                  @click="router.push(`/reservations/create/${roomId}`)"
                >
                  自定义预约（高级）
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <el-empty v-else description="琴房不存在或已下线" />
    </div>

    <!-- 快速预约确认对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="确认预约"
      width="420px"
      :close-on-click-modal="false"
      class="quick-dialog"
    >
      <div class="dialog-content" v-if="pendingSlot">
        <div class="confirm-room">
          <el-icon size="20" color="#409eff"><Headset /></el-icon>
          <span class="confirm-room-name">{{ room?.name }}</span>
        </div>

        <div class="confirm-time">
          <el-icon color="#67C23A"><Clock /></el-icon>
          <span>{{ selectedDate }} &nbsp; {{ pendingSlot.startTime }} - {{ pendingSlot.endTime }}</span>
        </div>

        <div class="confirm-tip">
          <el-icon color="#E6A23C"><Warning /></el-icon>
          <span>预约成功后即时生效，请按时到场使用</span>
        </div>

        <div class="remarks-row">
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
        <el-button @click="dialogVisible = false" :disabled="booking">取消</el-button>
        <el-button type="primary" @click="confirmQuickBook" :loading="booking">
          {{ booking ? '抢占中...' : '确认预约' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Headset, Calendar, Clock, Lock, Warning } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { roomApi } from '@/api/room'
import { reservationApi } from '@/api/reservation'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import type { Room } from '@/api/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const maxAdvanceDays = computed(() => settingsStore.reservationSettings?.maxAdvanceDays ?? 7)

const loading = ref(true)
const loadingSlots = ref(false)
const room = ref<Room | null>(null)
const timeSlots = ref<any[]>([])
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))

// 快速预约对话框状态
const dialogVisible = ref(false)
const pendingSlot = ref<any>(null)
const quickRemarks = ref('')
const booking = ref(false)

const roomId = computed((): number => Number(route.params.id as string))

const facilitiesList = computed(() => {
  if (!room.value?.facilities) return []
  try {
    const f = room.value.facilities
    if (f.startsWith('[')) return JSON.parse(f)
    return f.split(',').map((s: string) => s.trim()).filter(Boolean)
  } catch {
    return [room.value.facilities]
  }
})

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

  return false
}

async function loadRoom() {
  loading.value = true
  try {
    const res = await roomApi.getById(roomId.value)
    if (res?.code === 1 && res.data) {
      room.value = res.data
    }
  } finally {
    loading.value = false
  }
}

async function loadTimeSlots() {
  loadingSlots.value = true
  try {
    const id: number = roomId.value
    const res = await reservationApi.getAvailability(id, selectedDate.value)
    if (res?.code === 1 && res.data) {
      timeSlots.value = generateSlots(res.data as any[])
    } else {
      timeSlots.value = generateSlots([])
    }
  } catch {
    timeSlots.value = generateSlots([])
  } finally {
    loadingSlots.value = false
  }
}

function generateSlots(booked: any[]) {
  const slots: any[] = []
  const date = selectedDate.value
  const now = dayjs()
  const startHour = settingsStore.basicSettings?.slotStartHour ?? 8
  const endHour = settingsStore.basicSettings?.slotEndHour ?? 22
  const currentUserId = authStore.user?.id
  let cur = dayjs(date).hour(startHour).minute(0)
  const end = dayjs(date).hour(endHour).minute(0)

  const sorted = [...booked].sort((a, b) => dayjs(a.isoStart).valueOf() - dayjs(b.isoStart).valueOf())

  let idx = 0
  while (cur.isBefore(end)) {
    const next = sorted[idx]
    const slotEnd = cur.add(2, 'hour')
    const actualEnd = slotEnd.isAfter(end) ? end : slotEnd

    if (next && (cur.isSame(dayjs(next.isoStart)) || !cur.isBefore(dayjs(next.isoStart)))) {
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
        id: `${cur.toISOString()}`,
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

    if (idx >= sorted.length && cur.isSame(actualEnd)) {
      while (cur.isBefore(end)) {
        const sEnd = cur.add(2, 'hour')
        const aEnd = sEnd.isAfter(end) ? end : sEnd
        // 只要结束时间晚于当前时间，就显示为可预约
        const isEnded = aEnd.isBefore(now)
        const isStarted = cur.isBefore(now)
        slots.push({
          id: cur.toISOString(),
          startTime: cur.format('HH:mm'),
          endTime: aEnd.format('HH:mm'),
          isoStart: cur.toISOString(),
          isoEnd: aEnd.toISOString(),
          available: true,
          isPast: isEnded,
          isStarted,
        })
        cur = aEnd
      }
      break
    }
  }
  return slots
}

function handleSlotClick(slot: any) {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再预约')
    router.push('/login')
    return
  }
  if (room.value?.status !== 1) {
    ElMessage.warning('该琴房当前不可预约')
    return
  }
  pendingSlot.value = slot
  quickRemarks.value = ''
  dialogVisible.value = true
}

async function confirmQuickBook() {
  if (!pendingSlot.value) return
  booking.value = true
  try {
    const fmt = 'YYYY-MM-DD HH:mm:ss'
    const startTime = dayjs(pendingSlot.value.isoStart).format(fmt)
    const endTime = dayjs(pendingSlot.value.isoEnd).format(fmt)

    const res = await reservationApi.quickCreate({
      roomId: roomId.value,
      startTime,
      endTime,
      remarks: quickRemarks.value || undefined,
    })

    if (res?.code === 1) {
      dialogVisible.value = false
      ElMessage.success('预约成功！时段已锁定，请按时到场')
      // 刷新时段状态
      await loadTimeSlots()
    } else {
      ElMessage.error(res?.msg || '预约失败')
      // 刷新时段，让用户看到最新状态
      await loadTimeSlots()
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '网络异常，请稍后重试')
    await loadTimeSlots()
  } finally {
    booking.value = false
  }
}

onMounted(() => {
  loadRoom()
  loadTimeSlots()
})
</script>

<style scoped>
.room-detail-page {
  padding: 20px 0;
  min-height: calc(100vh - 124px);
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
.breadcrumb {
  margin-bottom: 16px;
}
.info-card {
  margin-bottom: 16px;
}
.card-header {}
.room-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.room-title {
  font-size: 20px;
  margin: 0;
  flex: 1;
}
.info-desc {
  margin-bottom: 20px;
}
.section {
  margin-top: 20px;
}
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}
.facility-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.description {
  font-size: 14px;
  color: #606266;
  line-height: 1.7;
}
.notes-list {
  padding-left: 20px;
  margin: 0;
}
.notes-list li {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
}

/* 时段卡片 */
.timeslot-card {
  position: sticky;
  top: 80px;
}
.ts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ts-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 15px;
}

/* 骨架屏 */
.slots-loading {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}
.slot-skeleton {
  height: 58px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 时段列表 */
.timeslot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.timeslot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #ebeef5;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

/* 空闲时段：绿色，可点击 */
.slot-free {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
  cursor: pointer;
}
.slot-free:hover {
  border-color: #22c55e;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.2);
  transform: translateY(-2px);
}
.slot-free:active {
  transform: translateY(0);
}

/* 已占用：灰色遮罩 */
.slot-booked {
  background: #f9fafb;
  border-color: #e5e7eb;
  cursor: not-allowed;
  opacity: 0.75;
}

/* 已过期 */
.slot-past {
  background: #f8f9fa;
  border-color: #dee2e6;
  cursor: not-allowed;
  opacity: 0.55;
}

.slot-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.slot-time {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
.slot-hint {
  font-size: 12px;
  color: #22c55e;
  font-weight: 500;
}
.booked-hint {
  color: #9ca3af;
}
.past-hint {
  color: #d1d5db;
}
.ongoing-hint {
  color: #f59e0b;
  font-weight: 600;
}

.slot-right {
  display: flex;
  align-items: center;
}
.slot-icon {
  font-size: 16px;
}
.booked-icon {
  color: #d1d5db;
}
.past-icon {
  color: #e5e7eb;
}

/* 脉冲绿点动效（空闲时段） */
.pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  animation: pulse 1.8s ease-out infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.book-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
.book-btn {
  width: 100%;
}

/* 快速预约对话框 */
.quick-dialog :deep(.el-dialog__header) {
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 0;
}
.confirm-room {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.confirm-room-name {
  color: #409eff;
}
.confirm-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  background: #f0fdf4;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #dcfce7;
}
.confirm-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #92400e;
  background: #fffbeb;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #fde68a;
}
.remarks-row {
  width: 100%;
}

@media (max-width: 768px) {
  .timeslot-card {
    position: static;
  }
  .container {
    padding: 0 12px;
  }
}
</style>
