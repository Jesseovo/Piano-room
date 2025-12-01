<template>
  <div class="stats-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="(stat, index) in stats" :key="index">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="recent-card" v-if="recentReservations.length > 0">
      <div slot="header" class="recent-header">
        <span>最近预约</span>
        <el-button type="text" @click="$router.push('/my-reservations')">
          查看全部<i class="el-icon-arrow-right"></i>
        </el-button>
      </div>
      
      <el-table 
        :data="recentReservations" 
        style="width: 100%"
        :stripe="true"
        :border="false"
        size="medium">
        <el-table-column prop="roomName" label="琴房" min-width="120">
          <template slot-scope="scope">
            <router-link 
              :to="`/rooms/detail/${scope.row.roomId}`" 
              class="room-link">
              {{ scope.row.roomName }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" min-width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" min-width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag 
              :type="getStatusType(scope.row.status)" 
              size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { reservationApi } from '@/api/reservations';
import dayjs from 'dayjs';

export default {
  name: 'ReservationStats',
  data() {
    return {
      // 统计数据
      totalReservations: 0,
      pendingReservations: 0,
      approvedReservations: 0,
      rejectedReservations: 0,
      cancelledReservations: 0,
      
      // 最近预约列表
      recentReservations: []
    };
  },
  computed: {
    // 统计卡片数据
    stats() {
      return [
        {
          label: '总预约次数',
          value: this.totalReservations,
          icon: 'el-icon-data-analysis',
          color: '#409EFF'
        },
        {
          label: '待审核',
          value: this.pendingReservations,
          icon: 'el-icon-time',
          color: '#E6A23C'
        },
        {
          label: '已通过',
          value: this.approvedReservations,
          icon: 'el-icon-circle-check',
          color: '#67C23A'
        },
        {
          label: '已拒绝',
          value: this.rejectedReservations,
          icon: 'el-icon-circle-close',
          color: '#F56C6C'
        },
        {
          label: '已取消',
          value: this.cancelledReservations,
          icon: 'el-icon-circle-close',
          color: '#F56C6C'
        }
      ];
    }
  },
  created() {
    this.fetchReservationStats();
  },
  methods: {
    // 获取预约统计数据
    async fetchReservationStats() {
      try {
        // 获取用户预约列表
        const res = await reservationApi.getUserReservationStatistics({
          userId: Number(this.$store.getters.currentUser.id)
        });
        
        if (res.code == 1 && res.data) {
          // 提取数据列表
         const reservations = res.data;
          
          // 统计各种状态的预约数量
          this.totalReservations = reservations.totalCount;
          this.pendingReservations = reservations.pendingCount;
          this.approvedReservations = reservations.completedCount;
          this.rejectedReservations = reservations.rejectedCount;
          this.cancelledReservations = reservations.cancelledCount;
        
        }
      } catch (error) {
        console.error('获取预约统计数据失败:', error);
        this.$message.error('获取预约统计数据失败');
      }
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '未设置';
      return dayjs(dateTime).format('YYYY-MM-DD HH:mm');
    },
    
    // 获取状态类型（用于显示不同颜色的标签）
    getStatusType(status) {
      const statusMap = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        cancelled: 'info',
        occupied: 'danger',
        completed: 'primary'
      };
      return statusMap[status] || 'info';
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝',
        cancelled: '已取消',
        occupied: '已占用',
        completed: '已完成'
      };
      return statusMap[status] || status;
    }
  }
}
</script>

<style scoped>
.stats-container {
  margin-bottom: 20px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.el-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  animation: slideUp 0.5s ease-out;
  animation-fill-mode: both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.el-col:nth-child(1) .stat-card {
  animation-delay: 0.1s;
}

.el-col:nth-child(2) .stat-card {
  animation-delay: 0.2s;
}

.el-col:nth-child(3) .stat-card {
  animation-delay: 0.3s;
}

.el-col:nth-child(4) .stat-card {
  animation-delay: 0.4s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-card .el-card__body {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: rotate(10deg) scale(1.1);
}

.stat-icon i {
  font-size: 30px;
  color: white;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon i {
  transform: rotate(-10deg);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-value {
  transform: scale(1.1);
  color: #409EFF;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.recent-card {
  margin-top: 20px;
  border-radius: 8px;
  animation: fadeIn 0.5s ease-out;
  animation-delay: 0.5s;
  animation-fill-mode: both;
  transition: all 0.3s;
}

.recent-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-link {
  color: #409EFF;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}

.room-link:hover {
  color: #66b1ff;
}

.room-link::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: 0;
  left: 0;
  background-color: #66b1ff;
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s;
}

.room-link:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

/* 表格行动画 */
:deep(.el-table__row) {
  transition: all 0.3s;
}

:deep(.el-table__row:hover) {
  background-color: #f0f9ff !important;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-tag) {
  transition: all 0.3s;
}

:deep(.el-tag:hover) {
  transform: scale(1.05);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 15px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
  }
  
  .stat-icon i {
    font-size: 25px;
  }
}
</style> 