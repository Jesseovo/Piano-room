<template>
  <div class="my-reservations-container">
    <!-- 顶部导航栏 -->
    <top-navbar></top-navbar>
    
    <div class="content-wrapper">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>我的预约</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">我的预约</h2>
      </div>

      <!-- 练琴统计卡片 -->
      <el-card class="practice-stats-card" shadow="hover">
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ practiceStats.totalHours }}</div>
              <div class="stat-label">练琴总时长 (小时)</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 预约列表卡片 -->
      <el-card class="reservation-list-card" shadow="hover">
        <div slot="header" class="card-header">
          <div class="header-left">
            <i class="el-icon-s-order"></i> 我的预约记录
          </div>
          
          <div class="header-right">
            <el-radio-group v-model="statusFilter" size="small" @change="handleFilterChange">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="pending">待审核</el-radio-button>
              <el-radio-button label="approved">已同意</el-radio-button>
              <el-radio-button label="rejected">已拒绝</el-radio-button>
              <el-radio-button label="completed">已完成</el-radio-button>
              <el-radio-button label="cancelled">已取消</el-radio-button>
              <el-radio-button label="occupied">已占用</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="5" animated />
        </div>
        
        <!-- 无数据状态 -->
        <div v-else-if="reservations.length === 0" class="empty-container">
          <el-empty 
            description="暂无预约记录" 
            :image-size="200">
            <el-button type="primary" @click="$router.push('/rooms')">
              <i class="el-icon-plus"></i> 立即预约
            </el-button>
          </el-empty>
        </div>
        
        <!-- 预约列表 -->
        <div v-else class="reservation-list">
          <el-timeline>
            <el-timeline-item
              v-for="reservation in reservations"
              :key="reservation.id"
              :type="getTimelineItemType(reservation.status)"
              :color="getTimelineItemColor(reservation.status)"
              :timestamp="formatDate(reservation.createdAt)"
              placement="top"
              size="large">
              
              <el-card class="reservation-item" :body-style="{ padding: '0px' }">
                <div class="reservation-header">
                  <div class="reservation-title">
                    <span>{{ reservation.title || '琴房预约' }}</span>
                    <el-tag :type="getStatusTagType(reservation.status)" size="small">
                      {{ formatStatus(reservation.status) }}
                    </el-tag>
                  </div>
                  <div class="reservation-time">
                    <i class="el-icon-time"></i>
                    {{ formatDate(reservation.startTime) }} {{ formatTime(reservation.startTime) }} - {{ formatTime(reservation.endTime) }}
                  </div>
                </div>
                
                <div class="reservation-body">
                  <div class="room-info">
                    <span class="info-label">预约琴房:</span>
                    <span class="info-value">{{ reservation.buildingName }} {{ reservation.roomName }}</span>
                  </div>
                  
                  <div class="purpose-info">
                    <span class="info-label">用�?</span>
                    <span class="info-value">{{ formatPurpose(reservation.purpose) }}</span>
                  </div>
                  
                  <div class="participants-info">
                    <span class="info-label">参与人数:</span>
                    <span class="info-value">{{ reservation.attendees }}人</span>
                  </div>
                  
                  <div class="facilities-info" v-if="reservation.facilities">
                    <span class="info-label">设备需求:</span>
                    <div class="facilities-tags">
                      <el-tag 
                        v-for="(facility, index) in parseFacilities(reservation.facilities)" 
                        :key="index"
                        size="mini"
                        type="info"
                        effect="plain"
                        class="facility-tag">
                        {{ formatFacility(facility) }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                
                <div class="reservation-footer">
                  <el-button 
                    type="text" 
                    size="small" 
                    @click="viewDetail(reservation.id)">
                    <i class="el-icon-document"></i> 详情
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    plain
                    @click="handleCancel(reservation)"
                    v-if="canCancel(reservation.status)">
                    <i class="el-icon-close"></i> 取消预约
                  </el-button>
                  <!-- 签到按钮：只要approved永远显示 -->
                  <el-button
                    :type="reservation.signStartTime ? 'info' : 'success'"
                    size="small"
                    @click="handleSignIn(reservation)"
                    :disabled="loading || cancelling || reservation.signStartTime"
                    v-if="reservation.status === 'approved'"
                  >
                    <i class="el-icon-check"></i> {{ reservation.signStartTime ? '已签到' : '签到' }}
                  </el-button>
                  <!-- 签退按钮：只要approved永远显示 -->
                  <el-button
                    :type="reservation.signEndTime ? 'info' : 'warning'"
                    size="small"
                    @click="handleSignOut(reservation)"
                    :disabled="loading || cancelling || reservation.signEndTime"
                    v-if="reservation.status === 'approved'"
                  >
                    <i class="el-icon-refresh-left"></i> {{ reservation.signEndTime ? '已签退' : '签退' }}
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>

          <!-- 分页查询 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="pagination.pageNum"
            :page-sizes="[5, 10, 20, 50]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            class="pagination-container">
          </el-pagination>
        </div>
      </el-card>

      <!-- 取消预约确认对话框 -->
      <el-dialog
        title="取消预约"
        :visible.sync="cancelDialogVisible"
        width="400px">
        <div class="cancel-dialog-content">
          <p class="cancel-message">您确定要取消此次预约吗？</p>
          <p class="cancel-warning">取消后将不可恢复，请谨慎操作。</p>
          
          <el-form :model="cancelForm" ref="cancelForm">
            <el-form-item label="取消原因" prop="reason" :rules="[{ required: true, message: '请输入取消原因', trigger: 'blur' }]">
              <el-input
                type="textarea"
                v-model="cancelForm.reason"
                placeholder="请简要说明取消原因"
                :rows="3">
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmCancel" :loading="cancelling">确认取消</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 页脚 -->
    <FooterBar />
  </div>
</template>

<script>
import TopNavbar from '@/views/front/components/TopNavbar.vue';
import { reservationApi } from '@/api/reservations';
import dayjs from 'dayjs';
import FooterBar from '@/views/front/components/FooterBar.vue';
export default {
  name: 'MyReservations',
  components: {
    TopNavbar,
    FooterBar
  },
  data() {
    return {
      // 加载状态
      loading: false,
      cancelling: false,
      
      // 预约列表
      reservations: [],
      
      // 状态筛选器
      statusFilter: '',
      
      // 分页信息
      pagination: {
        pageNum: 1,
        pageSize: 10
      },
      
      // 总记录数
      total: 0,
      
      // 取消预约
      cancelDialogVisible: false,
      currentReservation: null,
      cancelForm: {
        reason: ''
      },
      
      // 练琴统计数据
      practiceStats: {
        totalHours: 0
      }
    };
  },
  created() {
    // 获取预约列表
    this.fetchReservations();
  },
  methods: {
    /**
     * 获取预约列表
     */
    fetchReservations() {
      this.loading = true;
      
      // 构造查询参数
      const params = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        status: this.statusFilter,
        userId: this.getUserId()
      };
      
      // 调用API获取数据
      reservationApi.getReservationList(params)
        .then(response => {
          if (response && response.data) {
            this.reservations = response.data.rows || [];
            this.total = response.data.total || 0;
            console.log('获取到的预约列表:', this.reservations);
          } else {
            this.reservations = [];
            this.total = 0;
            this.$message.error('获取预约列表失败');
          }
        })
        .catch(error => {
          console.error('获取预约列表出错', error);
          this.$message.error('获取预约列表出错');
          this.reservations = [];
          this.total = 0;
          
          // 加载模拟数据（测试用�?          this.loadMockData();
        })
        .finally(() => {
          this.loading = false;
          // 计算练习统计数据
          this.calculatePracticeStats();
        });
    },
    
    /**
     * 加载模拟数据（测试用）     */
    loadMockData() {
      this.reservations = [
        {
          id: 1,
          title: '高数课程辅导',
          buildingName: '主教学楼',
          roomName: '301',
          startTime: '2025-04-15 10:00:00',
          endTime: '2025-04-15 12:00:00',
          purpose: 'teaching',
          participantCount: 30,
          facilities: 'projector,computer',
          status: 'confirmed',
          createdAt: '2025-04-12 16:30:00'
        },
        {
          id: 2,
          title: '学生会会议',
          buildingName: '科技楼',
          roomName: '205',
          startTime: '2025-04-16 15:00:00',
          endTime: '2025-04-16 17:00:00',
          purpose: 'meeting',
          participantCount: 20,
          facilities: 'projector,computer,microphone',
          status: 'pending',
          createdAt: '2025-04-12 16:35:00'
        },
        {
          id: 3,
          title: '编程竞赛培训',
          buildingName: '图书馆',
          roomName: '302',
          startTime: '2025-04-14 18:00:00',
          endTime: '2025-04-14 20:00:00',
          purpose: 'training',
          participantCount: 45,
          facilities: 'projector,computer',
          status: 'completed',
          createdAt: '2025-04-11 10:20:00'
        },
        {
          id: 4,
          title: '年级班会',
          buildingName: '主教学楼',
          roomName: '405',
          startTime: '2025-04-13 08:00:00',
          endTime: '2025-04-13 10:00:00',
          purpose: 'meeting',
          participantCount: 60,
          facilities: 'projector',
          status: 'cancelled',
          createdAt: '2025-04-10 14:15:00'
        }
      ];
      this.total = this.reservations.length;
    },
    
    /**
     * 处理筛选条件变化     */
    handleFilterChange() {
      this.pagination.pageNum = 1;
      this.fetchReservations();
    },
    
    /**
     * 处理每页条数变化
     * @param {number} pageSize - 每页条数
     */
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize;
      this.pagination.pageNum = 1;
      this.fetchReservations();
    },
    
    /**
     * 处理页码变化
     * @param {number} pageNum - 页码
     */
    handleCurrentChange(pageNum) {
      this.pagination.pageNum = pageNum;
      this.fetchReservations();
    },
    
    /**
     * 查看预约详情
     * @param {number} id - 预约ID
     */
    viewDetail(id) {
      // 跳转到详情页
      this.$router.push(`/reservations/detail/${id}`);
    },
    
    /**
     * 处理取消预约
     * @param {Object} reservation - 预约信息
     */
    handleCancel(reservation) {
      this.currentReservation = reservation;
      this.cancelForm.reason = '';
      this.cancelDialogVisible = true;
    },
    
    /**
     * 确认取消预约
     */
    confirmCancel() {
      this.$refs.cancelForm.validate(valid => {
        if (!valid) return;
        
        this.cancelling = true;
        
        // 构造取消请求参数
        const params = {
          remarks: this.cancelForm.reason
        };
        
        // 调用API取消预约
        reservationApi.cancelReservation(this.currentReservation.id, params)
          .then(response => {
            if (response && response.code === 1) {
              this.$message.success('预约已成功取消');
              this.cancelDialogVisible = false;
              this.fetchReservations();
            } else {
              this.$message.error(response.msg || '取消预约失败');
            }
          })
          // .catch(error => {
          //   console.error('取消预约出错', error);
          //   this.$message.error('取消预约出错');
            
          //   // 测试用 - 模拟成功
          //   setTimeout(() => {
          //     this.$message.success('预约已成功取消');
          //     this.cancelDialogVisible = false;
              
          //     // 更新本地数据
          //     const index = this.reservations.findIndex(r => r.id === this.currentReservation.id);
          //     if (index !== -1) {
          //       this.reservations[index].status = 'cancelled';
          //     }
          //   }, 1000);
          // })
          // .finally(() => {
          //   this.cancelling = false;
          // });
      });
    },
    
    /**
     * 判断是否可以取消预约
     * @param {string} status - 预约状态     * @returns {boolean} - 是否可以取消
     */
    canCancel(status) {
      return ['pending', 'confirmed'].includes(status);
    },
    
    /**
     * 获取时间线项类型
     * @param {string} status - 预约状态     * @returns {string} - 时间线项类型
     */
    getTimelineItemType(status) {
      const typeMap = {
        'pending': 'warning',
        'confirmed': 'primary',
        'completed': 'success',
        'cancelled': 'info',
        'occupied': 'danger'
      };
      return typeMap[status] || 'primary';
    },
    
    /**
     * 获取时间线项颜色
     * @param {string} status - 预约状态     * @returns {string} - 时间线项颜色
     */
    getTimelineItemColor(status) {
      const colorMap = {
        'pending': '#E6A23C',
        'confirmed': '#409EFF',
        'completed': '#67C23A',
        'cancelled': '#909399',
        'occupied': '#F56C6C'
      };
      return colorMap[status] || '#409EFF';
    },
    
    /**
     * 获取状态标签类型
     * @param {string} status - 预约状态
     * @returns {string} - 标签类型
     */
    getStatusTagType(status) {
      const typeMap = {
        'pending': 'warning',
        'confirmed': 'primary',
        'completed': 'success',
        'cancelled': 'info',
        'occupied': 'danger'
      };
      return typeMap[status] || 'primary';
    },
    
    /**
     * 格式化预约状态     * @param {string} status - 预约状态     * @returns {string} - 格式化后的状态     */
    formatStatus(status) {
      const statusMap = {
        'pending': '待审核',
        'completed': '已完成',
        'cancelled': '已取消',
        'rejected': '已拒绝',
        'approved': '已批准',
        'occupied': '已占用'
      };
      return statusMap[status] || status;
    },
    
    /**
     * 格式化预约用途
     * @param {string} purpose - 预约用途
     * @returns {string} - 格式化后的用途     */
    formatPurpose(purpose) {
      const purposeMap = {
        'teaching': '教学活动',
        'student': '学生活动',
        'meeting': '会议',
        'training': '培训',
        'other': '其他'
      };
      return purposeMap[purpose] || purpose;
    },
    
    /**
     * 格式化设施
     * @param {string} facility - 设施
     * @returns {string} - 格式化后的设施
     */
    formatFacility(facility) {
      const facilityMap = {
        'projector': '投影仪',
        'computer': '电脑',
        'microphone': '麦克风',
        'experiment': '实验设备',
        'network': '网络',
        'airConditioner': '空调'
      };
      return facilityMap[facility] || facility;
    },
    
    /**
     * 解析设施字符串为数组
     * @param {string} facilities - 设施字符串     * @returns {Array} - 设施数组
     */
    parseFacilities(facilities) {
      if (!facilities) return [];
      return facilities.split(',');
    },
    
    /**
     * 格式化日期
     * @param {string} dateStr - 日期字符串
     * @returns {string} - 格式化后的日期     */
    formatDate(dateStr) {
      if (!dateStr) return '';
      return dayjs(dateStr).format('YYYY-MM-DD');
    },
    
    /**
     * 格式化时间
     * @param {string} dateStr - 日期字符串
     * @returns {string} - 格式化后的时间     */
    formatTime(dateStr) {
      if (!dateStr) return '';
      return dayjs(dateStr).format('HH:mm');
    },
    
    /**
     * 获取当前用户ID
     * @returns {string} - 用户ID
     */
    getUserId() {
      const user = localStorage.getItem('user');
      if (!user) return '';
      
      try {
        const userObj = JSON.parse(user);
        return userObj.id || '';
      } catch (e) {
        return '';
      }
    },

    /**
     * 计算练习统计数据
     */
    calculatePracticeStats() {
      if (!this.reservations || this.reservations.length === 0) {
        this.practiceStats = {
          totalHours: 0
        };
        return;
      }

      // 筛选已完成的预约
      const completedReservations = this.reservations.filter(
        reservation => reservation.status === 'completed'
      );

      if (completedReservations.length === 0) {
        this.practiceStats = {
          totalHours: 0
        };
        return;
      }

      // 计算总时长
      let totalMinutes = 0;

      completedReservations.forEach(reservation => {
        const startTime = dayjs(reservation.startTime);
        const endTime = dayjs(reservation.endTime);
        const duration = endTime.diff(startTime, 'minute');
        
        totalMinutes += duration;
      });

      // 转换为小时并保留一位小数
      const totalHours = (totalMinutes / 60).toFixed(1);

      this.practiceStats = {
        totalHours: parseFloat(totalHours)
      };

      console.log('练习统计数据已更新:', this.practiceStats);
    },

    /**
     * 签到操作，先本地校验预约时间范围
     */
    handleSignIn(reservation) {
      const now = dayjs();
      const start = dayjs(reservation.startTime);
      const end = dayjs(reservation.endTime);

      // 仅允许在预约时间内签到
      if (now.isBefore(start) || now.isAfter(end)) {
        this.$message.warning('不在预约时间内，无法签到！');
        return;
      }

      this.loading = true;
      reservationApi.signIn(reservation.id)
        .then(res => {
          if (res && res.code === 1) {
            this.$message.success(res.msg);
            this.fetchReservations();
          } else {
            this.$message.error(res.msg || '签到失败！');
          }
        })
        .catch(() => {
          this.$message.error('网络错误，签到失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /**
     * 签退操作，未签到不允许签退
     */
    handleSignOut(reservation) {
      this.loading = true;
      reservationApi.signOut(reservation.id)
        .then(res => {
          if (res && res.code === 1) {
            this.$message.success('签退成功！');
            this.fetchReservations();
          } else {
            this.$message.error(res.msg || '签退失败！');
          }
        })
        .catch(() => {
          this.$message.error('网络错误，签退失败');
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style scoped>
.my-reservations-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 20px;
  background-color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-title {
  margin-top: 15px;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
  position: relative;
  padding-left: 12px;
}

.page-title:before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 4px;
  background-color: #409EFF;
  border-radius: 2px;
}

.practice-stats-card {
  margin-bottom: 20px;
  border-radius: 8px;
  animation: slideUp 0.5s ease-in-out;
}

.stats-container {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  transition: transform 0.3s ease;
  min-width: 250px;
}

.stat-item:hover {
  transform: translateY(-3px);
}


.stat-icon {
  font-size: 32px;
  margin-right: 15px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reservation-list-card {
  border-radius: 8px;
  animation: slideUp 0.5s ease-in-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.header-left i {
  margin-right: 5px;
}

.loading-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.reservation-list {
  padding: 10px 0;
}

.reservation-item {
  margin-bottom: 10px;
  border-left: 4px solid transparent;
  transition: all 0.3s;
}

.reservation-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.reservation-header {
  background-color: #f5f7fa;
  padding: 12px 15px;
  border-bottom: 1px solid #ebeef5;
}

.reservation-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-weight: bold;
}

.reservation-time {
  font-size: 13px;
  color: #606266;
}

.reservation-time i {
  margin-right: 5px;
}

.reservation-body {
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 15px;
}

.info-label {
  color: #909399;
  margin-right: 5px;
}

.info-value {
  font-weight: bold;
  color: #303133;
}

.facilities-info {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
}

.facilities-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.facility-tag {
  margin-bottom: 5px;
}

.reservation-footer {
  padding: 10px 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.cancel-dialog-content {
  padding: 10px 0;
}

.cancel-message {
  font-size: 16px;
  margin-bottom: 10px;
}

.cancel-warning {
  color: #f56c6c;
  font-size: 14px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 10px;
  }
  
  .header-right {
    display: none;
  }
  
  .reservation-body {
    grid-template-columns: 1fr;
  }
  
  .stats-container {
    justify-content: center;
  }
  
  .stat-item {
    padding: 15px 20px;
    min-width: 200px;
  }
  
  .stat-icon {
    font-size: 24px;
    margin-right: 10px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .stat-label {
    font-size: 10px;
  }
}
</style> 


