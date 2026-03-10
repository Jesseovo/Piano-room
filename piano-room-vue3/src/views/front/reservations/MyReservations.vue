<template>
  <div class="my-reservations-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>我的预约</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 练琴时长统计 -->
      <div class="stats-banner">
        <el-icon size="32" color="#fff"><Timer /></el-icon>
        <div class="stats-text">
          <div class="stats-num">{{ (totalMinutes / 60).toFixed(1) }}</div>
          <div class="stats-label">累计练琴时长（小时）</div>
        </div>
        <div class="stats-divider"></div>
        <el-icon size="32" color="#fff"><Clock /></el-icon>
        <div class="stats-text">
          <div class="stats-num">{{ totalMinutes }}</div>
          <div class="stats-label">累计练琴分钟数</div>
        </div>
      </div>

      <!-- 预约列表 -->
      <el-card shadow="never">
        <template #header>
          <div class="list-header">
            <span class="list-title">我的预约记录</span>
            <div class="status-filter">
              <el-radio-group v-model="statusFilter" size="small" @change="handleFilterChange">
                <el-radio-button value="">全部</el-radio-button>
                <el-radio-button value="approved">已预约</el-radio-button>
                <el-radio-button value="completed">已完成</el-radio-button>
                <el-radio-button value="cancelled">已取消</el-radio-button>
                <el-radio-button value="occupied">违约</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>

        <el-skeleton v-if="loading" :rows="5" animated />

        <el-empty
          v-else-if="reservations.length === 0"
          description="暂无预约记录"
        >
          <el-button type="primary" @click="router.push('/rooms')">立即预约</el-button>
        </el-empty>

        <el-timeline v-else>
          <el-timeline-item
            v-for="r in reservations"
            :key="r.id"
            :type="statusTypeMap[r.status] || 'primary'"
            :color="statusColorMap[r.status]"
            :timestamp="dayjs(r.createdAt).format('YYYY-MM-DD')"
            placement="top"
            size="large"
          >
            <el-card class="reservation-card" shadow="hover">
              <div class="res-header">
                <div class="res-title-row">
                  <span class="res-title">{{ r.title || '琴房预约' }}</span>
                  <el-tag :type="statusTypeMap[r.status] || 'primary'" size="small">
                    {{ statusLabelMap[r.status] || r.status }}
                  </el-tag>
                </div>
                <div class="res-time">
                  <el-icon><Clock /></el-icon>
                  {{ dayjs(r.startTime).format('MM-DD HH:mm') }} ~ {{ dayjs(r.endTime).format('HH:mm') }}
                </div>
              </div>

              <div class="res-body">
                <span class="res-info"><el-icon><House /></el-icon> {{ r.roomName || '-' }}</span>
                <span class="res-info"><el-icon><User /></el-icon> {{ r.attendees || 1 }}人</span>
                <span class="res-info" v-if="r.phone"><el-icon><Phone /></el-icon> {{ r.phone }}</span>
              </div>

              <div class="res-footer">
                <el-button text size="small" @click="router.push(`/reservations/${r.id}`)">
                  <el-icon><Document /></el-icon> 详情
                </el-button>
                <el-button
                  v-if="canCancel(r.status)"
                  text type="danger" size="small"
                  @click="handleCancel(r)"
                >取消预约</el-button>
                <template v-if="r.status === 'approved'">
                  <el-button
                    :type="r.signStartTime ? 'info' : 'success'"
                    size="small"
                    :disabled="!!r.signStartTime || actionLoading"
                    @click="handleSignIn(r)"
                  >{{ r.signStartTime ? '已签到' : '签到' }}</el-button>
                  <el-button
                    :type="r.signEndTime ? 'info' : 'warning'"
                    size="small"
                    :disabled="!!r.signEndTime || actionLoading"
                    @click="handleSignOut(r)"
                  >{{ r.signEndTime ? '已签退' : '签退' }}</el-button>
                </template>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <el-pagination
          v-if="total > 0"
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          class="pagination"
          @change="loadData"
        />
      </el-card>
    </div>

    <!-- 取消预约弹窗 -->
    <el-dialog v-model="cancelDialogVisible" title="取消预约" width="400px">
      <p class="cancel-msg">您确定要取消此次预约吗？</p>
      <p class="cancel-warn">取消后将不可恢复，请谨慎操作。</p>
      <el-form ref="cancelFormRef" :model="cancelForm" :rules="cancelRules">
        <el-form-item label="取消原因" prop="reason">
          <el-input v-model="cancelForm.reason" type="textarea" :rows="3" placeholder="请简要说明取消原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDialogVisible = false">关闭</el-button>
        <el-button type="danger" :loading="cancelling" @click="confirmCancel">确认取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import dayjs from 'dayjs'
