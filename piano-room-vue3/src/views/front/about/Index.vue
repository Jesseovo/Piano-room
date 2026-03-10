<template>
  <div class="about-page">
    <div class="hero">
      <h1>关于我们</h1>
      <p>为音乐爱好者提供便捷的琴房预约服务</p>
    </div>
    <div class="container">
      <el-row :gutter="32" class="about-content">
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="about-card">
            <template #header><span>系统介绍</span></template>
            <p class="about-text">
              琴房预约管理系统是一款专为音乐学院设计的在线预约平台，旨在提高琴房资源利用效率，
              为学生和教师提供便捷、公平的琴房使用体验。
            </p>
            <p class="about-text">
              系统支持在线预约、实时查询、签到管理、数据统计等功能，
              让每一位音乐爱好者都能轻松找到属于自己的练琴空间。
            </p>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="about-card">
            <template #header><span>核心功能</span></template>
            <div class="feature-list">
              <div class="feature-item" v-for="f in features" :key="f.title">
                <el-icon :color="f.color" size="20"><component :is="f.icon" /></el-icon>
                <div>
                  <div class="feature-title">{{ f.title }}</div>
                  <div class="feature-desc">{{ f.desc }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="never" class="contact-card">
        <template #header><span>联系我们</span></template>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8" v-for="c in contacts" :key="c.label">
            <div class="contact-item">
              <el-icon size="28" :color="c.color"><component :is="c.icon" /></el-icon>
              <div class="contact-label">{{ c.label }}</div>
              <div class="contact-value">{{ c.value }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
const features = [
  { title: '实时预约', desc: '在线查看琴房可用状态，一键完成预约', icon: 'Calendar', color: '#409eff' },
  { title: '智能推荐', desc: '基于历史偏好智能推荐合适琴房', icon: 'StarFilled', color: '#e6a23c' },
  { title: '签到管理', desc: '签到签退保障诚信使用', icon: 'CircleCheck', color: '#67c23a' },
  { title: '数据统计', desc: '全面统计报表优化资源配置', icon: 'DataAnalysis', color: '#f56c6c' },
]

const contacts = [
  { label: '客服邮箱', value: 'support@piano.edu.cn', icon: 'Message', color: '#409eff' },
  { label: '联系电话', value: '400-xxx-xxxx', icon: 'Phone', color: '#67c23a' },
  { label: '工作时间', value: '周一至周五 9:00-18:00', icon: 'Clock', color: '#e6a23c' },
]
</script>

<style scoped>
.about-page { min-height: calc(100vh - 124px); }
.hero {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: #fff;
  text-align: center;
  padding: 60px 20px;
}
.hero h1 { font-size: 36px; margin-bottom: 12px; }
.hero p { font-size: 16px; opacity: 0.85; }
.container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
.about-content { margin-bottom: 20px; }
.about-card { height: 100%; margin-bottom: 16px; }
.about-text { font-size: 14px; color: #606266; line-height: 1.8; margin-bottom: 12px; }
.feature-list { display: flex; flex-direction: column; gap: 16px; }
.feature-item { display: flex; gap: 12px; align-items: flex-start; }
.feature-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.feature-desc { font-size: 13px; color: #909399; }
.contact-card { }
.contact-item { text-align: center; padding: 20px; }
.contact-label { font-size: 13px; color: #909399; margin: 10px 0 4px; }
.contact-value { font-size: 15px; font-weight: 500; color: #303133; }
@media (max-width: 768px) { .container { padding: 24px 12px; } }
</style>
