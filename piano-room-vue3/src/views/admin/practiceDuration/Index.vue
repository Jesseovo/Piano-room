<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>时长管理</h2>
      <el-button type="success" :icon="Download" @click="handleExport">导出 Excel</el-button>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="日期范围">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始" end-placeholder="结束" @change="handleDateChange" />
        </el-form-item>
        <el-form-item label="用户">
          <el-input v-model="query.username" placeholder="用户名" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column label="用户" prop="username" width="120" />
        <el-table-column label="琴房" prop="roomName" min-width="120" />
        <el-table-column label="开始时间" prop="startTime" min-width="150" />
        <el-table-column label="结束时间" prop="endTime" min-width="150" />
        <el-table-column label="签到时间" prop="signStartTime" min-width="150" />
        <el-table-column label="签退时间" prop="signEndTime" min-width="150" />
        <el-table-column label="实际时长" min-width="100">
          <template #default="{ row }">
            <span v-if="row.signStartTime && row.signEndTime">
              {{ calcDuration(row.signStartTime, row.signEndTime) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize" :total="total" layout="total, sizes, prev, pager, next" class="pagination" @change="loadData" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { reservationApi } from '@/api/reservation'
import { exportApi, downloadBlob } from '@/api/export'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])

const query = reactive({ pageNum: 1, pageSize: 10, username: '', startDate: '', endDate: '' })

function handleDateChange(val: string[] | null) { query.startDate = val?.[0] || ''; query.endDate = val?.[1] || '' }
function resetQuery() { query.username = ''; query.startDate = ''; query.endDate = ''; dateRange.value = []; loadData() }

function calcDuration(start: string, end: string) {
  const mins = dayjs(end).diff(dayjs(start), 'minute')
  if (mins < 60) return `${mins}分钟`
  return `${(mins / 60).toFixed(1)}小时`
}

async function loadData() {
  loading.value = true
  try {
    const res = await reservationApi.listPracticeDuration(query)
    if (res?.code === 1) { tableData.value = res.data?.rows || []; total.value = res.data?.total || 0 }
  } finally { loading.value = false }
}

async function handleExport() {
  try {
    const blob = await exportApi.exportReservations({ start: query.startDate, end: query.endDate, status: 'completed' })
    downloadBlob(blob as any, `时长记录_${new Date().toLocaleDateString()}.xlsx`)
    ElMessage.success('导出成功')
  } catch { ElMessage.error('导出失败') }
}

onMounted(() => loadData())
</script>

<style scoped>
.admin-page { }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; }
.search-card { margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
