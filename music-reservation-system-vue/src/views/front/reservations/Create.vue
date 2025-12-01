<template>
  <div class="create-reservation-container">
    <!-- 顶部导航栏 -->
    <top-navbar></top-navbar>
    
    <div class="content-wrapper">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/rooms' }">琴房预约</el-breadcrumb-item>
          <el-breadcrumb-item>创建预约</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">创建预约</h2>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <el-row v-else :gutter="20">
        <el-col :xs="24" :sm="24" :md="16">
          <!-- 预约表单卡片 -->
          <el-card class="reservation-form-card" shadow="hover">
            <div slot="header" class="card-header">
              <div class="header-left">
                <i class="el-icon-edit"></i> 填写预约信息
              </div>
              <div class="header-right">
                <el-tag type="primary">{{ room.buildingName || '' }} {{ room.roomName || '' }}</el-tag>
              </div>
            </div>
            
            <el-form 
              :model="reservationForm" 
              :rules="reservationRules" 
              ref="reservationForm" 
              label-width="100px"
              size="medium">
              
              <el-form-item label="预约标题" prop="title">
                <el-input 
                  v-model="reservationForm.title" 
                  placeholder="请输入预约标题，例如：小组讨论会"
                  maxlength="50"
                  show-word-limit>
                </el-input>
              </el-form-item>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker
                      v-model="reservationForm.startTime"
                      type="datetime"
                      placeholder="选择开始时间"
                      style="width: 100%"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      :picker-options="startTimeOptions"
                      @change="handleStartTimeChange">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="结束时间" prop="endTime">
                    <el-date-picker
                      v-model="reservationForm.endTime"
                      type="datetime"
                      placeholder="选择结束时间"
                      style="width: 100%"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      :picker-options="endTimeOptions">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="预约用途" prop="purpose">
                    <el-select v-model="reservationForm.purpose" placeholder="请选择预约用途" style="width: 100%">
                      <el-option label="教学活动" value="teaching">
                        <i class="el-icon-reading"></i> 教学活动
                      </el-option>
                      <el-option label="学生活动" value="student">
                        <i class="el-icon-user"></i> 学生活动
                      </el-option>
                      <el-option label="会议" value="meeting">
                        <i class="el-icon-message"></i> 会议
                      </el-option>
                      <el-option label="培训" value="training">
                        <i class="el-icon-s-custom"></i> 培训
                      </el-option>
                      <el-option label="其他" value="other">
                        <i class="el-icon-more"></i> 其他
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="参与人数" prop="attendees">
                    <el-input-number 
                      v-model="reservationForm.attendees" 
                      :min="1" 
                      :max="room.capacity || 999" 
                      style="width: 100%">
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="设备需求" prop="facilities">
                <el-checkbox-group v-model="reservationForm.facilities" class="facility-checkbox-group">
                  <el-checkbox v-for="(facility, index) in availableFacilities" :key="index" :label="facility.value" border>
                    <i :class="getFacilityIcon(facility.value)"></i> {{ facility.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input
                  v-model="reservationForm.contactPhone"
                  placeholder="请输入联系电话"
                  maxlength="20">
                  <i slot="prefix" class="el-icon-phone"></i>
                </el-input>
              </el-form-item>
              
              <el-form-item label="备注说明" prop="remarks">
                <el-input
                  type="textarea"
                  v-model="reservationForm.remarks"
                  placeholder="请输入备注说明（选填）"
                  :rows="3"
                  maxlength="200"
                  show-word-limit>
                </el-input>
              </el-form-item>
              
              <el-form-item class="form-buttons">
                <el-button type="primary" @click="submitReservation" :loading="submitting" class="submit-btn">
                  <i class="el-icon-check"></i> 确认提交
                </el-button>
                <el-button @click="$router.go(-1)">
                  <i class="el-icon-back"></i> 返回
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="24" :md="8">
          <!-- 琴房信息卡片 -->
          <el-card class="room-info-card" shadow="hover">
            <div slot="header" class="card-header">
              <i class="el-icon-info"></i> 琴房信息
            </div>
            
            <div class="room-info-content">
              <div class="room-name">{{ room.name || (room.buildingName && room.roomName ? room.buildingName + ' ' + room.roomName : '未知琴房') }}</div>
              <div class="room-type">
                <i class="el-icon-office-building"></i>
                <span>{{ formatRoomType(room.roomTypeId) }}</span>
              </div>
              
              <el-divider></el-divider>
              
              <div class="info-item">
                <span class="info-label">容纳人数</span>
                <span class="info-value">{{ room.capacity || 0 }}人</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">位置信息</span>
                <span class="info-value">{{ room.floor || '暂无' }}层</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">开放时间</span>
                <span class="info-value">{{ room.openTime || '08:00-22:00' }}</span>
              </div>

              <!-- <div class="info-item">
                <span class="info-label">室内面积</span>
                <span class="info-value">{{ room.area || '暂无' }} 平方米</span>
              </div>

              <div class="info-item">
                <span class="info-label">预计费用</span>
                <span class="info-value price">{{ calculateFee() }} 元</span>
              </div> -->
              
              <el-divider></el-divider>
              
              <div class="facilities-info">
                <div class="facilities-label">可用设施</div>
                <div class="facilities-list">
                  <el-tag 
                    v-for="(facility, index) in room.facilities" 
                    :key="index"
                    class="facility-tag"
                    effect="plain"
                    size="small"
                    type="info">
                    <i :class="getFacilityIcon(facility)"></i> {{ formatFacility(facility) }}
                  </el-tag>
                  <el-empty v-if="!room.facilities || room.facilities.length === 0" description="暂无设施信息" :image-size="80"></el-empty>
                </div>
              </div>

              <div v-if="room.description" class="room-description">
                <div class="facilities-label">琴房简介</div>
                <p>{{ room.description }}</p>
              </div>
            </div>
          </el-card>
          
          <!-- 预约须知卡片 -->
          <el-card class="notice-card" shadow="hover">
            <div slot="header" class="card-header">
              <i class="el-icon-warning"></i> 预约须知
            </div>
            
            <div class="notice-content">
              <ol>
                <li>请至少提前24小时预约琴房</li>
                <li>预约成功后将发送确认通知到您的邮箱/手机</li>
                <li>如需取消预约，请至少提前12小时操作</li>
                <li>请按时使用琴房，并在使用后保持清洁</li>
                <li>请遵守校园规章制度和文明公约</li>
              </ol>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 预约成功对话框 -->
      <el-dialog
        title="预约成功"
        :visible.sync="successDialogVisible"
        width="450px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="false"
        custom-class="success-dialog">
        <div class="success-dialog-content">
          <div class="success-icon-wrapper">
            <i class="el-icon-success success-icon"></i>
            <div class="success-icon-pulse"></div>
          </div>
          <p class="success-message">恭喜您，琴房预约申请已提交成功！</p>
          <div class="success-info-card">
            <div class="info-row">
              <span class="info-label">预约编号</span>
              <span class="info-value">{{ reservationId }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">琴房</span>
              <span class="info-value">{{ room.name || (room.buildingName + ' ' + room.roomName) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">预约时间</span>
              <span class="info-value">{{ formatDate(reservationForm.startTime) }} - {{ formatTime(reservationForm.endTime) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">状态</span>
              <el-tag size="small" type="warning" effect="dark">待审核</el-tag>
            </div>
          </div>
          <p class="success-tips">您可以在"我的预约"中查看预约审核进度</p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="info" @click="goToReservationList" icon="el-icon-menu">查看我的预约</el-button>
          <el-button type="primary" @click="continueReservation" icon="el-icon-plus">继续预约</el-button>
        </span>
      </el-dialog>
    </div>

    <!-- 页脚 -->
    <FooterBar />
  </div>
</template>

<script>
import TopNavbar from '@/views/front/components/TopNavbar.vue';
import { roomApi } from '@/api/room';
import { reservationApi } from '@/api/reservations';
import dayjs from 'dayjs';
import { roomTypeApi } from '@/api/roomType';
import FooterBar from '@/views/front/components/FooterBar.vue';

export default {
  name: 'CreateReservation',
  components: {
    TopNavbar,
    FooterBar
  },
  data() {

    // 自定义验证函数：结束时间必须晚于开始时间
    const validateEndTime = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择结束时间'));
      } else if (!this.reservationForm.startTime) {
        callback(new Error('请先选择开始时间'));
      } else if (dayjs(value).isBefore(dayjs(this.reservationForm.startTime))) {
        callback(new Error('结束时间必须晚于开始时间'));
      } 
      // else if (dayjs(value).diff(dayjs(this.reservationForm.startTime), 'hour') > 4) {
      //   callback(new Error('单次预约时长不能超过4小时'));
      // } 
      else {
        callback();
      }
    };
    
    return {
      roomTypeList: [],
      // 加载状态
      loading: true,
      submitting: false,
      
      // 预约成功对话框
      successDialogVisible: false,
      reservationId: '',
      
      // 琴房信息
      room: {},
      
      // 预约表单
      reservationForm: {
        roomId: '',
        title: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1,
        facilities: [],
        contactPhone: '',
        remarks: ''
      },
      
      // 表单验证规则
      reservationRules: {
        title: [
          { required: true, message: '请输入预约标题', trigger: 'blur' },
          { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' },
          { validator: validateEndTime, trigger: 'change' }
        ],
        purpose: [
          { required: true, message: '请选择预约用途', trigger: 'change' }
        ],
        attendees: [
          { required: true, message: '请输入参与人数', trigger: 'blur' },
          { type: 'number', min: 1, message: '人数必须大于0', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$|^(0\d{2,3}-?)?[1-9]\d{6,7}(-\d{1,4})?$/, message: '请输入正确的电话号码', trigger: 'blur' }
        ]
      },
      
      // 开始时间选择器配置
      startTimeOptions: {
        disabledDate: (time) => {
          return time.getTime() < Date.now() - 8.64e7; // 不能选择过去的日期
        },
        // selectableRange: '08:00:00 - 22:00:00'  // 可选时间范围
      },
      
      // 结束时间选择器配置
      endTimeOptions: {
        disabledDate: (time) => {
          return time.getTime() < Date.now() - 8.64e7; // 不能选择过去的日期
        },
        // selectableRange: '08:00:00 - 22:00:00'  // 可选时间范围
      },
      
      // 可用设施选项
      availableFacilities: [
        { value: 'projector', label: '投影仪' },
        { value: 'computer', label: '电脑' },
        { value: 'microphone', label: '麦克风' }
      ]
    };
  },
  computed: {
    // 获取琴房ID
    roomId() {
      // 优先使用路径参数，如果没有则使用查询参数
      return this.$route.params.roomId || this.$route.query.roomId;
    }
  },
  created() {

    this.fetchRoomTypeList()

    // 获取琴房信息
    this.fetchRoomDetail();
    
    // 设置默认预约表单值
    this.initForm();

    // 如果从查询参数中获取了开始时间和结束时间，则设置到表单中
    if (this.$route.query.startTime && this.$route.query.endTime) {
      // 将字符串日期转换为日期对象，然后再格式化，修复日期选择器问题
      try {
        // 使用dayjs解析并格式化日期，确保格式正确
        const startTime = dayjs(this.$route.query.startTime).format('YYYY-MM-DD HH:mm:ss');
        const endTime = dayjs(this.$route.query.endTime).format('YYYY-MM-DD HH:mm:ss');
        
        console.log('解析的开始时间:', startTime);
        console.log('解析的结束时间:', endTime);
        
        this.reservationForm.startTime = startTime;
        this.reservationForm.endTime = endTime;
      } catch (error) {
        console.error('日期解析错误:', error);
        // 出错时使用默认时间
        this.initForm();
      }
    }
  },
  methods: {
    // 获取琴房类型列表
    fetchRoomTypeList() {
      roomTypeApi.list().then(res => {
        this.roomTypeList = res.data.list
      })
    },
    /**
     * 获取琴房详情
     */
    fetchRoomDetail() {
      this.loading = true;
      
      roomApi.getById(this.roomId)
        .then(response => {
          if (response && response.data) {
            this.room = response.data;
            console.log('获取到的琴房详情:', this.room);
            
            // 确保设施是数组
            if (!Array.isArray(this.room.facilities)) {
              this.room.facilities = this.room.facilities ? this.room.facilities.split(',') : [];
            }
            
            // 更新可用设施选项
            this.updateAvailableFacilities();
          } else {
            this.$message.error('获取琴房详情失败');
            // 使用模拟数据
            // this.loadMockRoomDetail();
          }
        })
        .catch(error => {
          console.error('获取琴房详情出错', error);
          this.$message.error('获取琴房详情出错');
          // 使用模拟数据
          this.loadMockRoomDetail();
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    /**
     * 加载模拟琴房详情（测试用）
     */
    loadMockRoomDetail() {
      // 从路由查询参数中获取额外信息
      const roomName = this.$route.query.roomName;
      const roomTypeId = this.$route.query.roomTypeId;
      
      this.room = {
        id: this.roomId,
        buildingName: roomName ? roomName.split(' ')[0] || '主教学楼' : '主教学楼',
        roomName: roomName ? roomName.split(' ')[1] || '301' : '301',
        name: roomName || '主教学楼301',
        roomCode: `MJX-${roomName ? roomName.split(' ')[1] || '301' : '301'}`,
        floor: 3,
        roomTypeId: roomTypeId || 'classroom',
        type: roomTypeId || 'classroom',
        capacity: 60,
        openTime: '08:00-22:00',
        available: true,
        facilities: ['projector', 'computer', 'airConditioner', 'network'],
        description: '这是一间位于主教学楼3层的普通琴房，适合小班教学、小组讨论等活动。琴房配备基础投影设备和电脑，环境整洁舒适。'
      };
      
      // 更新可用设施选项
      this.updateAvailableFacilities();
      
      console.log('使用模拟数据:', this.room);
    },
    
    /**
     * 更新可用设施选项
     */
    updateAvailableFacilities() {
      if (!this.room.facilities || this.room.facilities.length === 0) return;
      
      // 根据琴房已有设施更新可选的设施
      this.availableFacilities = this.room.facilities.map(facility => {
        return {
          value: facility,
          label: this.formatFacility(facility)
        };
      });
    },
    
    /**
     * 初始化表单
     */
    initForm() {
      // 设置默认值
      this.reservationForm.roomId = this.roomId;
      
      // 获取用户电话
      const user = localStorage.getItem('user');
      if (user) {
        const userObj = JSON.parse(user);
        this.reservationForm.contactPhone = userObj.phone || '';
      }
      
      // 设置开始时间为当前时间向后取整小时
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      this.reservationForm.startTime = dayjs(now).format('YYYY-MM-DD HH:mm:ss');
      
      // 设置结束时间为开始时间后2小时
      const endTime = new Date(now);
      endTime.setHours(endTime.getHours() + 2);
      this.reservationForm.endTime = dayjs(endTime).format('YYYY-MM-DD HH:mm:ss');
    },
    
    /**
     * 处理开始时间变化
     */
    handleStartTimeChange(time) {
      if (!time) {
        this.reservationForm.endTime = '';
        return;
      }
      
      console.log('开始时间变更:', time, typeof time);
      
      // 确保time是有效的日期值
      const startTime = dayjs(time);
      
      // 如果结束时间早于开始时间，则重置结束时间
      if (this.reservationForm.endTime && dayjs(this.reservationForm.endTime).isBefore(startTime)) {
        // 设置结束时间为开始时间后2小时
        const endTime = startTime.add(2, 'hour');
        this.reservationForm.endTime = endTime.format('YYYY-MM-DD HH:mm:ss');
      }
    },
    
    /**
     * 提交预约
     */
    submitReservation() {
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
      
      // 检查登录状态
      if (!this.$store.getters.isLoggedIn) {
        this.$message.warning('请先登录后再进行预约');
        this.$router.push('/login');
        return;
      }

      // 获取用户ID
      const userId = this.$store.state.user?.id;
      if (!userId) {
        this.$message.error('获取用户信息失败，请重新登录');
        this.$router.push('/login');
        return;
      }

      this.$refs.reservationForm.validate(valid => {
        if (!valid) return;
        
        this.submitting = true;
        
        // 构造预约数据
        const reservationData = {
          ...this.reservationForm,
          facilities: this.reservationForm.facilities.join(','),
          userId: userId
        };
        
        console.log('提交预约数据:', reservationData);
        
        // 调用API创建预约
        reservationApi.createReservation(reservationData)
          .then(response => {
            console.log('预约API响应:', response);
            if (response && response.code == 1) {
              console.log('预约成功:', response.data);
              this.reservationId = response.data.id || '临时ID-' + Math.floor(Math.random() * 10000);
              this.successDialogVisible = true;
              this.$message.success('预约申请提交成功！');
            } else if (response && response.code == 401) {
              // Token过期或未登录
              this.$message.warning('登录已过期，请重新登录');
              this.$store.dispatch('logout');
              this.$router.push('/login');
            } else {
              const errMsg = (response && response.msg) ? response.msg : '预约提交失败，请重试';
              this.$message.error(errMsg);
              console.error('预约失败响应:', response);
            }
          })
          .catch(error => {
            console.error('预约提交出错:', error);
            if (error.response && error.response.status === 401) {
              this.$message.warning('登录已过期，请重新登录');
              this.$store.dispatch('logout');
              this.$router.push('/login');
            } else {
              this.$message.error('网络异常，请稍后重试');
            }
          })
          .finally(() => {
            this.submitting = false;
          });
      });
    },
    
    /**
     * 跳转到我的预约列表
     */
    goToReservationList() {
      this.successDialogVisible = false;
      this.$router.push('/my-reservations');
    },
    
    /**
     * 继续预约
     */
    continueReservation() {
      this.successDialogVisible = false;
      this.$router.push('/rooms');
    },
    
    /**
     * 格式化琴房类型
     * @param {string} type - 琴房类型
     * @returns {string} - 格式化后的琴房类型
     */
    formatRoomType(roomTypeId) {
      const typeMap = this.roomTypeList.find(item => item.id == roomTypeId)
      return typeMap ? typeMap.typeName : '未知'
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
     * 计算预估费用
     * @returns {string} 格式化后的费用
     */
    calculateFee() {
      if (!this.reservationForm.startTime || !this.reservationForm.endTime) {
        return '0.00';
      }
      
      // 基本每小时费率，根据琴房类型定义
      const hourlyRate = {
        'classroom': 50,
        'multimedia': 100,
        'lab': 150,
        'meeting': 80
      };
      
      // 获取琴房类型
      const roomType = this.room.type || this.room.roomType || 'classroom';
      
      // 获取预约时长（小时）
      const startTime = dayjs(this.reservationForm.startTime);
      const endTime = dayjs(this.reservationForm.endTime);
      const hours = endTime.diff(startTime, 'hour', true);
      
      // 计算费用
      const rate = hourlyRate[roomType] || 50;
      const fee = rate * hours;
      
      // 返回格式化的费用
      return fee.toFixed(2);
    },
    
    /**
     * 格式化日期显示
     * @param {string} dateStr - 日期字符串
     * @returns {string} - 格式化后的日期
     */
    formatDate(dateStr) {
      if (!dateStr) return '';
      return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
    },
    
    /**
     * 格式化时间显示
     * @param {string} dateStr - 日期字符串
     * @returns {string} - 格式化后的时间
     */
    formatTime(dateStr) {
      if (!dateStr) return '';
      return dayjs(dateStr).format('HH:mm');
    }
  }
};
</script>

<style scoped>
.create-reservation-container {
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

.loading-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.reservation-form-card,
.room-info-card,
.notice-card {
  margin-bottom: 20px;
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
}

.header-left i {
  margin-right: 5px;
}

.submit-btn {
  width: 120px;
}

.room-info-content {
  padding: 10px 0;
}

.room-name {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.room-type {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.room-type i {
  margin-right: 5px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.info-label {
  color: #909399;
}

.info-value {
  font-weight: bold;
}

.facilities-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.facilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.facility-tag {
  margin-bottom: 8px;
}

.facility-tag i {
  margin-right: 3px;
}

.notice-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.notice-content ol {
  padding-left: 20px;
  margin: 0;
}

.notice-content li {
  margin-bottom: 8px;
}

.success-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.success-dialog .el-dialog__header {
  background-color: #67C23A;
  color: white;
  padding: 15px 20px;
}

.success-dialog .el-dialog__title {
  color: white;
  font-weight: bold;
}

.success-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-icon {
  font-size: 80px;
  color: #67C23A;
  z-index: 2;
}

.success-icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(103, 194, 58, 0.2);
  animation: pulse 1.5s infinite;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

.success-message {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
}

.success-info-card {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border-left: 4px solid #67C23A;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.info-row:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-label {
  color: #909399;
  font-size: 14px;
}

.success-tips {
  font-size: 14px;
  color: #909399;
  margin-top: 15px;
  text-align: center;
}

.dialog-footer {
  text-align: center;
  display: block;
  padding-top: 10px;
}

.dialog-footer .el-button {
  min-width: 140px;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 10px;
  }
  
  .reservation-form-card,
  .room-info-card,
  .notice-card {
    margin-bottom: 15px;
  }
}

.price {
  color: #F56C6C;
  font-size: 16px;
}

.room-description {
  margin-top: 15px;
  line-height: 1.6;
}

.room-description p {
  color: #606266;
  font-size: 14px;
  margin: 5px 0;
}

.facility-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.facility-checkbox-group .el-checkbox {
  margin-right: 15px;
  margin-bottom: 10px;
}

.form-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.form-buttons .el-button {
  min-width: 120px;
  transition: all 0.3s;
}

.form-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.submit-btn {
  width: 150px;
  margin-right: 15px;
}

.reservation-form-card {
  background: linear-gradient(to bottom, #ffffff, #f9fafc);
}

.el-form-item {
  margin-bottom: 20px;
}
</style> 