<template>
  <div class="admin-page">
    <h2 class="page-title">系统设置</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基础设置" name="basic">
        <el-card shadow="never">
          <el-form ref="basicFormRef" :model="basicForm" label-width="110px">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName" clearable style="width:300px" />
            </el-form-item>
            <el-form-item label="联系邮箱">
              <el-input v-model="basicForm.contactEmail" clearable style="width:300px" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="basicForm.contactPhone" clearable style="width:200px" />
            </el-form-item>
            <el-form-item label="公告内容">
              <el-input v-model="basicForm.announcement" type="textarea" :rows="4" style="width:400px" />
            </el-form-item>

            <el-divider content-position="left">时段配置</el-divider>
            <el-form-item label="开放时间起">
              <el-input-number v-model="basicForm.slotStartHour" :min="0" :max="23" style="width:120px" />
              <span class="unit">时（如 8 = 08:00）</span>
            </el-form-item>
            <el-form-item label="开放时间止">
              <el-input-number v-model="basicForm.slotEndHour" :min="1" :max="24" style="width:120px" />
              <span class="unit">时（如 22 = 22:00）</span>
            </el-form-item>
            <el-form-item label="每段时长">
              <el-input-number v-model="basicForm.slotDurationMinutes" :min="30" :max="240" :step="30" style="width:120px" />
              <span class="unit">分钟</span>
            </el-form-item>
            <el-form-item label="每日放开预约时间">
              <el-input-number v-model="basicForm.bookingResetHour" :min="0" :max="23" style="width:120px" />
              <span class="unit">时起可预约次日（0 = 午夜）</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveBasic">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="预约设置" name="reservation">
        <el-card shadow="never">
          <el-form label-width="160px">
            <el-form-item label="最长提前预约天数">
              <el-input-number v-model="reservationForm.maxAdvanceDays" :min="1" :max="30" style="width:120px" />
              <span class="unit">天</span>
            </el-form-item>
            <el-form-item label="签到宽限时间">
              <el-input-number v-model="reservationForm.signInGrace" :min="5" :max="60" style="width:120px" />
              <span class="unit">分钟</span>
            </el-form-item>
            <el-form-item label="最大爽约次数">
              <el-input-number v-model="reservationForm.maxNoShow" :min="1" :max="10" style="width:120px" />
              <span class="unit">次</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveReservation">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="安全设置" name="security">
        <el-card shadow="never">
          <el-form label-width="160px">
            <el-form-item label="Token 有效期">
              <el-input-number v-model="securityForm.tokenExpireHours" :min="1" :max="720" style="width:120px" />
              <span class="unit">小时</span>
            </el-form-item>
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securityForm.minPasswordLength" :min="6" :max="20" style="width:120px" />
              <span class="unit">位</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveSecurity">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 惩罚规则管理 -->
      <el-tab-pane label="惩罚规则" name="penalty">
        <el-card shadow="never">
          <template #header>
            <div class="penalty-header">
              <span>阶梯惩罚规则配置</span>
              <span class="penalty-tip">管理员可调整各等级的封禁天数（0=仅警告）</span>
            </div>
          </template>
          <el-skeleton v-if="penaltyLoading" :rows="3" animated />
          <el-table v-else :data="penaltyRules" border>
            <el-table-column label="违约次数阈值" prop="violationCount" width="120">
              <template #default="{ row }">
                <el-tag type="danger" size="small">第 {{ row.violationCount }} 次</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="封禁天数" prop="banDays" width="180">
              <template #default="{ row }">
                <div class="ban-edit-row">
                  <el-input-number
                    v-model="row.banDays"
                    :min="0"
                    :max="365"
                    size="small"
                    style="width:120px"
                  />
                  <span class="unit">天</span>
                  <span v-if="row.banDays === 0" class="warn-tip">（仅警告）</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="规则说明" prop="description" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.description" size="small" clearable />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="primary"
                  :loading="row._saving"
                  @click="savePenaltyRule(row)"
                >保存</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useSettingsStore } from '@/stores/settings'

const activeTab = ref('basic')
const saving = ref(false)
const penaltyLoading = ref(false)
const penaltyRules = ref<any[]>([])
const settingsStore = useSettingsStore()

const basicForm = reactive({
  systemName: '',
  contactEmail: '',
  contactPhone: '',
  announcement: '',
  slotStartHour: 8,
  slotEndHour: 22,
  slotDurationMinutes: 120,
  bookingResetHour: 0,
})

