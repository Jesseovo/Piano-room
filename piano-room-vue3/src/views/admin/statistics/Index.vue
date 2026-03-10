<template>
  <div class="statistics-page">
    <h2 class="page-title">数据统计</h2>

    <!-- 时间范围 -->
    <el-card shadow="never" class="filter-card">
      <el-radio-group v-model="timeRange" @change="loadAll">
        <el-radio-button label="TODAY">今天</el-radio-button>
        <el-radio-button label="WEEK">本周</el-radio-button>
        <el-radio-button label="MONTH">本月</el-radio-button>
      </el-radio-group>
      <el-button type="primary" class="refresh-btn" :loading="loading" @click="loadAll">刷新数据</el-button>
    </el-card>

    <!-- 概览卡片：教务风格，左侧竖线标识，蓝灰配色 -->
    <el-row :gutter="16" class="overview-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card primary">
          <div class="stat-value">{{ overview.bookedToday }}</div>
          <div class="stat-label">今日已预约</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card secondary">
          <div class="stat-value">{{ overview.availableToday }}</div>
          <div class="stat-label">今日可预约</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card primary">
          <div class="stat-value">{{ overview.totalReservations }}</div>
          <div class="stat-label">预约总数</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card secondary">
          <div class="stat-value">{{ overview.approvalRate }}%</div>
          <div class="stat-label">通过率</div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="16" class="overview-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card muted">
          <div class="stat-value">{{ overview.usageRate }}%</div>
          <div class="stat-label">琴房使用率</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card muted">
          <div class="stat-value">{{ overview.activeUsers }}</div>
          <div class="stat-label">活跃用户</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表：按当前业务仅保留 已预约/可预约、预约趋势、热门时段 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header><span>今日预约分布</span></template>
          <div ref="bookingChartRef" class="chart-area"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header><span>预约趋势（按周）</span></template>
          <div ref="weekChartRef" class="chart-area"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24">
        <el-card shadow="hover">
          <template #header><span>热门时段分析（本周）</span></template>
          <div ref="timeSlotChartRef" class="chart-area"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'

const loading = ref(false)
const timeRange = ref<'TODAY' | 'WEEK' | 'MONTH'>('TODAY')

const overview = reactive({
  bookedToday: '--',
  availableToday: '--',
  totalReservations: '--',
  approvalRate: '--',
  usageRate: '--',
  activeUsers: '--',
})

const bookingChartRef = ref<HTMLElement>()
const weekChartRef = ref<HTMLElement>()
const timeSlotChartRef = ref<HTMLElement>()
let charts: echarts.ECharts[] = []

const params = () => ({ range: timeRange.value })

async function loadOverview() {
  try {
    const [overviewRes, countRes, rateRes, usageRes, userRes] = await Promise.allSettled([
      request.get('/reports/bookingOverview'),
      request.get('/reports/countReservations', { params: params() }),
      request.get('/reports/approvalRate', { params: params() }),
      request.get('/reports/classroomUsageRate', { params: params() }),
      request.get('/reports/activeUsers', { params: params() }),
    ])
    const o = overviewRes.status === 'fulfilled' && overviewRes.value?.data ? overviewRes.value.data : null
    if (o) {
      overview.bookedToday = o.bookedToday ?? '--'
      overview.availableToday = o.availableToday ?? '--'
    }
    overview.totalReservations = countRes.status === 'fulfilled' && countRes.value?.data != null ? String(countRes.value.data) : '--'
    overview.approvalRate = rateRes.status === 'fulfilled' && rateRes.value?.data != null ? String(Math.round(Number(rateRes.value.data) * 100)) : '--'
    overview.usageRate = usageRes.status === 'fulfilled' && usageRes.value?.data != null ? String(Math.round(Number(usageRes.value.data) * 100)) : '--'
    overview.activeUsers = userRes.status === 'fulfilled' && userRes.value?.data != null ? String(userRes.value.data) : '--'
  } catch {
    // 静默
  }
}

