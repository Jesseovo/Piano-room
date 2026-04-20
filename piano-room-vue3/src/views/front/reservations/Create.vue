<template>
  <div class="page-wrapper">
    <div class="page-container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/rooms' }">预约琴房</el-breadcrumb-item>
        <el-breadcrumb-item>创建预约</el-breadcrumb-item>
      </el-breadcrumb>

      <el-row :gutter="24" style="margin-top:20px">
        <!-- 左侧：表单 -->
        <el-col :xs="24" :md="15">
          <el-card class="form-card" shadow="never">
            <template #header>
              <div class="card-head">
                <el-icon size="18" :color="'var(--color-primary)'"><EditPen /></el-icon>
                <span class="card-head-title">填写预约信息</span>
                <el-tag v-if="room" type="primary" effect="light" class="room-tag">
                  {{ room.name }}
                </el-tag>
              </div>
            </template>

            <el-skeleton v-if="loadingRoom" :rows="6" animated />

            <el-form
              v-else
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="100px"
              label-position="left"
              class="reserve-form"
            >
              <el-form-item label="预约标题" prop="title">
                <el-input
                  v-model="form.title"
                  placeholder="例如：练习巴赫无伴奏"
                  maxlength="50"
                  show-word-limit
                  clearable
                />
              </el-form-item>

              <el-row :gutter="16">
                <el-col :xs="24" :sm="12">
                  <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker
                      v-model="form.startTime"
                      type="datetime"
                      placeholder="选择开始时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      format="MM-DD HH:mm"
                      :disabled-date="disabledDate"
                      :default-time="defaultStartTime"
                      style="width:100%"
                      @change="handleStartChange"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item label="结束时间" prop="endTime">
                    <el-date-picker
                      v-model="form.endTime"
                      type="datetime"
                      placeholder="选择结束时间"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      format="MM-DD HH:mm"
                      :disabled-date="disabledDate"
                      style="width:100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="使用人数" prop="attendees">
                <el-input-number v-model="form.attendees" :min="1" :max="50" :step="1" style="width:140px" />
                <span class="form-tip">人</span>
              </el-form-item>

              <el-form-item label="使用目的" prop="purpose">
                <el-radio-group v-model="form.purpose">
                  <el-radio-button value="practice">个人练习</el-radio-button>
                  <el-radio-button value="ensemble">合奏排练</el-radio-button>
                  <el-radio-button value="study">课程学习</el-radio-button>
                  <el-radio-button value="other">其他</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="备注说明">
                <el-input
                  v-model="form.remarks"
                  type="textarea"
                  :rows="3"
                  placeholder="其他补充说明（选填）"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>

              <!-- 冲突警告 -->
              <el-alert
                v-if="conflictMsg"
                :title="conflictMsg"
                type="warning"
                show-icon
                :closable="false"
                style="margin-bottom:20px"
              />

              <div class="form-actions">
                <el-button type="info" plain size="large" @click="router.back()">← 返回</el-button>
                <el-button
                  type="primary"
                  size="large"
                  :loading="submitting"
                  class="submit-btn"
                  @click="handleSubmit"
                >提交预约申请</el-button>
              </div>
            </el-form>
          </el-card>
        </el-col>

        <!-- 右侧：琴房信息 + 须知 -->
        <el-col :xs="24" :md="9">
          <!-- 琴房信息卡片 -->
          <el-card v-if="room" class="room-info-card" shadow="never">
            <template #header>
              <span class="card-head-title">
                <el-icon><House /></el-icon> 预约琴房
              </span>
            </template>
            <div class="room-info-banner" :style="{ background: roomGradient }">
              <el-icon size="36" color="#333"><Headset /></el-icon>
              <div class="room-info-text">
                <div class="room-info-name" style="color: #333;">{{ room.name }}</div>
                <el-tag :type="room.status === 1 ? 'success' : 'danger'" size="small" effect="light">
                  {{ room.status === 1 ? '可预约' : '维护中' }}
                </el-tag>
              </div>
            </div>
            <div class="room-info-details">
              <div class="detail-row">
                <el-icon><Location /></el-icon>
                <span>{{ room.buildingName || '综合楼' }}</span>
              </div>
              <div class="detail-row">
                <el-icon><User /></el-icon>
                <span>容量 {{ room.capacity || '-' }} 人</span>
              </div>
              <div class="detail-row" v-if="room.facilities">
                <el-icon><Tools /></el-icon>
                <span>{{ getFacilitiesText(room.facilities) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 使用须知 -->
          <el-card class="notice-card" shadow="never">
            <template #header>
              <span class="card-head-title">
                <el-icon><Warning /></el-icon> 预约须知
              </span>
            </template>
            <ul class="notice-list">
              <li>提交申请后，等待管理员审核通过方可使用</li>
              <li>开放时间：每日 <strong>{{ slotStartHour }}:00 - {{ slotEndHour }}:00</strong></li>
              <li>超过预约开始时间 <strong>{{ signInGrace }} 分钟</strong>未签到，系统自动释放</li>
              <li>每月爽约超过 <strong>{{ maxNoShow }} 次</strong>将暂停预约权限</li>
              <li>请爱护琴房设备，发现问题及时联系管理员</li>
            </ul>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import dayjs from 'dayjs'
import { roomApi } from '@/api/room'
import { reservationApi } from '@/api/reservation'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const maxAdvanceDays = computed(() => settingsStore.reservationSettings?.maxAdvanceDays ?? 7)
const signInGrace = computed(() => settingsStore.reservationSettings?.signInGrace ?? 10)
const maxNoShow = computed(() => settingsStore.reservationSettings?.maxNoShow ?? 3)
const slotStartHour = computed(() => settingsStore.basicSettings?.slotStartHour ?? 8)
const slotEndHour = computed(() => settingsStore.basicSettings?.slotEndHour ?? 22)

const formRef = ref<FormInstance>()
const loadingRoom = ref(false)
const submitting = ref(false)
const room = ref<any>(null)
const conflictMsg = ref('')

const roomId = Number(route.params.roomId) || undefined
const queryStart = route.query.start as string
const queryEnd = route.query.end as string

const defaultStartTime = computed(() => new Date(0, 0, 0, slotStartHour.value, 0, 0))

const roomGradient = computed(() => {
  const gradients = [
    'linear-gradient(135deg,#3b82f6,#6366f1)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f59e0b,#d97706)',
    'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  ]
  return gradients[(room.value?.id || 0) % gradients.length]
})

const form = reactive({
  title: '',
  startTime: queryStart ? dayjs(queryStart).format('YYYY-MM-DD HH:mm:ss') : '',
  endTime: queryEnd ? dayjs(queryEnd).format('YYYY-MM-DD HH:mm:ss') : '',
  attendees: 1,
  purpose: 'practice',
  remarks: '',
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入预约标题', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  purpose: [{ required: true, message: '请选择使用目的', trigger: 'change' }],
}

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

function handleStartChange(val: string) {
  if (val && !form.endTime) {
    form.endTime = dayjs(val).add(2, 'hour').format('YYYY-MM-DD HH:mm:ss')
  }
  conflictMsg.value = ''
}

function getFacilitiesText(facilities: string): string {
  if (!facilities) return ''
  try {
    if (facilities.startsWith('[')) return JSON.parse(facilities).join('、')
  } catch { /* ignore */ }
  return facilities.split(',').map((s: string) => s.trim()).filter(Boolean).join('、')
}

async function loadRoom() {
  if (!roomId) {
    ElMessage.warning('未选择琴房，请先从琴房列表选择')
    router.push('/rooms')
    return
  }
  loadingRoom.value = true
  try {
    const res = await roomApi.getById(roomId)
    if (res?.code === 1) {
      room.value = res.data
      if (!res.data || res.data.status !== 1) {
        ElMessage.error('该琴房不可用，请重新选择')
        router.push('/rooms')
      }
    }
  } finally {
    loadingRoom.value = false
  }
}

async function handleSubmit() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    const start = dayjs(form.startTime)
    const end = dayjs(form.endTime)
    if (end.isBefore(start)) {
      ElMessage.warning('结束时间不能早于开始时间')
      return
    }
    const startH = start.hour() * 60 + start.minute()
    const endH = end.hour() * 60 + end.minute()
    if (startH < slotStartHour.value * 60 || endH > slotEndHour.value * 60) {
      ElMessage.warning(`预约时间需在 ${slotStartHour.value}:00 - ${slotEndHour.value}:00 之间`)
      return
    }
    if (!roomId) {
      ElMessage.warning('请先选择要预约的琴房')
      router.push('/rooms')
      return
    }
    submitting.value = true
    conflictMsg.value = ''
    try {
      const res = await reservationApi.create({
        roomId,
        title: form.title,
        purpose: form.purpose,
        startTime: form.startTime,
        endTime: form.endTime,
        attendees: form.attendees,
        remarks: form.remarks,
      })
      if (res?.code === 1) {
        ElMessage.success('预约成功！已自动生效，请按时签到')
        router.push('/my-reservations')
      } else {
        const msg = res?.msg || '预约失败，请稍后重试'
        conflictMsg.value = msg
        // 错误已在拦截器中提示，这里只更新UI状态
      }
    } catch (error: any) {
      const msg = error?.response?.data?.msg || error?.message || '网络异常，请稍后重试'
      conflictMsg.value = msg
      // 错误已在拦截器中提示，这里只更新UI状态
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  if (!authStore.isLoggedIn) { router.push('/login'); return }
  loadRoom()
})
</script>

<style scoped>
.breadcrumb { margin-bottom: 0; }

.form-card, .room-info-card, .notice-card {
  border-radius: 12px;
  margin-bottom: 16px;
  border-color: var(--color-border) !important;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-head-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.room-tag { margin-left: auto; }

.reserve-form { margin-top: 8px; }

.form-tip { margin-left: 10px; font-size: 13px; color: var(--color-text-muted); }

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
}

.submit-btn {
  background: linear-gradient(135deg, #409eff, #1677ff) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 600;
  min-width: 140px;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4) !important;
  transition: all 0.25s ease !important;
}
.submit-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5) !important;
}

/* 右侧信息卡 */
.room-info-banner {
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  background: var(--gradient-warm) !important;
}
.room-info-name { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 6px; }

.room-info-details { display: flex; flex-direction: column; gap: 10px; }
.detail-row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--color-text-secondary); }

/* 须知 */
.notice-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.notice-list li {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.7;
  padding-left: 18px;
  position: relative;
}
.notice-list li::before {
  content: '♩';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-size: 14px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .card-head {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .room-tag {
    margin-left: 0;
  }

  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .form-actions :deep(.el-button),
  .submit-btn {
    width: 100%;
    min-width: 0;
    margin-left: 0;
  }

  .reserve-form :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .reserve-form :deep(.el-radio-button) {
    flex: 1 1 calc(50% - 8px);
  }

  .room-info-banner {
    padding: 16px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .reserve-form :deep(.el-radio-button) {
    flex-basis: 100%;
  }

  .room-info-banner {
    flex-direction: column;
  }

  .detail-row {
    align-items: flex-start;
  }
}
</style>
