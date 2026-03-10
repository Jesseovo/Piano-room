<template>
  <div class="admin-page">
    <h2 class="page-title">个人中心</h2>
    <el-row :gutter="20">
      <el-col :xs="24" :md="14">
        <el-card shadow="never">
          <el-tabs v-model="tab">
            <el-tab-pane label="基本信息" name="info">
              <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
                <el-form-item label="用户名">
                  <el-input v-model="form.username" disabled />
                </el-form-item>
                <el-form-item label="真实姓名" prop="realName">
                  <el-input v-model="form.realName" clearable />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" clearable />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="form.phone" clearable />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="pwd">
              <el-form ref="pwdRef" :model="pwd" :rules="pwdRules" label-width="100px">
                <el-form-item label="旧密码" prop="oldPassword">
                  <el-input v-model="pwd.oldPassword" type="password" show-password clearable />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="pwd.newPassword" type="password" show-password clearable />
                </el-form-item>
                <el-form-item label="确认密码" prop="againPassword">
                  <el-input v-model="pwd.againPassword" type="password" show-password clearable />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="savingPwd" @click="handlePwd">确认修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="10">
        <el-card shadow="never">
          <template #header><span>账户信息</span></template>
          <div class="account-info">
            <el-avatar :size="72" :src="authStore.user?.avatarUrl" class="avatar">
              {{ authStore.user?.realName?.[0] }}
            </el-avatar>
            <div class="account-detail">
              <div class="name">{{ authStore.user?.realName || authStore.user?.username }}</div>
              <el-tag size="small" type="warning" style="margin-top:8px">{{ userTypeLabel }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { userApi } from '@/api/user'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const tab = ref('info')
const saving = ref(false)
const savingPwd = ref(false)
const formRef = ref<FormInstance>()
const pwdRef = ref<FormInstance>()

const form = reactive({
  username: authStore.user?.username || '',
  realName: authStore.user?.realName || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
})

const pwd = reactive({ oldPassword: '', newPassword: '', againPassword: '' })
const rules: FormRules = { realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }] }
const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
  againPassword: [{
    validator: (_: any, val: string, cb: Function) => {
      if (val !== pwd.newPassword) cb(new Error('两次密码不一致'))
      else cb()
    }, trigger: 'blur'
  }],
}

const userTypeMap: Record<string, string> = { student: '学生', teacher: '教师', admin: '管理员', super_admin: '超管' }
const userTypeLabel = computed(() => userTypeMap[authStore.user?.userType || ''] || authStore.user?.userType || '')

async function handleSave() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const res = await userApi.update({ ...form, id: authStore.user?.id })
      if (res?.code === 1) { ElMessage.success('保存成功'); authStore.updateUser({ ...authStore.user!, ...form }) }
      else ElMessage.error(res?.msg || '保存失败')
    } finally { saving.value = false }
  })
}

async function handlePwd() {
  await pwdRef.value?.validate(async (valid) => {
    if (!valid) return
    savingPwd.value = true
    try {
      const res = await userApi.resetPassword({ id: authStore.user!.id, ...pwd })
      if (res?.code === 1) { ElMessage.success('密码修改成功'); authStore.logout() }
      else ElMessage.error(res?.msg || '修改失败')
    } finally { savingPwd.value = false }
  })
}

onMounted(async () => {
  if (authStore.user?.id) {
    const res = await userApi.getUserInfo(authStore.user.id)
    if (res?.code === 1 && res.data) Object.assign(form, { username: res.data.username, realName: res.data.realName, email: res.data.email, phone: res.data.phone })
  }
})
</script>

<style scoped>
.admin-page { }
.page-title { font-size: 20px; color: #303133; margin-bottom: 16px; }
.account-info { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 20px 0; }
.avatar { }
.account-detail { text-align: center; }
.name { font-size: 18px; font-weight: 600; }
</style>
