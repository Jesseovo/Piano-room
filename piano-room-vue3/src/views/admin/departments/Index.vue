<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>部门管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog(null)">添加部门</el-button>
    </div>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column label="部门名称" prop="name" min-width="150" />
        <el-table-column label="部门编码" prop="code" min-width="120" />
        <el-table-column label="创建时间" prop="createdAt" min-width="150" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" @click="openDialog(row)">编辑</el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑部门' : '添加部门'" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" clearable />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="form.code" clearable />
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
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import type { Department } from '@/api/types'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<Department[]>([])
const dialogVisible = ref(false)
const editing = ref<Department | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({ name: '', code: '' })
const rules: FormRules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }],
}

async function loadData() {
  loading.value = true
  try {
    const res = await request.get('/depts')
    if (res?.code === 1) tableData.value = res.data || []
  } finally { loading.value = false }
}

function openDialog(row: Department | null) {
  editing.value = row
  form.name = row?.name || ''; form.code = row?.code || ''
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const res = editing.value
        ? await request.put('/depts', { ...form, id: editing.value.id })
        : await request.post('/depts', form)
      if (res?.code === 1) { ElMessage.success('操作成功'); dialogVisible.value = false; loadData() }
      else ElMessage.error(res?.msg || '操作失败')
    } finally { submitting.value = false }
  })
}

async function handleDelete(row: Department) {
  await ElMessageBox.confirm(`确定删除部门 "${row.name}" 吗？`, '确认', { type: 'warning' })
  const res = await request.delete(`/depts/${row.id}`)
  if (res?.code === 1) { ElMessage.success('删除成功'); loadData() }
  else ElMessage.error(res?.msg || '删除失败')
}

onMounted(() => loadData())
</script>

<style scoped>
.admin-page { }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; }
</style>
