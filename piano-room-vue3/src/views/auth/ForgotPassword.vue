<template>
  <div class="auth-page">
    <div class="back-btn" @click="router.push('/login')">
      <el-icon><ArrowLeft /></el-icon>
      <span>返回登录</span>
    </div>
    <div class="auth-card">
      <div class="auth-header">
        <el-icon size="36" color="#409eff"><Lock /></el-icon>
        <h2>找回密码</h2>
        <p>通过邮箱验证重置密码</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="邮箱" prop="email">
          <div class="email-row">
            <el-input v-model="form.email" placeholder="请输入注册邮箱" clearable />
            <el-button :disabled="cooldown > 0" @click="sendCode">
              {{ cooldown > 0 ? `${cooldown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="form.code" placeholder="请输入邮箱验证码" clearable />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="请输入新密码" show-password clearable />
        </el-form-item>
        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleSubmit">
          重置密码
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { userApi } from '@/api/user'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const cooldown = ref(0)

const form = ref({ email: '', code: '', newPassword: '' })
const rules: FormRules = {
  email: [{ required: true, type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  newPassword: [{ required: true, min: 6, message: '密码至少6位', trigger: 'blur' }],
}

async function sendCode() {
  if (!form.value.email) { ElMessage.warning('请先输入邮箱'); return }
  await userApi.sendEmailCode(form.value.email, 1)
  ElMessage.success('验证码已发送')
  cooldown.value = 60
  const t = setInterval(() => { cooldown.value--; if (cooldown.value <= 0) clearInterval(t) }, 1000)
}

async function handleSubmit() {
  await formRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      ElMessage.success('密码重置成功，请重新登录')
      router.push('/login')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
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
}
.back-btn:hover { color: #fff; background: rgba(255,255,255,0.2); }
.auth-card {
  width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.auth-header { text-align: center; margin-bottom: 28px; }
.auth-header h2 { font-size: 20px; margin-top: 10px; }
.auth-header p { color: #909399; font-size: 14px; margin-top: 4px; }
.email-row { display: flex; gap: 10px; align-items: center; }
.submit-btn { width: 100%; margin-top: 8px; }
</style>
