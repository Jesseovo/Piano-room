<template>
  <div class="dashboard-container">
    <h2 class="page-title">控制台</h2>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card primary">
          <div class="stat-card-content">
            <div class="stat-info">
              <div class="stat-title">今日预约数</div>
              <div class="stat-value">{{ overview.totalReservations }}</div>
            </div>
            <div class="stat-icon">
              <i class="el-icon-date"></i>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card success">
          <div class="stat-card-content">
            <div class="stat-info">
              <div class="stat-title">预约通过率</div>
              <div class="stat-value">{{ overview.approvalRate }}%</div>
            </div>
            <div class="stat-icon">
              <i class="el-icon-check"></i>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card info">
          <div class="stat-card-content">
            <div class="stat-info">
              <div class="stat-title">琴房使用率</div>
              <div class="stat-value">{{ overview.roomUtilizationRate }}%</div>
              <el-progress :percentage="overview.roomUtilizationRate" :show-text="false" class="usage-progress"></el-progress>
            </div>
            <div class="stat-icon">
              <i class="el-icon-office-building"></i>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card warning">
          <div class="stat-card-content">
            <div class="stat-info">
              <div class="stat-title">活跃用户数</div>
              <div class="stat-value">{{ overview.activeUsers }}</div>
            </div>
            <div class="stat-icon">
              <i class="el-icon-user"></i>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表和表格 -->
    <el-row :gutter="20" class="chart-section">
      <!-- 预约趋势图表 -->
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <div slot="header" class="chart-header">
            <span>预约趋势</span>
            <el-dropdown size="small" @command="handleTimeRangeChange">
              <span class="el-dropdown-link">
                {{ timeRangeText }} <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="today">今天</el-dropdown-item>
                <el-dropdown-item command="week">本周</el-dropdown-item>
                <el-dropdown-item command="month">本月</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="chart-container">
            <div ref="reservationTrendChart" class="echarts-container"></div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 琴房使用分布 -->
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <div slot="header">
            <span>琴房使用分布</span>
          </div>
          <div class="chart-container">
            <div ref="roomUsageChart" class="echarts-container"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 最近预约和系统日志 -->
    <el-row :gutter="20" class="table-section">
      <!-- 最近预约 -->
      <el-col :span="12">
        <el-card shadow="hover" class="data-card">
          <div slot="header">
            <span>最近预约</span>
          </div>
          <el-table :data="recentReservations" style="width: 100%" size="small">
            <el-table-column prop="id" label="ID" width="70"></el-table-column>
            <el-table-column prop="username" label="用户" width="100"></el-table-column>
            <el-table-column prop="roomName" label="琴房" width="100"></el-table-column>
            <el-table-column prop="time" label="时间">
              <template slot-scope="scope">
                {{ scope.row.startTime }} - {{ scope.row.endTime }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-footer">
            <router-link to="/admin/reservations">
              <el-button type="primary" size="small" plain>
                查看全部预约 <i class="el-icon-arrow-right"></i>
              </el-button>
            </router-link>
          </div>
        </el-card>
      </el-col>
      
      <!-- 系统日志 -->
      <el-col :span="12">
        <el-card shadow="hover" class="data-card">
          <div slot="header">
            <span>系统日志</span>
          </div>
          <div class="log-list">
            <div v-for="(log, index) in systemLogs" :key="index" class="log-item">
              <div class="log-header">
                <h4>{{ log.operationModule }} - {{ log.operationType }}</h4>
                <small>{{ formatTime(log.createdAt) }}</small>
              </div>
              <p>{{ log.operationDesc }}（{{ log.username }}，IP: {{ log.requestIp }}）</p>
            </div>
          </div>
          <div class="table-footer">
            <el-button type="primary" size="small" plain>
              查看全部日志 <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { statisticsApi } from '@/api/statistics'
import { roomTypeApi } from '@/api/roomType'
import { reservationApi } from '@/api/reservations'
import { operationLogApi } from '@/api/operationLog'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

export default {
  name: 'Dashboard',
  data() {
    return {
      // 时间范围
      timeRange: 'today',
      timeRangeText: '今天',
      // 加载状态
      loading: false,
      // 概览数据
      overview: {
        totalReservations: 0,
        approvalRate: 0,
        roomUtilizationRate: 0,
        activeUsers: 0
      },
      // 预约趋势数据
      reservationTrend: {
        dates: [],
        data: []
      },
      // 琴房使用分布数据
      roomUsage: {
        labels: [],
        data: []
      },
      // 请求参数
      params: {
        start: dayjs().format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD')
      },
      // 图表实例
      charts: {
        reservationTrend: null,
        roomUsage: null
      },
      // 琴房类型列表
      roomTypeList: [],
      // 最近预约数据
      recentReservations: [
        { id: 1024, user: '张三', room: '主楼301', time: '10-15 14:00-16:00', status: '待审核' },
        { id: 1023, user: '李四', room: '图书馆205', time: '10-15 10:00-12:00', status: '已通过' },
        { id: 1022, user: '王五', room: '科技楼102', time: '10-14 16:00-18:00', status: '已拒绝' },
        { id: 1021, user: '赵六', room: '主楼401', time: '10-14 08:00-10:00', status: '已通过' },
        { id: 1020, user: '钱七', room: '图书馆301', time: '10-13 14:00-16:00', status: '已通过' },
      ],
      // 系统日志数据
      systemLogs: [
        { title: '管理员登录系统', time: '10分钟前', content: '管理员(admin)登录了系统。IP: 192.168.1.100' },
        { title: '审核通过预约', time: '30分钟前', content: '管理员(admin)审核通过了预约ID:1023。' },
        { title: '拒绝预约申请', time: '1小时前', content: '管理员(admin)拒绝了预约ID:1022。原因：时间冲突' },
        { title: '添加新琴房', time: '2小时前', content: '管理员(admin)添加了新琴房：图书馆305。' },
        { title: '发布新公告', time: '3小时前', content: '管理员(admin)发布了新公告：关于期末考试期间琴房预约的通知。' },
      ]
    }
  },
  created() {
    this.fetchRoomTypeList()

    //最近预约
    this.fetchRecentReservations()

    //系统日志
    this.fetchSystemLogs()
  },
  mounted() {
    this.initCharts()
    this.refreshData()
    
    // 监听窗口大小变化，重新绘制图表
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    // 移除监听器
    window.removeEventListener('resize', this.resizeCharts)
    
    // 销毁图表实例
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.dispose()
      }
    })
  },
  methods: {
    // 获取状态文本
    getStatusText(status) {
      switch (status) {
        case 'pending':
          return '待审核';
        case 'approved':
          return '已通过';
        case 'rejected':
          return '已拒绝';
        case 'cancelled':
          return '已取消';
        case 'completed':
          return '已完成';
        case 'occupied':
          return '已占用';
        default:
          return '未知';
      }
    },
    // 格式化时间
    formatTime(timeString) {
      if (!timeString) return '';
      
      const date = new Date(timeString);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000); // 差异秒数
      
      if (diff < 60) return diff + '秒前';
      if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
      if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
      if (diff < 2592000) return Math.floor(diff / 86400) + '天前';
      
      return date.toLocaleDateString();
    },
    
    //系统日志
    fetchSystemLogs() {
      operationLogApi.getOperationLogPage({
        pageNum: 1,
        pageSize: 5
      }).then(response => {
        if (response && response.code === 1) {
          this.systemLogs = response.data.rows;
        }
      })
    },
    //最近预约
    fetchRecentReservations() {
      reservationApi.getReservationList({
        page: 1,
        pageSize: 5
      }).then(response => {
        if (response && response.code === 1) {
          this.recentReservations = response.data.rows
        }
      })
    },
    //获取琴房类型列表
    fetchRoomTypeList() {
      roomTypeApi.list().then(response => {
        // 为每个琴房类型分配颜色
        const colorPalette = [
          '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', 
          '#36B9CC', '#6610f2', '#fd7e14', '#20c997', '#17a2b8'
        ];
        
        this.roomTypeList = response.data.list.map((item, index) => {
          return {
            ...item,
            color: colorPalette[index % colorPalette.length]
          };
        });
      })
    },
    
    // 初始化所有图表
    initCharts() {
      this.$nextTick(() => {
        // 初始化预约趋势图
        this.charts.reservationTrend = echarts.init(this.$refs.reservationTrendChart)
        
        // 初始化琴房使用分布图
        this.charts.roomUsage = echarts.init(this.$refs.roomUsageChart)
        
        // 设置默认配置
        this.renderCharts()
      })
    },
    
    // 统一重绘所有图表
    renderCharts() {
      this.renderReservationTrendChart()
      this.renderRoomUsageChart()
    },
    
    // 窗口大小变化时重绘图表
    resizeCharts() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          chart.resize()
        }
      })
    },
    
    // 渲染预约趋势图
    renderReservationTrendChart() {
      if (!this.charts.reservationTrend) return
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.reservationTrend.dates
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '预约数量',
            type: 'line',
            smooth: true,
            data: this.reservationTrend.data,
            itemStyle: {
              color: '#409EFF'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                  { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
                ]
              }
            }
          }
        ]
      }
      
      this.charts.reservationTrend.setOption(option)
    },
    
    // 渲染琴房使用分布图表
    renderRoomUsageChart() {
      if (!this.charts.roomUsage) return
      
      // 定义更丰富的颜色数组
      const colorPalette = [
        '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', 
        '#36B9CC', '#6610f2', '#fd7e14', '#20c997', '#17a2b8'
      ];
      
      // 为每个琴房类型随机分配固定的颜色
      const typeColors = {};
      this.roomTypeList.forEach((item, index) => {
        typeColors[item.typeName] = item.color || colorPalette[index % colorPalette.length];
      });
      
      // 构建饼图数据，确保即使count为0也显示
      const pieData = this.roomUsage.labels.map((label, index) => ({
        value: this.roomUsage.data[index] || 0, // 确保值为0时仍然显示
        name: label,
        itemStyle: {
          color: typeColors[label] || colorPalette[index % colorPalette.length]
        }
      }));
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          show: false,
          data: [],
          selected: {}
        },
        series: [
          {
            name: '琴房使用分布',
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c}'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true
            },
            data: pieData
          }
        ]
      }
      
      this.charts.roomUsage.setOption(option)
    },
    
    // 处理时间范围变化
    handleTimeRangeChange(value) {
      this.timeRange = value;
      
      const end = dayjs()
      let start = dayjs()
      
      switch (value) {
        case 'week':
          // 本周（周一到当前）
          start = dayjs().startOf('week')
          this.timeRangeText = '本周'
          break
        case 'month':
          // 本月（1号到当前）
          start = dayjs().startOf('month')
          this.timeRangeText = '本月'
          break
        case 'today':
        default:
          // 今天
          start = dayjs()
          this.timeRangeText = '今天'
          break
      }
      
      this.params.start = start.format('YYYY-MM-DD')
      this.params.end = end.format('YYYY-MM-DD')
      
      this.refreshData()
    },
    
    // 刷新所有数据
    refreshData() {
      this.loading = true;
      
      // 获取概览数据：预约总数
      statisticsApi.getCountReservations(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.totalReservations = response.data;
            this.loading = false;
          }
        })

      // 获取概览数据：预约通过率
      statisticsApi.getApprovalRate(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.approvalRate = (response.data * 100).toFixed(1);
            this.loading = false;
          }
        })

      // 获取概览数据：琴房使用率
      statisticsApi.getClassroomUsageRate(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.roomUtilizationRate = (response.data * 100).toFixed(1);
            this.loading = false;
          }
        })

      // 获取概览数据：活跃用户
      statisticsApi.getActiveUsers(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.activeUsers = response.data;
            this.loading = false;
          }
        })

      // 获取趋势分析
      statisticsApi.getTrendAnalysis(this.params)
        .then(response => {
          if (response && response.code === 1) {
            // 清空原有数据
            this.reservationTrend.dates = [];
            this.reservationTrend.data = [];
            
            const res = response.data;
            if (res && res.length > 0) {
              // 确保数据按周几排序: 周一到周日
              const weekDayOrder = {'周一': 0, '周二': 1, '周三': 2, '周四': 3, '周五': 4, '周六': 5, '周日': 6};
              const sortedRes = [...res].sort((a, b) => weekDayOrder[a.dayOfWeek] - weekDayOrder[b.dayOfWeek]);
              
              // 填充数据
              sortedRes.forEach(item => {
                this.reservationTrend.dates.push(item.dayOfWeek);
                this.reservationTrend.data.push(item.count);
              });
            }
            
            // 重新渲染图表
            this.renderReservationTrendChart();
            this.loading = false;
          }
        })
        
      // 获取琴房类型使用分布
      statisticsApi.getClassroomDistribution(this.params)
        .then(response => {
          if (response && response.code === 1) {
            const res = response.data;
            this.roomUsage.labels = [];
            this.roomUsage.data = [];
            if (res && res.length > 0) {
              this.roomUsage.labels = res.map(item => item.typeName);
              this.roomUsage.data = res.map(item => item.count);
              
              // 重新渲染琴房使用分布图表
              this.renderRoomUsageChart();
            }
            this.loading = false;
          }
        })
    },
    
    // 获取状态对应的标签类型
    getStatusType(status) {
      const statusMap = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'cancelled': 'info',
        'finished': 'success',
        'completed': 'success',
        'occupied': 'danger'
      };
      return statusMap[status] || 'info';
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