async function initCharts() {
  const fontFamily = 'PingFang SC, Microsoft YaHei, sans-serif'
  // 教务风格配色：藏青、灰蓝、浅灰
  const colors = {
    primary: '#2c5282',
    secondary: '#718096',
    light: '#a0aec0',
    bg: '#f7fafc',
    text: '#2d3748',
  }

  if (bookingChartRef.value) {
    const chart = echarts.init(bookingChartRef.value)
    charts.push(chart)
    try {
      const res = await request.get('/reports/bookingOverview')
      const data = res?.data || {}
      const booked = Number(data.bookedToday) || 0
      const available = Number(data.availableToday) || 0
      chart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0, textStyle: { fontFamily, color: colors.text } },
        color: [colors.primary, colors.secondary],
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          label: { fontFamily, color: colors.text },
          data: [
            { name: '已预约', value: booked },
            { name: '可预约', value: available },
          ],
        }],
      })
    } catch { /* 无数据 */ }
  }

  if (weekChartRef.value) {
    const chart = echarts.init(weekChartRef.value)
    charts.push(chart)
    try {
      const res = await request.get('/reports/weekly')
      const data = res?.data || []
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: data.map((d: any) => d.dayOfWeek),
          axisLabel: { fontFamily, color: colors.text },
          axisLine: { lineStyle: { color: colors.light } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { fontFamily, color: colors.text },
          splitLine: { lineStyle: { color: '#e2e8f0' } },
        },
        series: [{
          name: '预约数',
          type: 'bar',
          data: data.map((d: any) => d.count),
          itemStyle: { color: colors.primary, borderRadius: [4, 4, 0, 0] },
          barWidth: '50%',
        }],
      })
    } catch { /* 无数据 */ }
  }

  if (timeSlotChartRef.value) {
    const chart = echarts.init(timeSlotChartRef.value)
    charts.push(chart)
    try {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString().split('T')[0]
      const end = new Date().toISOString().split('T')[0]
      const res = await request.get('/reports/time-slot-report', { params: { start, end } })
      const data = res?.data || []
      chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: data.map((d: any) => d.timeSlot),
          axisLabel: { rotate: 30, fontFamily, color: colors.text },
          axisLine: { lineStyle: { color: colors.light } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { fontFamily, color: colors.text },
          splitLine: { lineStyle: { color: '#e2e8f0' } },
        },
        series: [{
          name: '预约数',
          type: 'line',
          smooth: true,
          data: data.map((d: any) => d.reservationCount),
          itemStyle: { color: colors.secondary },
          lineStyle: { width: 3 },
          areaStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(113,128,150,0.3)' },
              { offset: 1, color: 'rgba(113,128,150,0.05)' },
            ]),
          },
        }],
      })
    } catch { /* 无数据 */ }
  }

  window.addEventListener('resize', handleResize)
}

function handleResize() {
  charts.forEach(c => c.resize())
}

async function loadAll() {
  loading.value = true
  try {
    await loadOverview()
    charts.forEach(c => c.dispose())
    charts = []
    await initCharts()
  } finally {
    loading.value = false
  }
}

onMounted(() => loadAll())
onUnmounted(() => {
  charts.forEach(c => c.dispose())
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* ===== 教务风格变量 ===== */
:root {
  --school-primary: #2c5282;
  --school-secondary: #4a5568;
  --school-muted: #718096;
  --school-bg: #f7fafc;
  --school-border: #e2e8f0;
}

.statistics-page { padding: 0 4px; background: #f7fafc; min-height: 100%; }
.page-title { font-size: 20px; color: #2d3748; margin-bottom: 16px; font-weight: 600; }
.filter-card { margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.refresh-btn { margin-left: auto; }
.overview-row { margin-bottom: 16px; }

/* ===== 统计卡片：左侧竖线标识，蓝灰配色 ===== */
.stat-card {
  border-radius: 6px;
  text-align: left;
  padding: 16px 20px;
  border-left: 4px solid #2c5282;
  background: #fff;
  transition: none;
}
.stat-card .stat-value {
  font-size: 26px;
  font-weight: 600;
  color: #2d3748;
  font-family: 'SF Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
  letter-spacing: -0.5px;
}
.stat-card .stat-label {
  font-size: 13px;
  color: #718096;
  margin-top: 6px;
  font-weight: 500;
}
.stat-card.primary { border-left-color: #2c5282; }
.stat-card.secondary { border-left-color: #4a5568; }
.stat-card.muted { border-left-color: #a0aec0; }

/* ===== 图表区 ===== */
.chart-row { margin-bottom: 16px; }
.chart-area { height: 280px; }

/* 覆盖 Element Plus 卡片样式 */
:deep(.el-card) { border-radius: 6px; border: 1px solid #e2e8f0; }
:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}
</style>
