<template>
  <div class="detail-page">
    <div class="container">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/my-reservations' }">我的预约</el-breadcrumb-item>
        <el-breadcrumb-item>预约详情</el-breadcrumb-item>
      </el-breadcrumb>

      <el-skeleton v-if="loading" :rows="8" animated />

      <template v-else-if="reservation">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">预约详情</span>
              <el-tag :type="statusTypeMap[reservation.status] || 'primary'">
                {{ statusLabelMap[reservation.status] || reservation.status }}
              </el-tag>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="预约标题">{{ reservation.title }}</el-descriptions-item>
            <el-descriptions-item label="琴房">{{ reservation.roomName }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ reservation.startTime }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ reservation.endTime }}</el-descriptions-item>
            <el-descriptions-item label="使用人数">{{ reservation.attendees }}人</el-descriptions-item>
            <el-descriptions-item label="使用目的">{{ reservation.purpose }}</el-descriptions-item>
            <el-descriptions-item label="签到时间">{{ reservation.signStartTime || '未签到' }}</el-descriptions-item>
            <el-descriptions-item label="签退时间">{{ reservation.signEndTime || '未签退' }}</el-descriptions-item>
            <el-descriptions-item label="审核人">{{ reservation.reviewerId ? reservation.reviewerId : '-' }}</el-descriptions-item>
            <el-descriptions-item label="审核时间">{{ reservation.reviewTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="审核备注" :span="2">{{ reservation.reviewRemarks || '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ reservation.remarks || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ reservation.createdAt }}</el-descriptions-item>
          </el-descriptions>

          <div class="detail-actions">
            <el-button @click="router.back()">返回</el-button>
            <el-button
              v-if="canCancel"
              type="danger"
              @click="handleCancel"
            >取消预约</el-button>
            <template v-if="reservation.status === 'approved'">
              <el-button
                :type="reservation.signStartTime ? 'info' : 'success'"
                :disabled="!!reservation.signStartTime"
                @click="handleSignIn"
              >{{ reservation.signStartTime ? '已签到' : '签到' }}</el-button>
              <el-button
                :type="reservation.signEndTime ? 'info' : 'warning'"
                :disabled="!!reservation.signEndTime"
                @click="handleSignOut"
              >{{ reservation.signEndTime ? '已签退' : '签退' }}</el-button>
            </template>
          </div>
        </el-card>
      </template>

      <el-empty v-else description="预约记录不存在" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { reservationApi } from '@/api/reservation'
import type { Reservation } from '@/api/types'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const reservation = ref<Reservation | null>(null)

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'
const statusTypeMap: Record<string, TagType> = {
  approved: 'primary', completed: 'success', cancelled: 'info', occupied: 'danger',
}
const statusLabelMap: Record<string, string> = {
  approved: '已预约', completed: '已完成', cancelled: '已取消', occupied: '违约',
}

const canCancel = computed(() =>
  reservation.value ? reservation.value.status === 'approved' : false
)

async function load() {
  loading.value = true
  try {
    const res = await reservationApi.getById(Number(route.params.id))
    if (res?.code === 1) reservation.value = res.data
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  await ElMessageBox.confirm('确定取消此次预约吗？', '确认', { type: 'warning' })
  const res = await reservationApi.cancel(reservation.value!.id)
  if (res?.code === 1) { ElMessage.success('已取消'); load() }
  else ElMessage.error(res?.msg || '取消失败')
}

async function handleSignIn() {
  const r = reservation.value!
  const now = dayjs()
  if (now.isBefore(dayjs(r.startTime)) || now.isAfter(dayjs(r.endTime))) {
    ElMessage.warning('不在预约时间内，无法签到')
    return
  }
  const res = await reservationApi.signIn(r.id)
  if (res?.code === 1) { ElMessage.success('签到成功'); load() }
  else ElMessage.error(res?.msg || '签到失败')
}

async function handleSignOut() {
  if (!reservation.value?.signStartTime) { ElMessage.warning('请先签到'); return }
  const res = await reservationApi.signOut(reservation.value!.id)
  if (res?.code === 1) { ElMessage.success('签退成功'); load() }
  else ElMessage.error(res?.msg || '签退失败')
}

onMounted(() => load())
</script>

<style scoped>
.detail-page { padding: 20px 0; min-height: calc(100vh - 124px); }
.container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
.breadcrumb { margin-bottom: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-weight: 600; font-size: 15px; }
.detail-actions { margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
@media (max-width: 768px) { .container { padding: 0 12px; } }
</style>
