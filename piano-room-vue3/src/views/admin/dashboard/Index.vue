<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h2 class="page-title">控制台</h2>
        <p class="page-desc">欢迎回来，{{ authStore.user?.realName || authStore.user?.username }} ♩</p>
      </div>
      <div class="header-date">{{ currentDateStr }}</div>
    </div>

    <!-- 统计卡片：4 个 -->
    <div class="stat-grid animate-stagger">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="stat-card"
        :style="{ '--card-color': card.color }"
      >
        <div class="stat-card-left">
          <div class="stat-icon-wrap">
            <el-icon :size="26"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-label">{{ card.label }}</div>
        </div>
        <div class="stat-card-right">
          <div class="stat-value" :class="{ loaded: card.value !== '--' }">{{ card.value }}</div>
          <div class="stat-unit">{{ card.unit }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="chart-grid">
      <div class="chart-card chart-card-sm">
        <div class="chart-card-header">
          <span class="chart-title">今日预约分布</span>
        </div>
        <div ref="statusChartRef" class="chart-area"></div>
      </div>
      <div class="chart-card chart-card-lg">
        <div class="chart-card-header">
          <span class="chart-title">预约趋势（本周）</span>
        </div>
        <div ref="weekChartRef" class="chart-area"></div>
      </div>
    </div>

    <div class="chart-grid chart-grid-1">
      <div class="chart-card">
        <div class="chart-card-header">
          <span class="chart-title">热门时段分析</span>
          <span class="chart-sub">近 7 天</span>
        </div>
        <div ref="timeSlotChartRef" class="chart-area"></div>
      </div>
    </div>

    <!-- 最近预约列表 -->
    <div class="recent-card">
      <div class="chart-card-header">
        <span class="chart-title">最近预约</span>
        <el-button link type="primary" size="small" @click="$router.push('/admin/reservations')">
          查看全部 →
        </el-button>
      </div>
      <el-skeleton v-if="recentLoading" :rows="4" animated style="padding:16px" />
      <el-table
        v-else
        :data="recentReservations"
        size="small"
        style="width:100%"
        :show-header="true"
      >
        <el-table-column label="预约人" prop="username" width="100" />
        <el-table-column label="琴房" prop="roomName" min-width="120" show-overflow-tooltip />
        <el-table-column label="开始时间" prop="startTime" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!recentLoading && recentReservations.length === 0" class="empty-recent">
        <el-empty description="暂无预约记录" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import request from '@/utils/request'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const authStore = useAuthStore()

const weekChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()
const timeSlotChartRef = ref<HTMLElement>()

const currentDateStr = dayjs().format('YYYY年MM月DD日 dddd')

const statCards = ref([
  { label: '今日已预约', value: '--', unit: '时段', icon: 'Calendar', color: '#3b82f6' },
  { label: '今日可预约', value: '--', unit: '时段', icon: 'CircleCheck', color: '#10b981' },
  { label: '活跃用户', value: '--', unit: '人', icon: 'User', color: '#6366f1' },
  { label: '总练习时长', value: '--', unit: '小时', icon: 'Timer', color: '#f59e0b' },
])

const recentReservations = ref<any[]>([])
const recentLoading = ref(true)

let charts: echarts.ECharts[] = []

// 简约蓝系 ECharts 主题色
const warmColors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#64748b']

function statusLabel(s: string) {
  const m: Record<string, string> = { approved: '已预约', completed: '已完成', cancelled: '已取消', occupied: '违约' }
  return m[s] || s
}
function statusTagType(s: string) {
  const m: Record<string, string> = { approved: 'primary', completed: 'success', cancelled: 'info', occupied: 'danger' }
  return (m[s] || '') as any
}

async function loadStats() {
  try {
    const [overviewRes, activeRes, practiceRes] = await Promise.allSettled([
      request.get('/reports/bookingOverview'),
      request.get('/reports/activeUsers'),
      request.get('/reports/totalPracticeHours'),
    ])
    const overview = (overviewRes as any).value?.data
    if (overview && statCards.value[0] && statCards.value[1]) {
      statCards.value[0].value = String(overview.bookedToday ?? '--')
      statCards.value[1].value = String(overview.availableToday ?? '--')
    }
    const active = (activeRes as any).value?.data
    if (active !== undefined && active !== null && statCards.value[2]) {
      statCards.value[2].value = String(active)
    }
    const practice = (practiceRes as any).value?.data
    if (practice !== undefined && practice !== null && statCards.value[3]) {
      statCards.value[3].value = String(Math.round(Number(practice) || 0))
    }
  } catch { /* 静默 */ }
}

async function loadRecentReservations() {
  recentLoading.value = true
  try {
    const res = await request.get('/reservations/list', { params: { page: 1, pageSize: 8 } })
    recentReservations.value = Array.isArray(res?.data?.records) ? res.data.records : []
  } catch {
    recentReservations.value = []
  } finally {
    recentLoading.value = false
  }
}

function buildChartTheme() {
  return {
    color: warmColors,
    textStyle: { fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif', color: '#475569' },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      textStyle: { color: '#f8fafc' },
    },
    axisLine: { lineStyle: { color: '#e2e8f0' } },
    splitLine: { lineStyle: { color: '#f1f5f9' } },
  }
}

async function initCharts() {
  const theme = buildChartTheme()

  // 周趋势柱状图
  if (weekChartRef.value) {
    const chart = echarts.init(weekChartRef.value)
    charts.push(chart)
    try {
      const res = await request.get('/reports/weekly')
      const data = res?.data || []
      chart.setOption({
        ...theme,
        tooltip: { ...theme.tooltip, trigger: 'axis' },
        grid: { top: 20, right: 20, bottom: 30, left: 40 },
        xAxis: {
          type: 'category',
          data: data.map((d: any) => d.dayOfWeek),
          axisLine: theme.axisLine,
          axisTick: { show: false },
          axisLabel: { color: '#a08060' },
        },
        yAxis: {
          type: 'value',
          splitLine: theme.splitLine,
          axisLabel: { color: '#a08060' },
        },
        series: [{
          name: '预约数',
          type: 'bar',
          data: data.map((d: any) => d.count),
          barMaxWidth: 40,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: '#3b82f6' },
            ]),
            borderRadius: [6, 6, 0, 0],
          },
        }],
      })
    } catch { /* 无数据 */ }
  }

  // 今日预约分布饼图
  if (statusChartRef.value) {
    const chart = echarts.init(statusChartRef.value)
    charts.push(chart)
    try {
      const res = await request.get('/reports/bookingOverview')
      const data = res?.data || {}
      const booked = Number(data.bookedToday) || 0
      const available = Number(data.availableToday) || 0
      chart.setOption({
        ...theme,
        tooltip: { ...theme.tooltip, trigger: 'item' },
          legend: { bottom: 0, textStyle: { color: '#475569' } },
          series: [{
            type: 'pie',
            radius: ['42%', '68%'],
            center: ['50%', '44%'],
            label: { fontFamily: 'PingFang SC, sans-serif', color: '#475569' },
            data: [
              {
                name: '已预约', value: booked,
                itemStyle: { color: '#3b82f6' },
              },
              {
                name: '可预约', value: available,
                itemStyle: { color: '#10b981' },
              },
            ],
          }],
      })
    } catch { /* 无数据 */ }
  }

  // 热门时段折线图
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
        ...theme,
        tooltip: { ...theme.tooltip, trigger: 'axis' },
        grid: { top: 20, right: 20, bottom: 50, left: 50 },
        xAxis: {
          type: 'category',
          data: data.map((d: any) => d.timeSlot),
          axisLabel: { rotate: 35, color: '#a08060', fontSize: 11 },
          axisLine: theme.axisLine,
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value',
          splitLine: theme.splitLine,
          axisLabel: { color: '#a08060' },
        },
          series: [{
            name: '预约数',
            type: 'line',
            smooth: true,
            data: data.map((d: any) => d.reservationCount),
            symbolSize: 6,
            lineStyle: { width: 3, color: '#3b82f6' },
            itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#fff' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.18)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0)' },
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

onMounted(async () => {
  await loadStats()
  await loadRecentReservations()
  await initCharts()
})

onUnmounted(() => {
  charts.forEach(c => c.dispose())
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dashboard { }

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}

.page-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.header-date {
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-bg-section);
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
}

/* ===== 统计卡片：4列网格 ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--card-color, #3b82f6);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}
.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-card-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--card-color, #3b82f6) 10%, white);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--card-color, #3b82f6);
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.stat-card-right {
  text-align: right;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-value.loaded {
  animation: fadeInUp 0.3s ease both;
}

.stat-unit {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* ===== 图表 ===== */
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-grid-1 {
  grid-template-columns: 1fr;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.25s ease;
}
.chart-card:hover { box-shadow: var(--shadow-md); }

.chart-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.chart-sub {
  font-size: 12px;
  color: var(--color-text-muted);
  background: var(--color-bg-warm);
  padding: 2px 8px;
  border-radius: 999px;
}

.chart-area { height: 260px; }

/* ===== 最近预约 ===== */
.recent-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 20px;
  margin-top: 0;
  box-shadow: var(--shadow-sm);
}

.empty-recent {
  padding: 32px 0;
}

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .chart-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-header { flex-direction: column; gap: 12px; }
}

@media (max-width: 480px) {
  .stat-grid { grid-template-columns: 1fr; }
}
</style>
