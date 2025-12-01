<template>
  <div class="statistics-container">
    <h2 class="page-title">统计分析</h2>

    <!-- 时间范围选择 -->
    <el-card shadow="hover" class="filter-container">
      <div class="time-range-container">
        <span class="label">时间范围：</span>
        <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
          <el-radio-button label="today">今天</el-radio-button>
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="custom">自定义</el-radio-button>
        </el-radio-group>
        
        <div v-show="timeRange === 'custom'" class="custom-date-range">
          <el-date-picker
            v-model="customDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
            @change="handleDateRangeChange">
          </el-date-picker>
        </div>
        
        <el-button type="primary" @click="refreshData" :loading="loading">
          <i class="el-icon-refresh-right"></i> 刷新数据
        </el-button>
      </div>
    </el-card>

    <!-- 数据概览 -->
    <div class="overview-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card primary">
            <div class="overview-icon">
              <i class="el-icon-date"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">预约总数</div>
              <div class="overview-value">{{ overview.totalReservations }}</div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card success">
            <div class="overview-icon">
              <i class="el-icon-check"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">通过率</div>
              <div class="overview-value">{{ overview.approvalRate }}%</div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card info">
            <div class="overview-icon">
              <i class="el-icon-office-building"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">琴房使用率</div>
              <div class="overview-value">{{ overview.roomUtilizationRate }}%</div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card warning">
            <div class="overview-icon">
              <i class="el-icon-user"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">活跃用户数</div>
              <div class="overview-value">{{ overview.activeUsers }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card danger">
            <div class="overview-icon">
              <i class="el-icon-timer"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">总练习时长</div>
              <div class="overview-value">{{ overview.totalPracticeHours }}小时</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card purple">
            <div class="overview-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="overview-content">
              <div class="overview-title">平均练习时长</div>
              <div class="overview-value">{{ overview.avgPracticeHours }}小时</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表展示区域 -->
    <div class="charts-container">
      <el-row :gutter="20">
        <!-- 预约趋势�?-->
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="chart-card">
            <div slot="header" class="clearfix">
              <span>预约趋势</span>
            </div>
            <div class="chart-container">
              <div ref="reservationTrendChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>

        <!-- 琴房使用分布�?-->
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="chart-card">
            <div slot="header" class="clearfix">
              <span>琴房使用分布</span>
            </div>
            <div class="chart-container">
              <div ref="roomUsageChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 预约状态分�?-->
        <el-col :xs="24" :sm="24">
          <el-card shadow="hover" class="chart-card">
            <div slot="header" class="clearfix">
              <span>预约状态分布</span>
            </div>
            <div class="chart-container">
              <div ref="reservationStatusChart" class="chart"></div>
            </div>
          </el-card>
        </el-col>

        <!-- 用户活跃度分�?-->
        <!-- <el-col :xs="24" :sm="12">
          <el-card shadow="hover" class="chart-card">
            <div slot="header" class="clearfix">
              <span>用户活跃度分�?/span>
            </div>
            <div class="chart-container">
              <div ref="userActivityChart" class="chart"></div>
            </div>
          </el-card>
        </el-col> -->
      </el-row>

      <!-- 热门时段分析 -->
      <el-card shadow="hover" class="chart-card">
        <div slot="header" class="clearfix">
          <span>热门时段分析</span>
        </div>
        <div class="chart-container">
          <div ref="timeSlotChart" class="chart"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { statisticsApi } from '@/api/statistics'
import { roomTypeApi } from '@/api/roomType'
import * as echarts from 'echarts'
import dayjs from 'dayjs'

export default {
  name: 'Statistics',
  data() {
    return {
      roomTypeList: [],
      // 加载状态
      loading: false,
      // 时间范围
      timeRange: 'today',
      // 自定义日期范围
      customDateRange: [],
      // 日期选择器配置
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      // 统计数据
      overview: {
        totalReservations: 0,
        approvalRate: 0,
        roomUtilizationRate: 0,
        activeUsers: 0,
        totalPracticeHours: 0,
        avgPracticeHours: 0
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
      // 预约状态分布数据
      reservationStatus: {
        labels: [],
        data: []
      },
      // 用户活跃度分析数据
      userActivity: {
        labels: [],
        data: []
      },
      // 热门时段分析数据
      timeSlot: {
        labels: [],
        data: []
      },
      // 图表实例
      charts: {
        reservationTrend: null,
        roomUsage: null,
        reservationStatus: null,
        userActivity: null,
        timeSlot: null
      },
      // 请求参数
      params: {
        start: dayjs().format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD')
      }
    }
  },
  created() {
    this.fetchRoomTypeList()
  },
  mounted() {
    // 等待DOM渲染完成后初始化图表
    this.$nextTick(() => {
      try {
        this.initCharts()
        // 监听窗口大小变化，重新绘制图表        window.addEventListener('resize', this.resizeCharts)
        // 加载数据
        this.refreshData()
      } catch (error) {
        console.error('图表初始化错误', error)
        this.$message.error('图表加载失败，请刷新页面重试')
      }
    })
  },
  beforeDestroy() {
    // 移除监听器    window.removeEventListener('resize', this.resizeCharts)
    
    // 销毁图表实例
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.dispose()
      }
    })
  },
  methods: {
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
        
        console.log('琴房类型列表:', this.roomTypeList);
        
        // 初始化图表(如果已挂载)
        if (this.charts && this.charts.roomUsage) {
          this.renderRoomUsageChart();
        }
      })
    },
    // 初始化所有图表
    initCharts() {
      // 使用nextTick确保DOM已经渲染完成
      this.$nextTick(() => {
        try {
          // 初始化预约趋势图
          if (this.$refs.reservationTrendChart) {
            this.charts.reservationTrend = echarts.init(this.$refs.reservationTrendChart);
          }
          
          // 初始化琴房使用分布图
          if (this.$refs.roomUsageChart) {
            this.charts.roomUsage = echarts.init(this.$refs.roomUsageChart);
          }
          
          // 初始化预约状态分布图
          if (this.$refs.reservationStatusChart) {
            this.charts.reservationStatus = echarts.init(this.$refs.reservationStatusChart);
          }
          
          // 用户活跃度分析图可能不存在，因为在模板中被注释了
          if (this.$refs.userActivityChart) {
            this.charts.userActivity = echarts.init(this.$refs.userActivityChart);
          }
          
          // 初始化热门时段分析图
          if (this.$refs.timeSlotChart) {
            this.charts.timeSlot = echarts.init(this.$refs.timeSlotChart);
          }
          
          // 渲染可用的图表
          this.renderAvailableCharts();
        } catch (error) {
          console.error('图表初始化失败', error);
        }
      });
    },
    
    // 只渲染可用的图表
    renderAvailableCharts() {
      if (this.charts.reservationTrend) this.renderReservationTrendChart();
      if (this.charts.roomUsage) this.renderRoomUsageChart();
      if (this.charts.reservationStatus) this.renderReservationStatusChart();
      if (this.charts.userActivity) this.renderUserActivityChart();
      if (this.charts.timeSlot) this.renderTimeSlotChart();
    },
    
    // 统一重绘所有图表
    renderCharts() {
      this.renderAvailableCharts();
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
    
    // 渲染琴房使用分布图
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
    
    // 渲染预约状态分布图
    renderReservationStatusChart() {
      if (!this.charts.reservationStatus) return
      
      const colors = ['#FFCD56', '#36A2EB', '#FF6384', '#4BC0C0', '#9966FF']
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.reservationStatus.labels
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '数量',
            type: 'bar',
            data: this.reservationStatus.data.map((value, index) => ({
              value,
              itemStyle: {
                color: colors[index % colors.length]
              }
            }))
          }
        ]
      }
      
      this.charts.reservationStatus.setOption(option)
    },
    
    // 渲染用户活跃度分析图
    renderUserActivityChart() {
      if (!this.charts.userActivity) return
      
      const colors = ['#FF6384', '#36A2EB', '#FFCD56']
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.userActivity.labels
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '活跃用户',
            type: 'bar',
            data: this.userActivity.data.map((value, index) => ({
              value,
              itemStyle: {
                color: colors[index % colors.length]
              }
            }))
          }
        ]
      }
      
      this.charts.userActivity.setOption(option)
    },
    
    // 渲染热门时段分析图
    renderTimeSlotChart() {
      if (!this.charts.timeSlot) return
      
      try {
        // 检查是否所有值都为0
        const allZero = this.timeSlot.data.every(value => value === 0 || value === '0');
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: '{b}<br/>{a}: {c}'
          },
          legend: {
            data: ['预约次数'],
            bottom: 10
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '13%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: this.timeSlot.labels,
            axisLabel: {
              interval: 0,
              rotate: 30
            }
          },
          yAxis: {
            type: 'value',
            minInterval: 1,
            name: '预约次数'
          },
          series: [
            {
              name: '预约次数',
              type: 'bar',
              barWidth: '60%',
              data: this.timeSlot.data,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#4BC0C0' },
                  { offset: 1, color: '#188df0' }
                ])
              },
              emphasis: {
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#2378f7' },
                    { offset: 0.7, color: '#2b91ee' },
                    { offset: 1, color: '#1aa0fc' }
                  ])
                }
              }
            }
          ]
        }
        
        // 如果所有值为0，添加文本标识
        if (allZero) {
          option.graphic = [
            {
              type: 'text',
              left: 'center',
              top: 'middle',
              style: {
                text: '当前时间段内无预约数据',
                fill: '#999',
                font: '14px Microsoft YaHei'
              }
            }
          ];
        }
        
        this.charts.timeSlot.setOption(option)
      } catch (error) {
        console.error('渲染热门时段图表失败:', error)
      }
    },
    
    // 处理时间范围变化
    handleTimeRangeChange(value) {
      // 如果是自定义，不做额外处理
      if (value === 'custom') {
        return
      }
      
      const end = dayjs()
      let start = dayjs()
      
      switch (value) {
        case 'week':
          // 本周（周一到当前）
          start = dayjs().startOf('week')
          break
        case 'month':
          // 本月1号到当前
          start = dayjs().startOf('month')
          break
        case 'today':
        default:
          // 今天
          start = dayjs()
          break
      }
      
      this.params.start = start.format('YYYY-MM-DD')
      this.params.end = end.format('YYYY-MM-DD')
      
      this.refreshData()
    },
    
    // 处理自定义日期范围变化
    handleDateRangeChange(value) {
      if (value && value.length === 2) {
        this.params.start = value[0]
        this.params.end = value[1]
        this.refreshData()
      }
    },
    
    // 刷新所有数据
    refreshData() {
      this.loading = true;
      
      //获取概览数据：预约总数
      statisticsApi.getCountReservations(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.totalReservations = response.data;
            this.loading = false;
          }
        });

      //获取概览数据：预约通过率
      statisticsApi.getApprovalRate(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.approvalRate = (response.data * 100).toFixed(1);
            this.loading = false;
          }
        });

      //获取概览数据：琴房使用率
      statisticsApi.getClassroomUsageRate(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.roomUtilizationRate = (response.data * 100).toFixed(1);
            this.loading = false;
          }
        });

      //获取概览数据：活跃用户
      statisticsApi.getActiveUsers(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.activeUsers = response.data;
            this.loading = false;
          }
        });

      //获取概览数据：总练习时长
      statisticsApi.getTotalPracticeHours(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.totalPracticeHours = (response.data || 0).toFixed(1);
            this.loading = false;
          }
        })
        .catch(error => {
          console.error('获取总练习时长失败', error);
          this.overview.totalPracticeHours = 0;
        });

      //获取概览数据：平均练习时长
      statisticsApi.getAvgPracticeHours(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview.avgPracticeHours = (response.data || 0).toFixed(1);
            this.loading = false;
          }
        })
        .catch(error => {
          console.error('获取平均练习时长失败:', error);
          this.overview.avgPracticeHours = 0;
        });

      //获取趋势分析
      statisticsApi.getTrendAnalysis(this.params)
        .then(response => {
          if (response && response.code === 1) {
            // 清空原有数据
            this.reservationTrend.dates = [];
            this.reservationTrend.data = [];
            
            const res = response.data;
            if (res && res.length > 0) {
              // 确保数据按周几排序，周一到周日
              const weekDayOrder = {'周一': 0, '周二': 1, '周三': 2, '周四': 3, '周五': 4, '周六': 5, '周日': 6};
              const sortedRes = [...res].sort((a, b) => weekDayOrder[a.dayOfWeek] - weekDayOrder[b.dayOfWeek]);
              
              // 填充数据
              sortedRes.forEach(item => {
                this.reservationTrend.dates.push(item.dayOfWeek);
                this.reservationTrend.data.push(item.count);
              });
            }
            
            console.log('更新后的预约趋势数据:', this.reservationTrend);
            
            // 重新渲染图表
            this.renderReservationTrendChart();
            this.loading = false;
          }
        });

        //获取琴房类型使用分布
        statisticsApi.getClassroomDistribution(this.params)
          .then(response => {
            if (response && response.code === 1) {
             const res = response.data;
             this.roomUsage.labels = [];
             this.roomUsage.data = [];
             if (res && res.length > 0) {
              this.roomUsage.labels = res.map(item => item.typeName);
              this.roomUsage.data = res.map(item => item.count);
              
              console.log('更新后的琴房类型分布数据:', this.roomUsage);
              
              // 重新渲染琴房使用分布图表
              this.renderRoomUsageChart();
             }
             this.loading = false;
            }
          });

          //预约状态分析
          statisticsApi.getReservationStatusDistribution(this.params)
            .then(response => {
              if (response && response.code === 1) {
                const res = response.data;
                this.reservationStatus.labels = [];
                this.reservationStatus.data = [];
                if (res && res.length > 0) {
                  // 状态名称映射为中文
                  const statusMap = {
                    'pending': '待审核',
                    'approved': '已批准',
                    'rejected': '已拒绝',
                    'cancelled': '已取消',
                    'completed': '已完成'
                  };
                  
                  // 映射名称和数据
                  this.reservationStatus.labels = res.map(item => statusMap[item.name] || item.name);
                  this.reservationStatus.data = res.map(item => item.count);
                  
                  console.log('更新后的预约状态分布数据', this.reservationStatus);
                  
                  // 重新渲染预约状态分布图表
                  this.renderReservationStatusChart();
                }
                this.loading = false;
              }
            })

      // 下面是实际API调用的代码，当后端准备好时可以启用
      /*
      // 数据加载完成计数器
      let completedCount = 0;
      const totalRequests = 6;
      
      const checkAllCompleted = () => {
        completedCount++;
        if (completedCount === totalRequests) {
          this.loading = false;
          this.renderCharts();
        }
      };
      
      // 获取概览数据
      statisticsApi.getOverview(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.overview = response.data || this.overview;
          } else {
            this.$message.error(response.msg || '获取概览数据失败');
          }
        })
        .catch(error => {
          console.error('获取概览数据失败:', error);
          this.$message.error('获取概览数据失败');
        })
        .finally(checkAllCompleted);
      
      // 获取预约趋势数据
      statisticsApi.getReservationTrend(this.params)
        .then(response => {
          if (response && response.code === 1) {
            const data = response.data || { dates: [], data: [] };
            this.reservationTrend = data;
          } else {
            this.$message.error(response.msg || '获取预约趋势数据失败');
          }
        })
        .catch(error => {
          console.error('获取预约趋势数据失败:', error);
          this.$message.error('获取预约趋势数据失败');
        })
        .finally(checkAllCompleted);
      
      // 获取琴房使用分布数据
      statisticsApi.getRoomUsageDistribution(this.params)
        .then(response => {
          if (response && response.code === 1) {
            const data = response.data || { labels: [], data: [] };
            this.roomUsage = data;
          } else {
            this.$message.error(response.msg || '获取琴房使用分布数据失败');
          }
        })
        .catch(error => {
          console.error('获取琴房使用分布数据失败:', error);
          this.$message.error('获取琴房使用分布数据失败');
        })
        .finally(checkAllCompleted);
      
      // 获取预约状态分布数据
      statisticsApi.getReservationStatusDistribution(this.params)
        .then(response => {
          if (response && response.code === 1) {
            const data = response.data || { labels: [], data: [] };
            this.reservationStatus = data;
          } else {
            this.$message.error(response.msg || '获取预约状态分布数据失败');
          }
        })
        .catch(error => {
          console.error('获取预约状态分布数据失败', error);
          this.$message.error('获取预约状态分布数据失败');
        })
        .finally(checkAllCompleted);
      
      // 获取用户活跃度分析数据
      statisticsApi.getUserActivityAnalysis(this.params)
        .then(response => {
          if (response && response.code === 1) {
            const data = response.data || { labels: [], data: [] };
            this.userActivity = data;
          } else {
            this.$message.error(response.msg || '获取用户活跃度分析数据失败');
          }
        })
        .catch(error => {
          console.error('获取用户活跃度分析数据失败', error);
          this.$message.error('获取用户活跃度分析数据失败');
        })
        .finally(checkAllCompleted);
      
      // 获取热门时段分析数据
      statisticsApi.getHotTimeSlotAnalysis(this.params)
        .then(response => {
          if (response && response.code === 1) {
            const data = response.data || { labels: [], data: [] };
            this.timeSlot = data;
          } else {
            this.$message.error(response.msg || '获取热门时段分析数据失败');
          }
        })
        .catch(error => {
          console.error('获取热门时段分析数据失败:', error);
          this.$message.error('获取热门时段分析数据失败');
        })
        .finally(checkAllCompleted);
      */

      //热门时段分析
      statisticsApi.getHotTimeSlotAnalysis(this.params)
        .then(response => {
          if (response && response.code === 1) {
            const res = response.data;
            this.timeSlot.labels = [];
            this.timeSlot.data = [];
            if (res && res.length > 0) {
              // 修改这里，使用timeSlot作为标签，reservationCount作为数据
              this.timeSlot.labels = res.map(item => item.timeSlot);
              this.timeSlot.data = res.map(item => item.reservationCount);
              
              console.log('更新后的热门时段分析数据:', this.timeSlot);
              
              // 重新渲染热门时段分析图表
              if (this.charts.timeSlot) {
                this.renderTimeSlotChart();
              } else {
                // 图表不存在，尝试重新初始化
                this.$nextTick(() => {
                  if (this.$refs.timeSlotChart) {
                    this.charts.timeSlot = echarts.init(this.$refs.timeSlotChart);
                    this.renderTimeSlotChart();
                  }
                });
              }
            }
            this.loading = false;
          }
        })
        .catch(error => {
          console.error('获取热门时段数据失败:', error);
          this.loading = false;
          this.$message.error('获取热门时段数据失败');
        });
        
      //用户活跃度分析
      statisticsApi.getActiveUsers(this.params)
        .then(response => {
          if (response && response.code === 1) {
            const res = response.data;
            this.userActivity.labels = [];
            this.userActivity.data = [];
            if (res && res.length > 0) {
              this.userActivity.labels = res.map(item => item.name);
              this.userActivity.data = res.map(item => item.count);
              
              console.log('更新后的用户活跃度分析数据', this.userActivity);
              
              // 重新渲染用户活跃度分析图表
              this.renderUserActivityChart();
            }
            this.loading = false;
          }
        });
    },
    
    // 使用模拟数据（当后端接口未实现时使用）
    // setMockData() {
      // 概览数据
      // this.overview = {
      //   totalReservations: 1234,
      //   approvalRate: 85,
      //   roomUtilizationRate: 75,
      //   activeUsers: 512
      // }
      
      // 预约趋势数据
      // this.reservationTrend = {
      //   dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      //   data: [65, 59, 80, 81, 56, 55, 40]
      // }
      
      // 琴房使用分布数据
      // this.roomUsage = {
      //   labels: ['普通琴�?, '多媒体琴�?, '实验�?],
      //   data: [45, 35, 20]
      // }
      
      // 预约状态分布数�?      // this.reservationStatus = {
      //   labels: ['待审�?, '已通过', '已拒�?, '已取�?, '已完�?],
      //   data: [12, 19, 3, 5, 2]
      // }
      
      // 用户活跃度分析数�?      // this.userActivity = {
      //   labels: ['学生', '教师', '管理�?],
      //   data: [300, 150, 20]
      // }
      
      // 热门时段分析数据
      // this.timeSlot = {
      //   labels: ['8:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00', '19:00-21:00'],
      //   data: [65, 59, 80, 81, 56]
      // }
      
      // 渲染图表
      // this.renderCharts()
    // }
  }
}
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.time-range-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.time-range-container .label {
  font-weight: bold;
  color: #606266;
}

