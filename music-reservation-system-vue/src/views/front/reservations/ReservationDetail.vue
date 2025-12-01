<template>
  <div class="reservation-detail-container">
    <!-- 顶部导航栏 -->
    <top-navbar></top-navbar>
    
    <div class="content-wrapper">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/my-reservations' }">我的预约</el-breadcrumb-item>
          <el-breadcrumb-item>预约详情</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">预约详情</h2>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <!-- 详情内容 -->
      <div v-else class="detail-content">
        <!-- 基本信息卡片 -->
        <el-card class="detail-card" shadow="hover">
          <div slot="header" class="card-header">
            <div class="header-left">
              <i class="el-icon-document"></i> 预约基本信息
            </div>
            <div class="header-right">
              <el-tag :type="getStatusTagType(reservation.status)" effect="dark">
                {{ formatStatus(reservation.status) }}
              </el-tag>
            </div>
          </div>

          <div class="basic-info">
            <div class="info-row">
              <div class="reservation-title">
                <span class="title-text">{{ reservation.title || '琴房预约' }}</span>
                <span class="reservation-id">预约编号: {{ reservation.id }}</span>
              </div>
            </div>
            
            <el-divider></el-divider>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">预约琴房</span>
                <span class="info-value">{{ reservation.buildingName }} {{ reservation.roomName }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">预约类型</span>
                <span class="info-value">{{ formatPurpose(reservation.purpose) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">开始时间</span>
                <span class="info-value">{{ formatFullDateTime(reservation.startTime) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">结束时间</span>
                <span class="info-value">{{ formatFullDateTime(reservation.endTime) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">参与人数</span>
                <span class="info-value">{{ reservation.attendees }}人</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">创建时间</span>
                <span class="info-value">{{ formatFullDateTime(reservation.createdAt) }}</span>
              </div>
            </div>
            
            <div class="info-item full-width" v-if="reservation.facilities">
              <span class="info-label">设备需求</span>
              <div class="facilities-tags">
                <el-tag 
                  v-for="(facility, index) in parseFacilities(reservation.facilities)" 
                  :key="index"
                  size="small"
                  type="info"
                  effect="plain"
                  class="facility-tag">
                  <i :class="getFacilityIcon(facility)"></i> {{ formatFacility(facility) }}
                </el-tag>
              </div>
            </div>
            
            <div class="info-item full-width remarks-section" v-if="reservation.remarks">
              <span class="info-label">备注说明</span>
              <div class="remarks-content">{{ reservation.remarks }}</div>
            </div>
          </div>
        </el-card>
        
        <!-- 审核信息卡片 -->
        <el-card class="detail-card" shadow="hover" v-if="hasReviewInfo">
          <div slot="header" class="card-header">
            <div class="header-left">
              <i class="el-icon-check"></i> 审核信息
            </div>
          </div>
          
          <div class="review-info">
            <div class="info-item full-width">
              <span class="info-label">审核状态</span>
              <span class="info-value">
                <el-tag :type="getReviewStatusType(reservation.status)">
                  {{ getReviewStatusText(reservation.status) }}
                </el-tag>
              </span>
            </div>
            
            <div class="info-item full-width" v-if="reservation.reviewerId">
              <span class="info-label">审核人员</span>
              <span class="info-value">{{ reservation.reviewerName || reservation.reviewerId }}</span>
            </div>
            
            <div class="info-item full-width" v-if="reservation.reviewTime">
              <span class="info-label">审核时间</span>
              <span class="info-value">{{ formatFullDateTime(reservation.reviewTime) }}</span>
            </div>
            
            <div class="info-item full-width remarks-section" v-if="reservation.reviewRemarks">
              <span class="info-label">审核备注</span>
              <div class="remarks-content">{{ reservation.reviewRemarks }}</div>
            </div>
          </div>
        </el-card>
        
        <!-- 操作按钮区 -->
        <div class="operation-area">
          <el-button icon="el-icon-back" @click="$router.push('/my-reservations')">返回列表</el-button>
          <el-button 
            type="danger" 
            icon="el-icon-close" 
            v-if="canCancel(reservation.status)"
            @click="handleCancel">
            取消预约
          </el-button>
        </div>
      </div>
      
      <!-- 取消预约确认对话框 -->
      <el-dialog
        title="取消预约"
        :visible.sync="cancelDialogVisible"
        width="400px">
        <div class="cancel-dialog-content">
          <p class="cancel-message">您确定要取消此次预约吗？</p>
          <p class="cancel-warning">取消后将不可恢复，请谨慎操作！</p>
          
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
import FooterBar from '@/views/front/components/FooterBar.vue';
import { reservationApi } from '@/api/reservations';
import dayjs from 'dayjs';

export default {
  name: 'ReservationDetail',
  components: {
    TopNavbar,
    FooterBar
  },
  data() {
    return {
      // 加载状态
      loading: true,
      cancelling: false,
      
      // 预约详情
      reservation: {},
      
      // 取消预约
      cancelDialogVisible: false,
      cancelForm: {
        reason: ''
      }
    };
  },
  computed: {
    /**
     * 获取预约ID
     */
    reservationId() {
      return this.$route.params.id;
    },
    
    /**
     * 判断是否有审核信息
     */
    hasReviewInfo() {
      return this.reservation.status !== 'pending' || 
        this.reservation.reviewerId || 
        this.reservation.reviewTime || 
        this.reservation.reviewRemarks;
    }
  },
  created() {
    // 获取预约详情
    this.fetchReservationDetail();
  },
  methods: {
    /**
     * 获取预约详情
     */
    fetchReservationDetail() {
      this.loading = true;
      if (!this.$route.params.id) {
        this.$message.error('预约ID不存在');
        return;
      }
      
      reservationApi.getReservationById(this.$route.params.id)
        .then(response => {
          if (response && response.data) {
            this.reservation = response.data;
            console.log('获取到的预约详情:', this.reservation);
          } else {
            this.$message.error('获取预约详情失败');
            // 使用模拟数据（测试用）
            // this.loadMockData();
          }
        })
        .catch(error => {
          console.error('获取预约详情出错', error);
          this.$message.error('获取预约详情出错');
          
          // 使用模拟数据（测试用）
          this.loadMockData();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    /**
     * 加载模拟数据（测试用）
     */
    // loadMockData() {
    //   this.reservation = {
    //     id: this.reservationId || '1001',
    //     userId: '1',
    //     roomId: '101',
    //     buildingName: '主教学楼',
    //     roomName: '301',
    //     title: '高数课程辅导',
    //     purpose: 'teaching',
    //     startTime: '2025-04-15',
    //     endTime: '2025-04-15 12:00:00',
    //     attendees: 30,
    //     status: 'confirmed',
    //     remarks: '需要使用多媒体设备进行教学展示，希望提前15分钟到达准备。',
    //     reviewerId: '5',
    //     reviewerName: '李管理',
    //     reviewTime: '2025-04-12 18:30:00',
    //     reviewRemarks: '审核通过，请按时使用。',
    //     facilities: 'projector,computer,microphone',
    //     createdAt: '2025-04-12 16:30:00',
    //     updatedAt: '2025-04-12 18:30:00'
    //   };
    // },
    
    /**
     * 处理取消预约
     */
    handleCancel() {
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
          reason: this.cancelForm.reason
        };
        
        // 调用API取消预约
        reservationApi.cancelReservation(this.reservationId, params)
          .then(response => {
            console.log('取消预约响应', response);
            if ( response.code == 1) {
                console.log('取消预约成功', response);
              this.$message.success('预约已成功取消');
              this.cancelDialogVisible = false;
              // 刷新详情
              this.fetchReservationDetail();
            } else {
              this.$message.error(response.msg || '取消预约失败');
            }
          })
        //   .catch(error => {
        //     console.error('取消预约出错', error);
        //     this.$message.error('取消预约出错');
            
        //     // 测试用 - 模拟成功
        //     setTimeout(() => {
        //       this.$message.success('预约已成功取消');
        //       this.cancelDialogVisible = false;
              
        //       // 更新本地数据
        //       this.reservation.status = 'cancelled';
        //     }, 1000);
        //   })
        //   .finally(() => {
        //     this.cancelling = false;
        //   });
      });
    },
    
    /**
     * 判断是否可以取消预约
     * @param {string} status - 预约状态
     * @returns {boolean} - 是否可以取消
     */
    canCancel(status) {
      return ['pending', 'confirmed'].includes(status);
    },
    
    /**
     * 获取状态标签类型
     * @param {string} status - 预约状态
     * @returns {string} - 标签类型
     */
    getStatusTagType(status) {
      const typeMap = {
        'pending': 'warning',
        'approved': 'primary',
        'confirmed': 'primary',
        'rejected': 'danger',
        'completed': 'success',
        'cancelled': 'info',
        'occupied': 'danger'
      };
      return typeMap[status] || 'primary';
    },
    
    /**
     * 获取审核状态类型
     * @param {string} status - 预约状态
     * @returns {string} - 标签类型
     */
    getReviewStatusType(status) {
      const typeMap = {
        'pending': 'info',
        'approved': 'success',
        'confirmed': 'success',
        'rejected': 'danger',
        'completed': 'success',
        'cancelled': 'info',
        'occupied': 'danger'
      };
      return typeMap[status] || 'info';
    },
    
    /**
     * 获取审核状态文字
     * @param {string} status - 预约状态
     * @returns {string} - 审核状态文字
     */
    getReviewStatusText(status) {
      const textMap = {
        'pending': '待审核',
        'approved': '已通过',
        'confirmed': '已通过',
        'rejected': '已拒绝',
        'completed': '已完成',
        'cancelled': '已取消',
        'occupied': '已占用'
      };
      return textMap[status] || '未知状态';
    },
    
    /**
     * 格式化预约状态
     * @param {string} status - 预约状态
     * @returns {string} - 格式化后的状态
     */
    formatStatus(status) {
      const statusMap = {
        'pending': '待审核',
        'approved': '已批准',
        'confirmed': '已确认',
        'rejected': '已拒绝',
        'completed': '已完成',
        'cancelled': '已取消',
        'occupied': '已占用'
      };
      return statusMap[status] || status;
    },
    
    /**
     * 格式化预约用途
     * @param {string} purpose - 预约用途
     * @returns {string} - 格式化后的用途
     */
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
     * 获取设施图标
     * @param {string} facility - 设施
     * @returns {string} - 图标类名
     */
    getFacilityIcon(facility) {
      const iconMap = {
        'projector': 'el-icon-video-camera',
        'computer': 'el-icon-monitor',
        'microphone': 'el-icon-microphone',
        'experiment': 'el-icon-s-cooperation',
        'network': 'el-icon-connection',
        'airConditioner': 'el-icon-heavy-rain'
      };
      return iconMap[facility] || 'el-icon-s-tools';
    },
    
    /**
     * 解析设施字符串为数组
     * @param {string} facilities - 设施字符串
     * @returns {Array} - 设施数组
     */
    parseFacilities(facilities) {
      if (!facilities) return [];
      return facilities.split(',');
    },
    
    /**
     * 格式化完整日期时间
     * @param {string} dateStr - 日期字符串
     * @returns {string} - 格式化后的日期时间
     */
    formatFullDateTime(dateStr) {
      if (!dateStr) return '';
      return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
    }
  }
};
</script>

<style scoped>
.reservation-detail-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  max-width: 1000px;
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

.loading-container {
  padding: 40px 20px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.detail-content {
  animation: slideUp 0.5s ease-in-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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

.basic-info, .review-info {
  padding: 10px 0;
}

.reservation-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.title-text {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.reservation-id {
  font-size: 14px;
  color: #909399;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 20px;
  margin-top: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: 1 / -1;
  margin-top: 20px;
}

.info-label {
  color: #909399;
  margin-bottom: 5px;
  font-size: 14px;
}

.info-value {
  font-weight: bold;
  color: #303133;
}

.facilities-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
}

.facility-tag {
  margin-bottom: 5px;
}

.facility-tag i {
  margin-right: 3px;
}

.remarks-section {
  margin-top: 20px;
}

.remarks-content {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #dcdfe6;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
  margin-top: 5px;
}

.operation-area {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
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
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .operation-area {
    flex-direction: column;
  }
  
  .operation-area .el-button {
    margin-bottom: 10px;
  }
}
</style>
