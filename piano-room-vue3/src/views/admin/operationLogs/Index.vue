<template>
  <div class="admin-page">
    <h2 class="page-title">操作日志</h2>

    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="操作人">
          <el-input v-model="query.username" placeholder="用户名" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-input v-model="query.operationType" placeholder="操作类型" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始" end-placeholder="结束" @change="handleDateChange" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column label="操作人" prop="username" width="110" />
        <el-table-column label="操作类型" prop="operationType" width="120" />
        <el-table-column label="操作描述" prop="description" min-width="200" show-overflow-tooltip />
        <el-table-column label="IP地址" prop="ipAddress" width="140" />
        <el-table-column label="操作时间" prop="createdAt" min-width="160" />
        <el-table-column label="结果" prop="result" width="80">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total" layout="total, sizes, prev, pager, next" class="pagination" @change="loadData" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])

const query = reactive({ page: 1, pageSize: 10, username: '', operationType: '', startTime: '', endTime: '' })

function handleDateChange(val: string[] | null) { query.startTime = val?.[0] || ''; query.endTime = val?.[1] || '' }
function resetQuery() { query.username = ''; query.operationType = ''; query.startTime = ''; query.endTime = ''; dateRange.value = []; loadData() }

async function loadData() {
  loading.value = true
  try {
    const res = await request.get('/operationLogs/page', { params: query })
    if (res?.code === 1) {
      const rows = res.data?.rows || []
      tableData.value = rows.map((r: any) => ({
        ...r,
        description: r.operationDesc,
        ipAddress: r.requestIp,
        result: r.status === 1 ? 'success' : 'fail',
      }))
      total.value = res.data?.total ?? 0
    }
  } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.admin-page { }
.page-title { font-size: 20px; color: #303133; margin-bottom: 16px; }
.search-card { margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
