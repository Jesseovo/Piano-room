<template>
  <div class="profile-page">
    <div class="container">
      <!-- 欢迎横幅 -->
      <div class="welcome-banner">
        <el-avatar :size="64" :src="authStore.user?.avatarUrl" class="banner-avatar">
          {{ authStore.user?.realName?.[0] || authStore.user?.username?.[0] }}
        </el-avatar>
        <div class="banner-text">
          <h2>{{ greeting }}，{{ authStore.user?.realName || authStore.user?.username }}</h2>
          <p>欢迎使用个人中心，管理您的信息和预约记录</p>
        </div>
      </div>

      <el-row :gutter="20">
        <el-col :xs="24" :md="16">
          <el-card shadow="never">
            <template #header><span class="card-title">个人中心</span></template>
            <el-tabs v-model="activeTab">
              <!-- 个人资料 -->
              <el-tab-pane label="个人资料" name="info">
                <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
                  <el-form-item label="用户名">
                    <el-input v-model="form.username" disabled />
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
                  <el-form-item label="年级">
                    <el-input v-model="form.grade" clearable />
                  </el-form-item>
                  <el-form-item label="专业">
                    <el-input v-model="form.major" clearable />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="saving" @click="handleSave">保存修改</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 修改密码 -->
              <el-tab-pane label="修改密码" name="password">
                <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px">
                  <el-form-item label="旧密码" prop="oldPassword">
                    <el-input v-model="pwdForm.oldPassword" type="password" show-password clearable />
                  </el-form-item>
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="pwdForm.newPassword" type="password" show-password clearable />
                  </el-form-item>
                  <el-form-item label="确认新密码" prop="againPassword">
                    <el-input v-model="pwdForm.againPassword" type="password" show-password clearable />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" :loading="savingPwd" @click="handleChangePwd">确认修改</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

        <!-- 右侧统计 -->
        <el-col :xs="24" :md="8">
          <el-card shadow="never" class="stats-card">
            <template #header><span class="card-title">预约统计</span></template>
            <el-skeleton v-if="statsLoading" :rows="4" animated />
            <div v-else class="stats-list">
              <div class="stat-item" v-for="s in statsItems" :key="s.label">
                <div class="stat-label">{{ s.label }}</div>
                <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth'
import request from '@/utils/request'

const authStore = useAuthStore()
const activeTab = ref('info')
const saving = ref(false)
const savingPwd = ref(false)
const statsLoading = ref(false)
const formRef = ref<FormInstance>()
const pwdFormRef = ref<FormInstance>()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const form = reactive({
  username: authStore.user?.username || '',
  realName: authStore.user?.realName || '',
  studentId: authStore.user?.studentId || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  grade: '',
  major: '',
})

const rules: FormRules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
}

const pwdForm = reactive({ oldPassword: '', newPassword: '', againPassword: '' })
const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
  againPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_: any, val: string, cb: Function) => {
        if (val !== pwdForm.newPassword) cb(new Error('两次密码不一致'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}

const statsItems = ref([
  { label: '总预约次数', value: '-', color: '#409eff' },
  { label: '已完成', value: '-', color: '#67c23a' },
  { label: '取消次数', value: '-', color: '#e6a23c' },
  { label: '累计时长(h)', value: '-', color: '#f56c6c' },
])

async function loadUserInfo() {
  if (!authStore.user?.id) return
  const res = await userApi.getUserInfo(authStore.user.id)
  if (res?.code === 1 && res.data) {
    Object.assign(form, {
      username: res.data.username,
      realName: res.data.realName,
      studentId: res.data.studentId,
      email: res.data.email,
      phone: res.data.phone,
      grade: res.data.grade || '',
      major: res.data.major || '',
    })
  }
}

async function loadStats() {
  if (!authStore.user?.id) return
  statsLoading.value = true
  try {
    const res = await request.get(`/user/${authStore.user.id}/reservation-stats`)
    if (res?.code === 1 && res.data) {
      const d = res.data as Record<string, unknown>
      if (statsItems.value[0]) statsItems.value[0].value = String(d.totalCount ?? '-')
      if (statsItems.value[1]) statsItems.value[1].value = String(d.completedCount ?? '-')
      if (statsItems.value[2]) statsItems.value[2].value = String(d.cancelledCount ?? '-')
      if (statsItems.value[3]) {
        const totalPracticeMinutes = Number(d.totalPracticeMinutes ?? 0)
        statsItems.value[3].value = (totalPracticeMinutes / 60).toFixed(1)
      }
    }
  } catch {
    // 静默失败
  } finally {
    statsLoading.value = false
  }
}

async function handleSave() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const res = await userApi.update({ ...form, id: authStore.user?.id })
      if (res?.code === 1) {
        ElMessage.success('保存成功')
        authStore.updateUser({ ...authStore.user!, ...form })
      } else ElMessage.error(res?.msg || '保存失败')
    } finally { saving.value = false }
  })
}

async function handleChangePwd() {
  await pwdFormRef.value?.validate(async (valid) => {
    if (!valid) return
    savingPwd.value = true
    try {
      const res = await userApi.resetPassword({
        id: authStore.user!.id,
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
        againPassword: pwdForm.againPassword,
      })
      if (res?.code === 1) {
        ElMessage.success('密码修改成功，请重新登录')
        authStore.logout()
      } else ElMessage.error(res?.msg || '修改失败')
    } finally { savingPwd.value = false }
  })
}

onMounted(() => {
  loadUserInfo()
  loadStats()
})
</script>

<style scoped>
.profile-page { padding: 20px 0; min-height: calc(100vh - 124px); }
.container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }

.welcome-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: #fff;
  border-radius: 12px;
  padding: 28px 32px;
  margin-bottom: 20px;
}
.banner-avatar { flex-shrink: 0; }
.banner-text h2 { font-size: 20px; margin: 0 0 6px; }
.banner-text p { font-size: 14px; opacity: 0.85; margin: 0; }

.card-title { font-weight: 600; font-size: 15px; }
.stats-card { margin-bottom: 16px; }
.stats-list { display: flex; flex-direction: column; gap: 12px; }
.stat-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9ff; border-radius: 8px; }
.stat-label { font-size: 14px; color: #606266; }
.stat-value { font-size: 22px; font-weight: 700; }

@media (max-width: 768px) {
  .container { padding: 0 12px; }
  .welcome-banner { padding: 20px 16px; }
}
</style>
