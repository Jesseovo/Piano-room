<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-button type="success" :icon="Download" @click="handleExport">导出 Excel</el-button>
        <el-button type="primary" :icon="Plus" @click="openAddDialog">添加用户</el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="query" inline>
        <el-form-item label="关键词">
          <el-input v-model="query.usernameOrRealNameOrStudentId" placeholder="用户名/姓名/学号" clearable @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select v-model="query.userType" clearable placeholder="全部" style="width: 120px">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
            <el-option label="超级管理员" value="super_admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width: 100px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">搜索</el-button>
          <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe border row-key="id">
        <el-table-column label="用户名" prop="username" min-width="110" />
        <el-table-column label="真实姓名" prop="realName" min-width="100" />
        <el-table-column label="学号" prop="studentId" min-width="120" />
        <el-table-column label="邮箱" prop="email" min-width="160" />
        <el-table-column label="用户类型" prop="userType" width="120">
          <template #default="{ row }">
            <el-tag :type="userTypeColor(row.userType)" size="small">{{ userTypeLabel(row.userType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="违约次数" prop="violationCount" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.violationCount > 0" size="small" type="danger">
              {{ row.violationCount }} 次
            </el-tag>
            <span v-else class="text-muted">0</span>
          </template>
        </el-table-column>
        <el-table-column label="封禁状态" width="130">
          <template #default="{ row }">
            <div v-if="row.banUntil && new Date(row.banUntil) > new Date()">
              <el-tag size="small" type="danger">封禁中</el-tag>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px">
                至 {{ row.banUntil?.substring(0, 10) }}
              </div>
            </div>
            <span v-else class="text-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" width="80">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(val: string | number | boolean) => handleStatusChange(row, Boolean(val))"
            />
          </template>
        </el-table-column>
        <el-table-column label="最后登录" prop="lastLoginTime" min-width="150" />
        <el-table-column label="操作" width="240" fixed="right" class-name="action-col">
          <template #default="{ row }">
            <div class="action-wrapper">
              <div class="action-card">
                <button class="action-btn" @click="handleEdit(row)">
                  <el-icon size="14"><Edit /></el-icon>
                  <span>编辑</span>
                </button>
                <button class="action-btn" @click="handleResetPwd(row)">
                  <el-icon size="14"><Key /></el-icon>
                  <span>重置密码</span>
                </button>
                <button
                  v-if="row.banUntil && new Date(row.banUntil) > new Date()"
                  class="action-btn warn"
                  @click="handleRemoveBan(row)"
                >
                  <el-icon size="14"><Unlock /></el-icon>
                  <span>解除封禁</span>
                </button>
                <button class="action-btn danger" @click="handleDelete(row)">
                  <el-icon size="14"><Delete /></el-icon>
                  <span>删除</span>
                </button>
              </div>
            </div>
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

    <!-- 添加/编辑用户弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingUser ? '编辑用户' : '添加用户'" width="500px">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!editingUser" clearable />
        </el-form-item>
        <el-form-item v-if="!editingUser" label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password clearable />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" clearable />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="form.studentId" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" clearable />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="form.userType" style="width: 100%">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
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
import { Plus, Search, Refresh, Download, Edit, Key, Delete, Unlock } from '@element-plus/icons-vue'
import { userApi } from '@/api/user'
import { exportApi, downloadBlob } from '@/api/export'
import request from '@/utils/request'
import type { User } from '@/api/types'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<User[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const editingUser = ref<User | null>(null)
const formRef = ref<FormInstance>()

const query = reactive({
  page: 1,
  pageSize: 10,
  userType: '',
  status: undefined as number | undefined,
  usernameOrRealNameOrStudentId: '',
})

const form = reactive({
  username: '',
  password: '',
  realName: '',
  studentId: '',
  email: '',
  phone: '',
  userType: 'student',
})

const formRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
}

const userTypeLabel = (type: string) => {
  const map: Record<string, string> = { student: '学生', teacher: '教师', admin: '管理员', super_admin: '超管' }
  return map[type] || type
}

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined
const userTypeColor = (type: string): TagType => {
  const map: Record<string, TagType> = { student: undefined, teacher: 'success', admin: 'warning', super_admin: 'danger' }
  return map[type]
}

async function loadData() {
  loading.value = true
  try {
    const res = await userApi.list(query)
    if (res?.code === 1) {
      tableData.value = res.data?.rows || []
      total.value = res.data?.total || 0
    }
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.page = 1
  query.usernameOrRealNameOrStudentId = ''
  query.userType = ''
  query.status = undefined
  loadData()
}

function openAddDialog() {
  editingUser.value = null
  Object.assign(form, { username: '', password: '', realName: '', studentId: '', email: '', phone: '', userType: 'student' })
  dialogVisible.value = true
}

function handleEdit(row: User) {
  editingUser.value = row
  Object.assign(form, { username: row.username, realName: row.realName, studentId: row.studentId, email: row.email, phone: row.phone, userType: row.userType })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingUser.value) {
        await userApi.update({ ...form, id: editingUser.value.id })
        ElMessage.success('更新成功')
      } else {
        await userApi.addUser(form as any)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      submitting.value = false
    }
  })
}

async function handleStatusChange(row: User, val: boolean) {
  await userApi.setStatus(row.id, val ? 1 : 0)
  row.status = val ? 1 : 0
  ElMessage.success('状态更新成功')
}

async function handleResetPwd(row: User) {
  const result = await ElMessageBox.prompt(`重置用户 "${row.username}" 的密码`, '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入新密码（至少6位）',
    inputValidator: (v) => v && v.length >= 6 ? true : '密码至少6位',
  })
  const newPwd = String((result as any).value ?? '')
  await userApi.resetPassword({ id: row.id, newPassword: newPwd, againPassword: newPwd })
  ElMessage.success('密码重置成功')
}

async function handleDelete(row: User) {
  await ElMessageBox.confirm(`确定删除用户 "${row.username}" 吗？`, '确认删除', { type: 'warning' })
  await userApi.delete([row.id])
  ElMessage.success('删除成功')
  loadData()
}

async function handleRemoveBan(row: User) {
  await ElMessageBox.confirm(`确定解除用户 "${row.username}" 的封禁？`, '确认', { type: 'warning' })
  try {
    await request.delete(`/system/penalty-rules/ban/${row.id}`)
    ElMessage.success('已解除封禁')
    loadData()
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleExport() {
  try {
    const blob = await exportApi.exportUsers({
      keyword: query.usernameOrRealNameOrStudentId,
      userType: query.userType,
    })
    downloadBlob(blob as any, `用户列表_${new Date().toLocaleDateString()}.xlsx`)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败')
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.admin-page { }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-header h2 { font-size: 20px; color: #303133; }
.header-actions { display: flex; gap: 8px; }
.search-card { margin-bottom: 16px; }
.table-card { }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }

/* ===== 操作列样式（始终可见） ===== */
:deep(.action-col) { overflow: visible; }
:deep(.action-col .cell) { overflow: visible; padding: 0 8px; }

.action-wrapper {
  opacity: 1;
  display: flex;
  align-items: center;
}

.action-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 4px 6px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.action-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}
.action-btn.danger:hover {
  background: #fef0f0;
  color: #f56c6c;
}
.action-btn.warn:hover {
  background: #fef3c7;
  color: #f59e0b;
}
.text-muted { color: #94a3b8; font-size: 13px; }

</style>
