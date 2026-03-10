<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>维修管理</h2>
      <el-button type="primary" :icon="Plus" @click="dialogVisible = true">登记维修</el-button>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="日期范围">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始" end-placeholder="结束" @change="handleDateChange" />
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="query.maintenanceType" clearable placeholder="全部" style="width:120px">
            <el-option label="定期维护" value="regular" />
            <el-option label="故障修复" value="repair" />
            <el-option label="清洁保养" value="cleaning" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column label="琴房" prop="roomId" width="100" />
        <el-table-column label="维修类型" prop="maintenanceType" width="120" />
        <el-table-column label="原因" prop="reason" min-width="200" show-overflow-tooltip />
        <el-table-column label="开始时间" prop="startTime" min-width="150" />
        <el-table-column label="结束时间" prop="endTime" min-width="150" />
        <el-table-column label="创建时间" prop="createdAt" min-width="150" />
      </el-table>
      <el-pagination v-model:current-page="query.page" v-model:page-size="query.pageSize" :total="total" layout="total, prev, pager, next" class="pagination" @change="loadData" />
    </el-card>

    <el-dialog v-model="dialogVisible" title="登记维修" width="500px">
      <el-form ref="formRef" :model="form" label-width="90px">
        <el-form-item label="琴房ID" prop="roomId">
          <el-input-number v-model="form.roomId" :min="1" style="width:120px" />
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="form.maintenanceType" style="width:160px">
            <el-option label="定期维护" value="regular" />
            <el-option label="故障修复" value="repair" />
            <el-option label="清洁保养" value="cleaning" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width:100%" />
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const dateRange = ref<string[]>([])
const formRef = ref()

const query = reactive({ page: 1, pageSize: 10, maintenanceType: '', startTime: '', endTime: '' })
const form = reactive({ roomId: 1, maintenanceType: 'regular', startTime: '', endTime: '', reason: '' })

function handleDateChange(val: string[] | null) {
  query.startTime = val?.[0] || ''; query.endTime = val?.[1] || ''
}
function resetQuery() { query.maintenanceType = ''; query.startTime = ''; query.endTime = ''; dateRange.value = []; loadData() }

async function loadData() {
  loading.value = true
  try {
    const res = await request.get('/maintenance/list', { params: query })
    if (res?.code === 1) { tableData.value = res.data?.rows || []; total.value = res.data?.total || 0 }
  } finally { loading.value = false }
}

async function handleSubmit() {
  submitting.value = true
  try {
    const res = await request.post('/room/maintenance', form)
    if (res?.code === 1) { ElMessage.success('登记成功'); dialogVisible.value = false; loadData() }
    else ElMessage.error(res?.msg || '登记失败')
  } finally { submitting.value = false }
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