const reservationForm = reactive({
  maxAdvanceDays: 7,
  signInGrace: 10,
  maxNoShow: 3,
})

const securityForm = reactive({
  tokenExpireHours: 24,
  minPasswordLength: 6,
})

async function loadSettings() {
  try {
    // 加载基本设置
    const basicRes = await request.get('/system/settings/basic')
    if (basicRes?.code === 1 && basicRes.data) {
      Object.assign(basicForm, {
        systemName: basicRes.data.systemName || '',
        contactEmail: basicRes.data.contactEmail || '',
        contactPhone: basicRes.data.contactPhone || '',
        announcement: basicRes.data.announcement || '',
        slotStartHour: basicRes.data.slotStartHour ?? 8,
        slotEndHour: basicRes.data.slotEndHour ?? 22,
        slotDurationMinutes: basicRes.data.slotDurationMinutes ?? 120,
        bookingResetHour: basicRes.data.bookingResetHour ?? 0,
      })
    }
  } catch { /* 静默 */ }

  try {
    // 加载预约设置
    const resvRes = await request.get('/system/settings/reservation')
    if (resvRes?.code === 1 && resvRes.data) {
      const settings = {
        maxAdvanceDays: resvRes.data.maxAdvanceDays ?? 7,
        signInGrace: resvRes.data.signInGrace ?? 10,
        maxNoShow: resvRes.data.maxNoShow ?? 3,
      }
      Object.assign(reservationForm, settings)
      settingsStore.setReservationSettings(settings)
    }
  } catch { /* 静默 */ }

  try {
    // 加载安全设置
    const secRes = await request.get('/system/settings/security')
    if (secRes?.code === 1 && secRes.data) {
      Object.assign(securityForm, {
        tokenExpireHours: secRes.data.tokenExpireHours ?? 24,
        minPasswordLength: secRes.data.minPasswordLength ?? 6,
      })
    }
  } catch { /* 静默 */ }
}

async function saveBasic() {
  saving.value = true
  try {
    const res = await request.post('/system/settings/basic', basicForm)
    if (res?.code === 1) {
      settingsStore.setBasicSettings(basicForm as any)
      ElMessage.success('保存成功')
    } else ElMessage.error(res?.msg || '保存失败')
  } finally { saving.value = false }
}

async function saveReservation() {
  saving.value = true
  try {
    const res = await request.post('/system/settings/reservation', reservationForm)
    if (res?.code === 1) {
      settingsStore.setReservationSettings({ ...reservationForm })
      ElMessage.success('保存成功')
    } else ElMessage.error(res?.msg || '保存失败')
  } finally { saving.value = false }
}

async function saveSecurity() {
  saving.value = true
  try {
    const res = await request.post('/system/settings/security', securityForm)
    if (res?.code === 1) ElMessage.success('保存成功')
    else ElMessage.error(res?.msg || '保存失败')
  } finally { saving.value = false }
}

async function loadPenaltyRules() {
  penaltyLoading.value = true
  try {
    const res = await request.get('/system/penalty-rules')
    if (res?.code === 1) penaltyRules.value = (res.data || []).map((r: any) => ({ ...r, _saving: false }))
  } catch { /* 静默 */ } finally { penaltyLoading.value = false }
}

async function savePenaltyRule(row: any) {
  row._saving = true
  try {
    const res = await request.put(`/system/penalty-rules/${row.id}`, {
      banDays: row.banDays,
      description: row.description,
    })
    if (res?.code === 1) ElMessage.success('保存成功')
    else ElMessage.error(res?.msg || '保存失败')
  } finally { row._saving = false }
}

onMounted(() => {
  loadSettings()
  loadPenaltyRules()
})
</script>

<style scoped>
.admin-page { }
.page-title { font-size: 20px; color: var(--color-text); margin-bottom: 16px; font-weight: 700; }
.unit { margin-left: 8px; color: var(--color-text-muted); font-size: 13px; }
.penalty-header { display: flex; align-items: center; justify-content: space-between; }
.penalty-tip { font-size: 13px; color: var(--color-text-muted); }
.ban-edit-row { display: flex; align-items: center; gap: 8px; }
.warn-tip { font-size: 12px; color: var(--color-warning); }
</style>
