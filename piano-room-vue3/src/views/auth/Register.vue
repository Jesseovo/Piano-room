<template>
  <div class="auth-page">
    <div class="back-btn" @click="router.push('/login')">
      <el-icon><ArrowLeft /></el-icon>
      <span>返回登录</span>
    </div>
    <div class="auth-card">
      <div v-if="registrationClosed" class="auth-header">
        <el-icon size="36" color="#e6a23c"><Headset /></el-icon>
        <h2>自助注册已关闭</h2>
        <p>学校正式环境不开放匿名注册，请联系管理员或通过学校统一身份入口登录。</p>
        <el-button type="primary" class="submit-btn" @click="router.push('/login')">返回登录</el-button>
      </div>
      <template v-else>
      <div class="auth-header">
        <el-icon size="36" color="#409eff"><Headset /></el-icon>
        <h2>注册账号</h2>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="handleRegister">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" clearable />
        </el-form-item>
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="form.studentId" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <div class="email-row">
            <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
            <el-button :disabled="emailCooldown > 0" @click="sendEmailCode">
              {{ emailCooldown > 0 ? `${emailCooldown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="邮箱验证码" prop="emailCode">
          <el-input v-model="form.emailCode" placeholder="请输入邮箱验证码" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password clearable />
        </el-form-item>
        <el-form-item label="图形验证码" prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="form.captchaCode" placeholder="请输入图形验证码" clearable />
            <img :src="captchaUrl" class="captcha-img" @click="loadCaptcha" />
          </div>
        </el-form-item>
        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleRegister">注册</el-button>
      </el-form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { userApi } from '@/api/user'
import { useSettingsStore } from '@/stores/settings'
import request from '@/utils/request'

const router = useRouter()
const settingsStore = useSettingsStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const captchaUrl = ref('')
const emailCooldown = ref(0)
const registrationClosed = ref(settingsStore.publicSecurity?.publicRegistrationEnabled !== true)

const form = ref({
  username: '',
  realName: '',
  studentId: '',
  email: '',
  emailCode: '',
  emailCodeKey: '',
  password: '',
  captchaCode: '',
  captchaKey: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  email: [{ required: true, type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
  emailCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请输入图形验证码', trigger: 'blur' }],
}

async function loadCaptcha() {
  const res = await userApi.getCaptcha(1)
  if (res?.code === 1 && res.data) {
    captchaUrl.value = res.data.image
    form.value.captchaKey = res.data.verificationKey
  }
}

async function sendEmailCode() {
  if (!form.value.email) { ElMessage.warning('请先输入邮箱'); return }
  const res = await userApi.sendEmailCode(form.value.email, 0)
  if (res?.code === 1 && res.data?.verificationKey) {
    form.value.emailCodeKey = res.data.verificationKey
  }
  ElMessage.success('验证码已发送')
  emailCooldown.value = 60
  const timer = setInterval(() => {
    emailCooldown.value--
    if (emailCooldown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function handleRegister() {
  if (registrationClosed.value) {
    ElMessage.warning('学校正式环境已关闭自助注册')
    return
  }
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await userApi.register(form.value as any)
      if (res?.code === 1) {
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } else {
        ElMessage.error(res?.msg || '注册失败')
        loadCaptcha()
      }
    } finally {
      loading.value = false
    }
  })
}

async function loadPublicSecurity() {
  try {
    const res = await request.get('/system/settings/public-security')
    if (res?.code === 1 && res.data) {
      settingsStore.setPublicSecurity(res.data)
      registrationClosed.value = res.data.publicRegistrationEnabled !== true
    }
  } catch {
    registrationClosed.value = true
  }
}

onMounted(async () => {
  await loadPublicSecurity()
  if (!registrationClosed.value) {
    loadCaptcha()
  }
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  padding: 40px 16px;
}
.back-btn {
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  transition: all 0.2s;
}
.back-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
.auth-card {
  width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.auth-header {
  text-align: center;
  margin-bottom: 28px;
}
.auth-header h2 { font-size: 20px; margin-top: 10px; }
.email-row, .captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.captcha-img {
  height: 38px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  flex-shrink: 0;
}
.submit-btn { width: 100%; margin-top: 8px; }
@media (max-width: 480px) {
  .auth-card { width: calc(100vw - 32px); padding: 28px 20px; }
}
</style>
