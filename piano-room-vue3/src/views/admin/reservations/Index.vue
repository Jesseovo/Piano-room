<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>预约管理</h2>
      <el-button type="success" :icon="Download" @click="handleExport">导出 Excel</el-button>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="琴房">
          <el-input v-model="query.roomName" placeholder="琴房名称" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item label="预约人">
          <el-input v-model="query.username" placeholder="用户名" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width: 120px">
            <el-option label="已预约" value="approved" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已完成" value="completed" />
            <el-option label="违约" value="occupied" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column label="标题" prop="title" min-width="150" show-overflow-tooltip />
        <el-table-column label="预约人" prop="username" width="120" />
        <el-table-column label="琴房" prop="roomName" min-width="120" show-overflow-tooltip />
        <el-table-column label="开始时间" prop="startTime" min-width="170" />
        <el-table-column label="结束时间" prop="endTime" min-width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status] || 'primary'" size="small">
              {{ statusLabelMap[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" @click="handleView(row)">详情</el-button>
            <el-button
              v-if="canAdminAssistSignIn(row)"
              text
              type="success"
              size="small"
              :loading="actionLoading && currentActionId === row.id && currentActionType === 'signIn'"
              @click="handleAdminSignIn(row)"
            >
              代签到
            </el-button>
            <el-button
              v-if="canAdminAssistSignOut(row)"
              text
              type="primary"
              size="small"
              :loading="actionLoading && currentActionId === row.id && currentActionType === 'signOut'"
              @click="handleAdminSignOut(row)"
            >
              代签退
            </el-button>
            <el-button
              v-if="canAdminAssistCancel(row)"
              text
              type="warning"
              size="small"
              @click="handleCancel(row)"
            >
              代取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @change="loadData"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="预约详情" width="720px">
      <el-descriptions v-if="currentRow" :column="2" border>
        <el-descriptions-item label="标题">{{ currentRow.title }}</el-descriptions-item>
        <el-descriptions-item label="预约人">{{ currentRow.username }}</el-descriptions-item>
        <el-descriptions-item label="琴房">{{ currentRow.roomName }}</el-descriptions-item>
        <el-descriptions-item label="人数">{{ currentRow.attendees }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentRow.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentRow.endTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTypeMap[currentRow.status] || 'primary'" size="small">
            {{ statusLabelMap[currentRow.status] || currentRow.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用途">{{ currentRow.purpose || '-' }}</el-descriptions-item>
        <el-descriptions-item label="签到时间">{{ currentRow.signStartTime || '未签到' }}</el-descriptions-item>
        <el-descriptions-item label="签退时间">{{ currentRow.signEndTime || '未签退' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRow.remarks || '-' }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="currentRow && canAdminAssistSignIn(currentRow)"
          type="success"
          :loading="actionLoading && currentActionId === currentRow.id && currentActionType === 'signIn'"
          @click="handleAdminSignIn(currentRow)"
        >
          代签到
        </el-button>
        <el-button
          v-if="currentRow && canAdminAssistSignOut(currentRow)"
          type="primary"
          :loading="actionLoading && currentActionId === currentRow.id && currentActionType === 'signOut'"
          @click="handleAdminSignOut(currentRow)"
        >
          代签退
        </el-button>
        <el-button
          v-if="currentRow && canAdminAssistCancel(currentRow)"
          type="warning"
          @click="handleCancel(currentRow)"
        >
          代取消
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="cancelVisible" title="填写代取消原因" width="420px">
      <el-input
        v-model="cancelRemark"
        type="textarea"
        :rows="4"
        placeholder="请输入管理员代取消原因"
      />
      <template #footer>
        <el-button @click="cancelVisible = false">关闭</el-button>
        <el-button
          type="warning"
          :loading="actionLoading && currentActionType === 'cancel'"
          @click="confirmCancel"
        >
          确认代取消
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh, Search } from '@element-plus/icons-vue'
import { exportApi, downloadBlob } from '@/api/export'
import { reservationApi } from '@/api/reservation'
import type { Reservation } from '@/api/types'

const loading = ref(false)
const actionLoading = ref(false)
const tableData = ref<Reservation[]>([])
const total = ref(0)
const detailVisible = ref(false)
const cancelVisible = ref(false)
const currentRow = ref<Reservation | null>(null)
const cancelRemark = ref('')
const dateRange = ref<string[]>([])
const currentActionId = ref<number | null>(null)
const currentActionType = ref<'signIn' | 'signOut' | 'cancel' | null>(null)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  status: '',
  roomName: '',
  username: '',
  startDate: '',
  endDate: ''
})

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

const statusTypeMap: Record<string, TagType> = {
  approved: 'primary',
  completed: 'success',
  cancelled: 'info',
  occupied: 'danger'
}

const statusLabelMap: Record<string, string> = {
  approved: '已预约',
  completed: '已完成',
  cancelled: '已取消',
  occupied: '违约'
}

function canAdminAssistSignIn(row: Reservation) {
  return !row.signStartTime && row.status === 'approved'
}

function canAdminAssistSignOut(row: Reservation) {
  return !!row.signStartTime && !row.signEndTime
}

function canAdminAssistCancel(row: Reservation) {
  return !row.signStartTime && row.status === 'approved'
}

async function loadData() {
  loading.value = true
  try {
    const res = await reservationApi.list({ ...query })
    if (res?.code === 1) {
      tableData.value = res.data?.rows || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

function handleDateChange(val: string[] | null) {
  query.startDate = val?.[0] || ''
  query.endDate = val?.[1] || ''
}

function resetQuery() {
  query.pageNum = 1
  query.status = ''
  query.roomName = ''
  query.username = ''
  query.startDate = ''
  query.endDate = ''
  dateRange.value = []
  loadData()
}

function handleView(row: Reservation) {
  currentRow.value = row
  detailVisible.value = true
}

function handleCancel(row: Reservation) {
  currentRow.value = row
  cancelRemark.value = ''
  cancelVisible.value = true
}

async function withAction(row: Reservation, type: 'signIn' | 'signOut' | 'cancel', runner: () => Promise<void>) {
  currentActionId.value = row.id
  currentActionType.value = type
  actionLoading.value = true
  try {
    await runner()
  } finally {
    actionLoading.value = false
    currentActionId.value = null
    currentActionType.value = null
  }
}

async function handleAdminSignIn(row: Reservation) {
  await ElMessageBox.confirm(
    `确认要为用户 ${row.username} 执行代签到吗？`,
    '管理员代签到',
    { type: 'warning' }
  )

  await withAction(row, 'signIn', async () => {
    const res = await reservationApi.adminAssistSignIn(row.id)
    if (res?.code === 1) {
      ElMessage.success(res.msg || '代签到成功')
      detailVisible.value = false
      await loadData()
      return
    }
    ElMessage.error(res?.msg || '代签到失败')
  })
}

async function handleAdminSignOut(row: Reservation) {
  await ElMessageBox.confirm(
    `确认要为用户 ${row.username} 执行代签退吗？`,
    '管理员代签退',
    { type: 'warning' }
  )

  await withAction(row, 'signOut', async () => {
    const res = await reservationApi.adminAssistSignOut(row.id)
    if (res?.code === 1) {
      ElMessage.success(res.msg || '代签退成功')
      detailVisible.value = false
      await loadData()
      return
    }
    ElMessage.error(res?.msg || '代签退失败')
  })
}

async function confirmCancel() {
  if (!currentRow.value) {
    return
  }
  if (!cancelRemark.value.trim()) {
    ElMessage.warning('请输入管理员代取消原因')
    return
  }

  await withAction(currentRow.value, 'cancel', async () => {
    const res = await reservationApi.adminAssistCancel(currentRow.value!.id, cancelRemark.value)
    if (res?.code === 1) {
      ElMessage.success('已代取消预约')
      cancelVisible.value = false
      detailVisible.value = false
      await loadData()
      return
    }
    ElMessage.error(res?.msg || '代取消失败')
  })
}

async function handleExport() {
  try {
    const blob = await exportApi.exportReservations({
      start: query.startDate,
      end: query.endDate,
      status: query.status
    })
    downloadBlob(blob as Blob, `预约记录_${new Date().toLocaleDateString()}.xlsx`)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.admin-page {}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 20px;
  color: #303133;
}

.search-card {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
