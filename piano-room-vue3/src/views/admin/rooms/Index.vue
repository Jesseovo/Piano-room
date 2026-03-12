<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>琴房管理</h2>
      <div class="header-actions">
        <el-button type="success" :icon="Download" @click="handleExport">导出 Excel</el-button>
        <el-button type="primary" :icon="Plus" @click="openDialog(null)">添加琴房</el-button>
      </div>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="名称">
          <el-input v-model="query.roomNumberOrName" placeholder="琴房名称或编号" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width:100px">
            <el-option label="可用" :value="1" />
            <el-option label="维护中" :value="0" />
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
        <el-table-column label="房间号" prop="roomNumber" width="100" />
        <el-table-column label="名称" prop="name" min-width="120" />
        <el-table-column label="楼层" prop="floor" width="80" />
        <el-table-column label="容量" prop="capacity" width="80">
          <template #default="{ row }">{{ row.capacity }}人</template>
        </el-table-column>
        <el-table-column label="描述" prop="description" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '可用' : '维护中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" @click="openDialog(row)">编辑</el-button>
            <el-button text type="warning" size="small" @click="handleSetStatus(row)">
              {{ row.status === 1 ? '停用' : '启用' }}
            </el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        class="pagination"
        @change="loadData"
      />
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingRoom ? '编辑琴房' : '添加琴房'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="房间号" prop="roomNumber">
          <el-input v-model="form.roomNumber" clearable />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" clearable />
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-input-number v-model="form.floor" :min="1" :max="50" style="width:130px" />
        </el-form-item>
        <el-form-item label="容量" prop="capacity">
          <el-input-number v-model="form.capacity" :min="1" :max="500" style="width:130px" />
        </el-form-item>
        <el-form-item label="设施">
          <el-input v-model="form.facilities" placeholder="钢琴,空调,投影..." clearable />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Refresh, Download } from '@element-plus/icons-vue'
import { roomApi } from '@/api/room'
import { exportApi, downloadBlob } from '@/api/export'
import type { Room } from '@/api/types'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<Room[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const editingRoom = ref<Room | null>(null)
const formRef = ref<FormInstance>()

const query = reactive({ page: 1, pageSize: 10, roomNumberOrName: '', status: undefined as number | undefined })

const form = reactive({
  roomNumber: '', name: '', floor: 1, capacity: 10, facilities: '', description: ''
})

const rules: FormRules = {
  roomNumber: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}

async function loadData() {
  loading.value = true
  try {
    const res = await roomApi.list(query)
    if (res?.code === 1) {
      tableData.value = res.data?.rows || []
      total.value = res.data?.total || 0
    }
  } finally { loading.value = false }
}

function resetQuery() {
  query.page = 1; query.roomNumberOrName = ''; query.status = undefined
  loadData()
}

function openDialog(row: Room | null) {
  editingRoom.value = row
  if (row) {
    Object.assign(form, { roomNumber: row.roomNumber, name: row.name, floor: row.floor, capacity: row.capacity, facilities: row.facilities, description: row.description })
  } else {
    Object.assign(form, { roomNumber: '', name: '', floor: 1, capacity: 10, facilities: '', description: '' })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const res = editingRoom.value
        ? await roomApi.update({ ...form, id: editingRoom.value.id })
        : await roomApi.create(form)
      if (res?.code === 1) {
        ElMessage.success(editingRoom.value ? '更新成功' : '添加成功')
        dialogVisible.value = false; loadData()
      } else ElMessage.error(res?.msg || '操作失败')
    } finally { submitting.value = false }
  })
}

async function handleSetStatus(row: Room) {
  const newStatus = row.status === 1 ? 0 : 1
  const res = await roomApi.setStatus(row.id, newStatus)
  if (res?.code === 1) { ElMessage.success('状态已更新'); loadData() }
  else ElMessage.error(res?.msg || '操作失败')
}

async function handleDelete(row: Room) {
  await ElMessageBox.confirm(`确定删除琴房 "${row.name}" 吗？`, '确认', { type: 'warning' })
  const res = await roomApi.delete(row.id)
  if (res?.code === 1) { ElMessage.success('删除成功'); loadData() }
  else ElMessage.error(res?.msg || '删除失败')
}

async function handleExport() {
  try {
    const blob = await exportApi.exportRooms()
    downloadBlob(blob as any, `琴房列表_${new Date().toLocaleDateString()}.xlsx`)
    ElMessage.success('导出成功')
  } catch { ElMessage.error('导出失败') }
}

onMounted(() => loadData())
</script>

<style scoped>
.admin-page { }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; }
.header-actions { display: flex; gap: 8px; }
.search-card { margin-bottom: 16px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