/* 统计卡片样式 */
.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
}

.stat-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-icon {
  font-size: 48px;
  opacity: 0.3;
}

.usage-progress {
  margin-top: 5px;
  width: 120px;
}

/* 卡片颜色 */
.stat-card.primary .stat-icon {
  color: #4e73df;
}

.stat-card.success .stat-icon {
  color: #1cc88a;
}

.stat-card.info .stat-icon {
  color: #36b9cc;
}

.stat-card.warning .stat-icon {
  color: #f6c23e;
}

/* 图表部分样式 */
.chart-section {
  margin-bottom: 20px;
}

.chart-card .chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  position: relative;
}

.echarts-container {
  height: 300px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.legend-color {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.legend-color.primary {
  background-color: #4e73df;
}

.legend-color.success {
  background-color: #1cc88a;
}

.legend-color.info {
  background-color: #36b9cc;
}

/* 表格部分样式 */
.table-section {
  margin-bottom: 20px;
}

.data-card {
  height: 450px;
}

.table-footer {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

/* 日志列表样式 */
.log-list {
  height: 350px;
  overflow-y: auto;
}

.log-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.log-item:last-child {
  border-bottom: none;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.log-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.log-header small {
  color: #999;
}

.log-item p {
  margin: 0;
  font-size: 13px;
  color: #666;
}
</style>


