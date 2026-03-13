<template>
  <div class="help-page">
    <div class="container">
      <div class="page-header">
        <h1>帮助中心</h1>
        <p>常见问题与使用指南</p>
      </div>

      <el-row :gutter="20">
        <el-col :xs="24" :md="16">
          <el-card shadow="never">
            <el-collapse accordion>
              <el-collapse-item v-for="faq in faqs" :key="faq.q" :title="faq.q">
                <p class="faq-answer">{{ faq.a }}</p>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="8">
          <el-card shadow="never" class="guide-card">
            <template #header><span>快速使用指南</span></template>
            <el-steps direction="vertical" :active="5">
              <el-step title="注册/登录" description="注册账号并完善个人信息" />
              <el-step title="查找琴房" description="按类型、时间、院系筛选" />
              <el-step title="提交预约" description="填写预约信息提交申请" />
              <el-step title="等待审核" description="管理员审核通过后生效" />
              <el-step title="签到使用" description="到场后扫码或点击签到" />
            </el-steps>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const signInGrace = settingsStore.reservationSettings?.signInGrace ?? 10
const maxNoShow = settingsStore.reservationSettings?.maxNoShow ?? 3
const maxAdvanceDays = settingsStore.reservationSettings?.maxAdvanceDays ?? 7

const faqs = [
  { q: '如何预约琴房？', a: '登录系统后，进入「琴房查找」页面，选择合适的琴房，填写预约时间和使用目的，提交后等待管理员审核即可。' },
  { q: '预约多久后生效？', a: '提交预约后，管理员通常在1小时内完成审核。审核通过后系统会发送邮件通知。' },
  { q: '如何取消预约？', a: '在「我的预约」页面找到对应的预约记录，点击「取消预约」即可。建议在使用前至少30分钟取消。' },
  { q: '未签到会有什么后果？', a: `预约开始后超过${signInGrace}分钟未签到，系统将自动释放该时段。累计爽约${maxNoShow}次将暂停使用权。` },
  { q: '可以提前多久预约？', a: `最多可提前${maxAdvanceDays}天预约，具体以系统实际限制为准。当天的预约需在开放时间后提交。` },
  { q: '如果设备有问题怎么办？', a: '请联系管理员或在备注中说明情况。紧急情况可拨打学院行政电话。' },
  { q: '忘记密码怎么办？', a: '点击登录页面的「忘记密码」，通过注册邮箱验证后重置密码。' },
  { q: '如何修改个人信息？', a: '登录后进入「个人中心」，在「个人资料」选项卡中修改并保存。' },
]
</script>

<style scoped>
.help-page { padding: 40px 0; min-height: calc(100vh - 124px); }
.container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
.page-header { text-align: center; margin-bottom: 32px; }
.page-header h1 { font-size: 28px; color: #303133; }
.page-header p { font-size: 15px; color: #909399; margin-top: 8px; }
.faq-answer { font-size: 14px; color: #606266; line-height: 1.7; margin: 0; }
.guide-card { }
@media (max-width: 768px) { .container { padding: 0 12px; } }
</style>