import { reservationApi } from '@/api/reservation'
import { useAuthStore } from '@/stores/auth'
import type { Reservation } from '@/api/types'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const actionLoading = ref(false)
const cancelling = ref(false)
const reservations = ref<Reservation[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref('')
const cancelDialogVisible = ref(false)
const currentReservation = ref<Reservation | null>(null)
const cancelFormRef = ref<FormInstance>()
const totalMinutes = ref(0)

const cancelForm = ref({ reason: '' })
const cancelRules: FormRules = {
  reason: [{ required: true, message: '请输入取消原因', trigger: 'blur' }],
}

type TagType = '' | 'primary' | 'success' | 'warning' | 'info' | 'danger'
const statusTypeMap: Record<string, TagType> = {
  approved: 'primary', completed: 'success', cancelled: 'info', occupied: 'danger',
}
const statusColorMap: Record<string, string> = {
  approved: '#409EFF', completed: '#67C23A',
  cancelled: '#909399', occupied: '#F56C6C',
}
const statusLabelMap: Record<string, string> = {
  approved: '已预约', completed: '已完成', cancelled: '已取消', occupied: '违约',
}

async function loadTotalHours() {
  try {
    const res = await reservationApi.listPracticeDuration({
      userId: authStore.user?.id,
      pageNum: 1,
      pageSize: 9999,
    })
    if (res?.code === 1) {
      const rows = res.data?.rows || []
      let mins = 0
      rows.forEach((item: Record<string, unknown>) => {
        if (item.signStartTime && item.signEndTime) {
          mins += dayjs(item.signEndTime as string).diff(dayjs(item.signStartTime as string), 'minute')
        }
      })
      totalMinutes.value = mins
    }
  } catch {}
}

async function loadData() {
  loading.value = true
  try {
    const res = await reservationApi.list({
      pageNum: page.value,
      pageSize: pageSize.value,
      userId: authStore.user?.id,
      status: statusFilter.value || undefined,
    })
    if (res?.code === 1) {
      reservations.value = res.data?.rows || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

function handleFilterChange() { page.value = 1; loadData() }

function canCancel(status: string) { return status === 'approved' }

function handleCancel(r: Reservation) {
  currentReservation.value = r
  cancelForm.value.reason = ''
  cancelDialogVisible.value = true
}

async function confirmCancel() {
  await cancelFormRef.value?.validate(async (valid) => {
    if (!valid) return
    cancelling.value = true
    try {
      const res = await reservationApi.cancel(currentReservation.value!.id, cancelForm.value.reason)
      if (res?.code === 1) {
        ElMessage.success('预约已取消')
        cancelDialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res?.msg || '取消失败')
      }
    } finally {
      cancelling.value = false
    }
  })
}

async function handleSignIn(r: Reservation) {
  const now = dayjs()
  if (now.isBefore(dayjs(r.startTime)) || now.isAfter(dayjs(r.endTime))) {
    ElMessage.warning('不在预约时间内，无法签到')
    return
  }
  actionLoading.value = true
  try {
    const res = await reservationApi.signIn(r.id)
    if (res?.code === 1) { ElMessage.success('签到成功'); loadData() }
    else ElMessage.error(res?.msg || '签到失败')
  } finally { actionLoading.value = false }
}

async function handleSignOut(r: Reservation) {
  if (!r.signStartTime) { ElMessage.warning('请先签到'); return }
  actionLoading.value = true
  try {
    const res = await reservationApi.signOut(r.id)
    if (res?.code === 1) { ElMessage.success('签退成功'); loadData() }
    else ElMessage.error(res?.msg || '签退失败')
  } finally { actionLoading.value = false }
}

onMounted(() => { loadData(); loadTotalHours() })
</script>

<style scoped>
.my-reservations-page { padding: 20px 0; min-height: calc(100vh - 124px); }
.container { max-width: 900px; margin: 0 auto; padding: 0 20px; }
.breadcrumb { margin-bottom: 16px; }

.stats-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  padding: 24px 32px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.stats-num { font-size: 32px; font-weight: 700; }
.stats-label { font-size: 13px; opacity: 0.85; margin-top: 2px; }
.stats-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.3); margin: 0 16px; }

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.list-title { font-weight: 600; font-size: 15px; }
.status-filter { }

.reservation-card { }
.res-header { padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; margin-bottom: 10px; }
.res-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.res-title { font-weight: 600; font-size: 15px; }
.res-time { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #606266; }
.res-body {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}
.res-info { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #606266; }
.res-footer { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }

.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }

.cancel-msg { font-size: 15px; margin-bottom: 8px; }
.cancel-warn { color: #f56c6c; font-size: 13px; margin-bottom: 16px; }

@media (max-width: 768px) {
  .container { padding: 0 12px; }
  .stats-banner { padding: 16px 20px; }
  .status-filter { width: 100%; overflow-x: auto; }
  .list-header { flex-direction: column; align-items: flex-start; }
}
</style>
