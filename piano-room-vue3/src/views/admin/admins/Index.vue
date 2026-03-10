<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>管理员管理</h2>
      <el-button type="primary" :icon="Plus" @click="openDialog">添加管理员</el-button>
    </div>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe border>
        <el-table-column label="用户名" prop="username" min-width="120" />
        <el-table-column label="真实姓名" prop="realName" min-width="120" />
        <el-table-column label="邮箱" prop="email" min-width="180" />
        <el-table-column label="类型" prop="userType" width="120">
          <template #default="{ row }">
            <el-tag :type="row.userType === 'super_admin' ? 'danger' : 'warning'" size="small">
              {{ row.userType === 'super_admin' ? '超级管理员' : '管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text size="small" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="添加管理员" width="440px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password clearable />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="form.realName" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" clearable />
        </el-form-item>
        <el-form-item label="管理员类型">
          <el-select v-model="form.userType" style="width:100%">
            <el-option label="管理员" value="admin" />
            <el-option label="超级管理员" value="super_admin" />
          </el-select>
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
import { userApi } from '@/api/user'
import request from '@/utils/request'
import type { User } from '@/api/types'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<User[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({ username: '', password: '', realName: '', email: '', userType: 'admin' })
const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
}

async function loadData() {
  loading.value = true
  try {
    const res = await request.get('/admins/list', { params: { page: 1, pageSize: 100 } })
    if (res?.code === 1) tableData.value = res.data?.rows || []
  } finally { loading.value = false }
}

function openDialog() {
  Object.assign(form, { username: '', password: '', realName: '', email: '', userType: 'admin' })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const res = await request.post('/admins', form)
      if (res?.code === 1) { ElMessage.success('添加成功'); dialogVisible.value = false; loadData() }
      else ElMessage.error(res?.msg || '添加失败')
    } finally { submitting.value = false }
  })
}

async function handleResetPwd(row: User) {
  const result = await ElMessageBox.prompt(`重置 "${row.username}" 的密码`, '重置密码', {
    confirmButtonText: '确定', cancelButtonText: '取消',
    inputPlaceholder: '新密码（至少6位）',
    inputValidator: (v) => v && v.length >= 6 ? true : '密码至少6位',
  })
  const newPwd = String((result as any).value ?? '')
  const res = await request.put('/admins', { id: row.id, newPassword: newPwd })
  if (res?.code === 1) ElMessage.success('密码重置成功')
  else ElMessage.error(res?.msg || '重置失败')
}

async function handleDelete(row: User) {
  await ElMessageBox.confirm(`确定删除管理员 "${row.username}" 吗？`, '确认', { type: 'warning' })
  const res = await userApi.delete([row.id])
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
