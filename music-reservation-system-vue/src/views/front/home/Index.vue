<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <top-navbar></top-navbar>

    <!-- 顶部轮播图 -->
    <el-carousel height="300px" indicator-position="outside" class="main-carousel">
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <div class="carousel-content" :style="{ backgroundImage: `url(${item.image})` }">
          <div class="carousel-overlay">
            <h2 class="carousel-title">{{ item.title }}</h2>
            <p class="carousel-desc">{{ item.description }}</p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <el-container class="main-content">
      <el-main>
        <el-row :gutter="20">
          <!-- 左侧内容：公告和快速预约 -->
          <el-col :span="16">
            <!-- 快速预约卡片 -->
            <el-card class="card-item" shadow="hover">
              <div slot="header" class="card-header">
                <span><i class="el-icon-lightning"></i> 快速预约</span>
              </div>

              <el-form :model="quickReservationForm" :rules="reservationRules" ref="quickReservationForm" label-width="0" size="small">
                <el-row :gutter="20">
                  <!-- <el-col :xs="24" :sm="24" :md="8">
                    <el-form-item prop="roomTypeId">
                      <el-select v-model="quickReservationForm.roomTypeId" placeholder="选择琴房类型" style="width: 100%">
                        <el-option v-for="item in roomTypeList" :key="item.id"
                        :label="item.typeName" :value="item.id"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col> -->

                  <el-col :xs="24" :sm="12" :md="8">
                    <el-form-item prop="startTime">
                      <el-date-picker
                        v-model="quickReservationForm.startTime"
                        type="datetime"
                        placeholder="选择开始时间"
                        style="width: 100%"
                        value-format="yyyy-MM-dd HH:mm:ss">
                      </el-date-picker>
                    </el-form-item>
                  </el-col>

                  <el-col :xs="24" :sm="12" :md="8">
                    <el-form-item prop="endTime">
                      <el-date-picker
                        v-model="quickReservationForm.endTime"
                        type="datetime"
                        placeholder="选择结束时间"
                        style="width: 100%"
                        value-format="yyyy-MM-dd HH:mm:ss">
                      </el-date-picker>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item class="form-button-container">
                  <el-button type="primary" @click="handleQuickReservation" :loading="reservationLoading" icon="el-icon-check" class="quick-reserve-btn">
                    一键预约
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <!-- 公告模块已移除 -->
          </el-col>

          <!-- 右侧内容：琴房统计和热门琴房 -->
          <el-col :span="8">
            <!-- 琴房使用情况卡片 -->
            <el-card class="card-item" shadow="hover">
              <div slot="header" class="card-header">
                <span><i class="el-icon-pie-chart"></i> 琴房使用情况</span>
              </div>

              <div ref="usageChart" class="chart-container"></div>

              <div class="room-stats">
                <div class="room-stat-item">
                  <div class="room-stat-header">
                    <span class="room-type"><i class="el-icon-school"></i> 普通琴房</span>
                    <span class="room-value">{{ roomStats.classroom || 75 }}% 空闲</span>
                  </div>
                  <el-progress :percentage="roomStats.classroom || 75" :color="'#67C23A'" :stroke-width="15"></el-progress>
                </div>

              </div>
            </el-card>

          </el-col>
        </el-row>
      </el-main>
    </el-container>

    <!-- 快速访问区域 -->
    <!-- <div class="quick-access-section">
      <div class="container">
        <h2 class="section-title">快速访问</h2>
        <div class="quick-access-grid">
          <div class="quick-access-card" @click="$router.push('/help')">
            <div class="card-icon">
              <i class="el-icon-question"></i>
            </div>
            <h3>帮助中心</h3>
            <p>查看系统使用指南、预约规则、常见问题解答</p>
            <el-button type="text" class="learn-more">
              了解更多 <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>

          <div class="quick-access-card" @click="$router.push('/about')">
            <div class="card-icon">
              <i class="el-icon-info"></i>
            </div>
            <h3>关于我们</h3>
            <p>了解系统开发背景、团队信息和版本历史</p>
            <el-button type="text" class="learn-more">
              了解更多 <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>

          <div class="quick-access-card" @click="$router.push('/feedback')">
            <div class="card-icon">
              <i class="el-icon-chat-dot-square"></i>
            </div>
            <h3>意见反馈</h3>
            <p>提交系统使用过程中的问题或改进建议</p>
            <el-button type="text" class="learn-more">
              了解更多 <i class="el-icon-arrow-right"></i>
            </el-button>
          </div>
        </div>
      </div>
    </div> -->

    <!-- 可用琴房弹窗 -->
    <el-dialog
      title="可用琴房"
      :visible.sync="availableRoomsDialogVisible"
      width="70%"
      :before-close="closeAvailableRoomsDialog"
      class="available-rooms-dialog"
    >
      <div class="dialog-header">
        <div class="selected-time">
          <span class="time-label">预约时间：</span>
          <span class="time-value">{{ formatDateTime(quickReservationForm.startTime) }} - {{ formatDateTime(quickReservationForm.endTime) }}</span>
        </div>
        <div class="room-type">
          <span class="type-label">琴房类型：</span>
          <el-tag size="medium">{{ formatRoomType(quickReservationForm.roomTypeId) }}</el-tag>
        </div>
      </div>

      <el-table
        :data="paginatedRooms"
        border
        stripe
        style="width: 100%; margin-top: 15px;"
        v-loading="reservationLoading"
        highlight-current-row
        max-height="400"
        class="room-table"
      >
        <el-table-column
          prop="id"
          label="琴房编号"
          width="120"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="name"
          label="琴房名称"
          min-width="150"
          align="center"
        >
        </el-table-column>
        <el-table-column
          prop="capacity"
          label="容量"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.capacity || '未知' }} 人</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="location"
          label="位置"
          min-width="150"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.location || '暂无位置信息' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          label="琴房类型"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag size="medium" :type="getRoomTypeTagType(scope.row.type)">
              <i :class="getRoomTypeIcon(scope.row.roomTypeId)"></i>
              {{ formatRoomType(scope.row.roomTypeId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleReserveRoom(scope.row)"
              icon="el-icon-date"
              round
            >
              预约
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="dialog-footer">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[5, 10, 20]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalRooms"
          background
        >
        </el-pagination>
      </div>
    </el-dialog>

    <!-- 页脚 -->
    <FooterBar />
  </div>
</template>

<script>
import TopNavbar from '@/views/front/components/TopNavbar'
import * as echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import { reservationApi } from '@/api/reservations'
import { roomTypeApi } from '@/api/roomType'
import { statisticsApi } from '@/api/statistics'
import { roomApi } from '@/api/room'
import {formatDateTimeForBackend} from '@/utils/date'
import FooterBar from '@/views/front/components/FooterBar'
import dayjs from 'dayjs'

export default {
  name: 'Home',
  components: {
    TopNavbar,
    FooterBar
  },
  data() {

    return {
      roomTypeList: [],
      // 轮播图数据
      carouselItems: [
        {
          title: '欢迎使用琴房预约系统',
          description: '轻松预约、高效管理，为您的学习和教学保驾护航',
          image: 'https://picsum.photos/id/180/1000/300'
        },
        {
          title: '全新多媒体琴房',
          description: '图书馆新楼3楼301-305多媒体琴房现已开放预约，欢迎使用',
          image: 'https://picsum.photos/id/513/1000/300'
        },
        {
          title: '期末考试琴房安排',
          description: '6月20日至7月10日期间，部分琴房将暂停预约',
          image: 'https://picsum.photos/id/429/1000/300'
        }
      ],

      // 加载状态
      loading: false,
      reservationLoading: false,

      // 快速预约表单
      quickReservationForm: {
        roomTypeId: '',
        startTime: '',
        endTime: ''
      },

      // 可用琴房弹窗
      availableRoomsDialogVisible: false,
      availableRooms: [], // 可用琴房数据
      currentPage: 1, // 当前页码
      pageSize: 5, // 每页显示数量
      totalRooms: 0, // 总记录数

      // 表单验证规则
      reservationRules: {
        roomType: [
          { required: true, message: '请选择琴房类型', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' },
          // 开始时间不能小于当前时间
          {
            validator: (rule, value, callback) => {
              if (value && value < new Date()) {
                callback(new Error('开始时间不能小于当前时间'));
              } else {
                callback();
              }
            },
            trigger: 'change'
          }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (value && this.quickReservationForm.startTime && value <= this.quickReservationForm.startTime) {
                callback(new Error('结束时间必须晚于开始时间'));
              } else {
                callback();
              }
            },
            trigger: 'change'
          }
        ]
      },

      // 琴房使用情况数据
      roomStats: {
        classroom: 0,
        multimedia: 0,
        lab: 0
      },

      // 时间范围参数
      params: {
        start: dayjs().format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD')
      },

      // 琴房使用率数据
      roomUtilizationRate: 0,

      // 公告数据已移除

      // 图表实例
      chart: null
    }
  },
  mounted() {
    this.initChart()
    this.fetchData()
  },
  created() {
    this.fetchRoomTypeList()
    this.fetchRoomUtilizationRate()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.resizeChart)
  },
  computed: {
    // 分页后的数据
    paginatedRooms() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.availableRooms.slice(start, end);
    }
  },
  methods: {
    // 获取琴房类型列表
    fetchRoomTypeList() {
      roomTypeApi.list().then(res => {
        if (res && res.data && res.data.list) {
          this.roomTypeList = res.data.list;
        } else {
          this.roomTypeList = [];
          console.warn('获取琴房类型列表失败或返回数据格式不正确');
        }
      }).catch(error => {
        console.error('获取琴房类型列表异常:', error);
        this.roomTypeList = [];
      });
    },
    // 获取数据
    fetchData() {
      this.loading = true

      // 模拟API调用
      setTimeout(() => {
        this.loading = false
      }, 1000)
    },

    // 获取琴房使用率数据
    fetchRoomUtilizationRate() {
      // 获取概览数据：琴房使用率
      statisticsApi.getClassroomUsageRate(this.params)
        .then(response => {
          if (response && response.code === 1) {
            this.roomUtilizationRate = (response.data * 100).toFixed(1);

            // 更新图表数据
            if (this.chart) {
              this.updateUsageChart(this.roomUtilizationRate);
            }
          }
        });

      // 获取琴房类型使用分布
      statisticsApi.getClassroomDistribution(this.params)
        .then(response => {
          if (response && response.code === 1) {
            const res = response.data;
            if (res && res.length > 0) {
              // 遍历琴房类型，更新使用率
              res.forEach(item => {
                if (item.typeName.includes('普通')) {
                  this.roomStats.classroom = (100 - item.usageRate * 100).toFixed(1);
                } else if (item.typeName.includes('多媒体')) {
                  this.roomStats.multimedia = (100 - item.usageRate * 100).toFixed(1);
                } else if (item.typeName.includes('实验')) {
                  this.roomStats.lab = (100 - item.usageRate * 100).toFixed(1);
                }
              });
            }
          }
        });
    },

    // 更新琴房使用率图表
    updateUsageChart(usageRate) {
      const freeRate = 100 - usageRate;
      const option = {
        series: [
          {
            data: [
              { value: usageRate, name: '已占用', itemStyle: { color: '#F56C6C' } },
              { value: freeRate, name: '空闲', itemStyle: { color: '#67C23A' } }
            ]
          }
        ]
      };
      this.chart.setOption(option);
    },

    // 初始化图表
    initChart() {
      this.chart = echarts.init(this.$refs.usageChart)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          left: 'center',
          bottom: 'bottom',
          data: ['已占用', '空闲']
        },
        series: [
          {
            name: '琴房使用情况',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            data: [
              { value: this.roomUtilizationRate || 35, name: '已占用', itemStyle: { color: '#F56C6C' } },
              { value: 100 - (this.roomUtilizationRate || 35), name: '空闲', itemStyle: { color: '#67C23A' } }
            ]
          }
        ]
      }

      this.chart.setOption(option)
      window.addEventListener('resize', this.resizeChart)
    },

    // 调整图表大小
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    },

    // 处理快速预约
    handleQuickReservation() {
      // 判断当前时间是否小于22:00（点击预约按钮时立即判断）
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTimeInMinutes = currentHour * 60 + currentMinute
      const closeTimeInMinutes = 22 * 60 // 22:00转换为分钟
      
      if (currentTimeInMinutes >= closeTimeInMinutes) {
        this.$message.warning('琴房暂未开放')
        return
      }
      
      this.$refs.quickReservationForm.validate(async valid => {
        if (!valid) return

        this.reservationLoading = true
        try {
          const res = await reservationApi.getAvailableByRoomTypeAndTimeQuantum({
            roomTypeId: this.quickReservationForm.roomTypeId,
            startTime: formatDateTimeForBackend(this.quickReservationForm.startTime),
            endTime: formatDateTimeForBackend(this.quickReservationForm.endTime)
          })

          if (res.code === 1 && res.data) {
            this.availableRooms = res.data || []
            this.totalRooms = this.availableRooms.length
            this.currentPage = 1

            if (this.availableRooms.length === 0) {
              this.$message.warning('没有找到符合条件的可用琴房')
            } else {
              this.availableRoomsDialogVisible = true
            }
          } else {
            this.$message.error(res.msg || '查询可用琴房失败')
          }
        } catch (error) {
          console.error('查询出错:', error)
          this.$message.error('查询可用琴房失败，请稍后重试')
        } finally {
          this.reservationLoading = false
        }
      })
    },

    // 处理预约琴房按钮点击
    handleReserveRoom(room) {
      // 判断当前时间是否小于22:00（点击预约按钮时立即判断）
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTimeInMinutes = currentHour * 60 + currentMinute
      const closeTimeInMinutes = 22 * 60 // 22:00转换为分钟
      
      if (currentTimeInMinutes >= closeTimeInMinutes) {
        this.$message.warning('琴房暂未开放')
        return
      }
      
      // 检查用户是否登录
      const token = localStorage.getItem('token')
      if (!token) {
        this.$confirm('您尚未登录，是否前往登录页面?', '提示', {
          confirmButtonText: '前往登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$router.push('/login')
        }).catch(() => {})
        return
      }

      // 跳转到预约页面，并传递参数
      this.$router.push({
        path: '/reservation/create',
        query: {
          roomId: room.id,
          roomName: room.name,
          roomTypeId: this.quickReservationForm.roomTypeId,
          startTime: this.formatDateTime(this.quickReservationForm.startTime),
          endTime: this.formatDateTime(this.quickReservationForm.endTime)
        }
      })
    },

    // 关闭弹窗
    closeAvailableRoomsDialog() {
      this.availableRoomsDialogVisible = false
    },

    // 处理每页显示数量变化
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1; // 重置到第一页
    },

    // 处理页码变化
    handleCurrentChange(val) {
      this.currentPage = val;
    },

    // 格式化琴房类型
    formatRoomType(roomTypeId) {
      const typeMap = this.roomTypeList.find(item => item.id == roomTypeId)
      return typeMap ? typeMap.typeName : '未知'
    },

    // 获取琴房类型图标
    getRoomTypeIcon(type) {
      const iconMap = {
        'classroom': 'el-icon-school',
        'multimedia': 'el-icon-monitor',
        'lab': 'el-icon-cpu',
        'meeting': 'el-icon-office-building'
      }
      return iconMap[type] || 'el-icon-room'
    },

    // 格式化时间
    formatTime(dateStr) {
      if (!dateStr) return '-'

      const date = new Date(dateStr)
      const now = new Date()
      const diff = now - date

      // 一小时内
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前'
      }

      // 一天内
      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前'
      }

      // 一周内
      if (diff < 604800000) {
        return Math.floor(diff / 86400000) + '天前'
      }

      // 超过一周
      return date.toLocaleDateString()
    },

    // 格式化日期时间为字符串
    formatDateTime(date) {
      if (!date) return ''

      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}`
    },

    // 获取琴房类型标签类型
    getRoomTypeTagType(type) {
      const typeMap = {
        'classroom': 'info',
        'multimedia': 'success',
        'lab': 'warning',
        'meeting': 'danger'
      };
      return typeMap[type] || 'info';
    },

  }
}
</script>

<style scoped>
.home-container {
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 轮播图样式 */
.main-carousel {
  margin-bottom: 20px;
}

.carousel-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.carousel-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  max-width: 80%;
}

.carousel-title {
  font-size: 24px;
  margin-bottom: 15px;
}

.carousel-desc {
  font-size: 16px;
  margin: 0;
}

/* 主体内容区域 */
.main-content {
  padding: 0 20px 30px;
}

.card-item {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.card-item:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.card-header i {
  margin-right: 8px;
  font-size: 18px;
}

.card-more {
  font-size: 14px;
  color: #409EFF;
  font-weight: normal;
}

/* 图表容器 */
.chart-container {
  height: 250px;
  margin-bottom: 15px;
}

/* 预约按钮 */
.action-button {
  width: 100%;
}

/* 琴房统计 */
.room-stats {
  margin-top: 15px;
}

.room-stat-item {
  margin-bottom: 15px;
}

.room-stat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.room-type {
  font-size: 14px;
}

.room-type i {
  margin-right: 5px;
}

.room-value {
  font-weight: bold;
  font-size: 14px;
}

/* 公告样式 */
.announcement-card {
  margin-bottom: 10px;
}

.announcement-title {
  font-size: 16px;
  margin: 0 0 10px 0;
}

.announcement-title a {
  color: #303133;
  text-decoration: none;
}

.announcement-title a:hover {
  color: #409EFF;
}

.announcement-content {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
}

.loading-placeholder {
  padding: 10px;
}

/* Element UI 样式覆盖 */
:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  font-weight: bold;
}

:deep(.el-collapse-item__content) {
  padding: 10px;
}

/* 快速预约表单相关样式 */
.form-button-container {
  margin-bottom: 0;
  margin-top: 10px;
  text-align: center;
}

.quick-reserve-btn {
  padding: 10px 30px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .el-form-item {
    margin-bottom: 15px;
  }
}

/* 可用琴房弹窗相关样式 */
.available-rooms-dialog .el-dialog__header {
  background-color: #409EFF;
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
}

.available-rooms-dialog .el-dialog__title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.available-rooms-dialog .el-dialog__headerbtn .el-dialog__close {
  color: #fff;
}

.available-rooms-dialog .el-dialog__body {
  padding: 20px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.selected-time, .room-type {
  display: flex;
  align-items: center;
}

.time-label, .type-label {
  font-weight: 500;
  margin-right: 8px;
  color: #606266;
}

.time-value {
  font-weight: 600;
  color: #303133;
}

.room-table {
  border-radius: 5px;
  overflow: hidden;
}

.room-table .el-table__header-wrapper th {
  background-color: #f2f6fc;
  color: #606266;
  font-weight: 600;
}

.dialog-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 动画效果 */
.available-rooms-dialog .el-table__body tr {
  transition: all 0.3s;
}

.available-rooms-dialog .el-table__body tr:hover {
  background-color: #f0f9ff !important;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.available-rooms-dialog .el-button {
  transition: all 0.3s;
}

.available-rooms-dialog .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 快速访问区域样式 */
.quick-access-section {
  background-color: #f5f7fa;
  padding: 40px 0;
  margin-top: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
  color: #303133;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: #409EFF;
}

.quick-access-grid {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.quick-access-card {
  background-color: #fff;
  padding: 30px 20px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 280px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.quick-access-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 48px;
  margin-bottom: 20px;
  color: #409EFF;
  background-color: #ecf5ff;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.quick-access-card h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
}

.quick-access-card p {
  color: #606266;
  margin-bottom: 20px;
  line-height: 1.6;
  height: 60px;
}

.learn-more {
  color: #409EFF;
  font-size: 14px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .quick-access-grid {
    flex-direction: column;
    align-items: center;
  }

  .quick-access-card {
    width: 100%;
    max-width: 350px;
  }
}

.empty-data {
  text-align: center;
  padding: 30px 0;
  color: #909399;
}

.empty-data i {
  font-size: 40px;
  margin-bottom: 10px;
}

.empty-data p {
  font-size: 14px;
}
</style>