.custom-date-range {
  margin-left: 10px;
}

.overview-container {
  margin-bottom: 20px;
}

.overview-card {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.overview-card.primary {
  background: linear-gradient(to right, #4e73df, #6f86e3);
  color: white;
}

.overview-card.success {
  background: linear-gradient(to right, #1cc88a, #34e3a4);
  color: white;
}

.overview-card.info {
  background: linear-gradient(to right, #36b9cc, #4dd6e9);
  color: white;
}

.overview-card.warning {
  background: linear-gradient(to right, #f6c23e, #f8d677);
  color: white;
}

.overview-card.danger {
  background: linear-gradient(to right, #e74a3b, #f56c6c);
  color: white;
}

.overview-card.purple {
  background: linear-gradient(to right, #6f42c1, #8e5bda);
  color: white;
}

.overview-icon {
  font-size: 32px;
  margin-right: 15px;
  opacity: 0.8;
}

.overview-content {
  flex: 1;
}

.overview-title {
  font-size: 14px;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
}

.charts-container {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  padding: 10px;
}

.chart {
  height: 350px;
  width: 100%;
}

.chart-legend {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.legend-dot.primary {
  background-color: #409EFF;
}

.legend-dot.success {
  background-color: #67C23A;
}

.legend-dot.info {
  background-color: #36B9CC;
}

@media (max-width: 768px) {
  .time-range-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart {
    height: 300px;
  }
}
</style> 
