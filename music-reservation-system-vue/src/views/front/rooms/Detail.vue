<template>
  <div class="room-detail-container">
    <!-- 顶部导航栏 -->
    <top-navbar></top-navbar>

    <div class="content-wrapper">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/rooms' }">琴房预约</el-breadcrumb-item>
          <el-breadcrumb-item>琴房详情</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">琴房详情</h2>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 琴房信息卡片 -->
      <el-row v-else :gutter="20">
        <el-col :xs="24" :sm="24" :md="34">
          <el-card class="room-info-card" shadow="hover">
            <div slot="header" class="card-header">
              <div class="header-left">
                <el-tag :type="room.status == '1' ? 'success' : 'danger'" class="room-status">
                  {{ room.status == '1' ? '可预约' : '不可预约' }}
                </el-tag>
                <h3 class="room-title">{{ room.buildingName }} {{ room.roomName }}</h3>
              </div>
            </div>

            <div class="room-detail-content">
              <div class="detail-section">
                <h4 class="section-title"><i class="el-icon-info"></i> 基本信息</h4>
                <el-row :gutter="20" class="info-row">
                  <el-col :span="8" class="info-item">
                    <span class="info-label">琴房编号</span>
                    <span class="info-value">{{ room.roomCode || '暂无' }}</span>
                  </el-col>
                  <el-col :span="8" class="info-item">
                    <span class="info-label">开放时间</span>
                    <span class="info-value">{{ room.openTime || '08:00-22:00' }}</span>
                  </el-col>
                  <el-col :span="8" class="info-item">
                    <span class="info-label">使用状态</span>
                    <span class="info-value" :class="room.status == '1' ? 'text-success' : 'text-danger'">
                      {{ room.status == '1' ? '可用' : '不可用' }}
                    </span>
                  </el-col>
                </el-row>
              </div>

              <div class="detail-section">
                <h4 class="section-title"><i class="el-icon-collection"></i> 座位信息</h4>
                <div class="facilities-list">
                  <el-card class="box-card" v-for="(item, index) in room.seats" :key="'seat-' + index">
                    <div slot="header" class="clearfix">
                      <span>{{item.seatsindex}}</span>
                    </div>
                    <div v-for="(o, index2) in item.dates" :key="'date-' + index + '-' + index2" class="text item">
                      {{'时间段:' + o.date }}
                      状态:
                      {{o.status == '' ? '空闲' : o.status  }}
                      <el-button v-if="o.status == ''" type="primary" size="mini" @click="handleBooking(item, index, index2)">预约</el-button>
                    </div>
                  </el-card>

                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title"><i class="el-icon-document"></i> 琴房描述</h4>
                <div class="room-description">
                  {{ room.description || '暂无琴房描述信息' }}
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title"><i class="el-icon-warning"></i> 使用须知</h4>
                <div class="room-usage-notes">
                  <ol>
                    <li>预约成功后请按时使用，如需取消请提前操作</li>
                    <li>请爱护琴房设施，保持琴房卫生</li>
                    <li>使用结束后请关闭电源、门窗</li>
                    <li>禁止在琴房内吸烟、用火</li>
                    <li>如设备使用有问题，请联系管理员</li>
                  </ol>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

      </el-row>
    </div>

    <!-- 页脚 -->
    <FooterBar />
  </div>
</template>

<script>
import TopNavbar from '@/views/front/components/TopNavbar.vue';
import FooterBar from '@/views/front/components/FooterBar.vue';
import { roomApi } from '@/api/room';
import { reservationApi } from '@/api/reservations';
import dayjs from 'dayjs';

export default {
  name: 'RoomDetail',
  components: {
    TopNavbar,
    FooterBar
  },
  data() {
    return {
      // 加载状态
      loading: true,
      loadingTimeSlots: false,
      loadingBookings: false,

      // 琴房信息
      room: {},

      // 选中的日期
      selectedDate: dayjs().format('YYYY-MM-DD'),

      // 时间段
      timeSlots: [],

      // 预约记录
      bookings: [],

      // 时间段分类
      timePeriods: [
        { value: 'morning', label: '上午 (8:00-12:00)' },
        { value: 'afternoon', label: '下午 (13:00-17:00)' },
        { value: 'evening', label: '晚上 (18:00-22:00)' }
      ],

      // 时间段配置
      timeConfig: {
        startHour: 8,     // 开始时间（8:00）
        endHour: 22,      // 结束时间（22:00）
        interval: 60      // 时间间隔（分钟）
      }
    };
  },
  computed: {
    // 获取琴房ID
    roomId() {
      return this.$route.params.id;
    },



    // 格式化选中的日期
    formatSelectedDate() {
      let dateStr = this.selectedDate;
      if (typeof this.selectedDate === 'object' || (this.selectedDate && this.selectedDate.includes('T'))) {
        dateStr = dayjs(this.selectedDate).format('YYYY-MM-DD');
      }
      return dateStr;
    }
  },
  created() {
    // 初始化日期为今天
    this.selectedDate = dayjs().format('YYYY-MM-DD');

    // 获取琴房详情
    this.fetchRoomDetail();

    // 获取可用时间
    this.fetchAvailableTime();

    // 获取今日预约记录
    this.fetchBookingRecords();
  },
  methods: {
    /**
     * 处理预约
     * @param {Object} item - 时间段信息
     * @param {number} seatIndex - 座位索引
     * @param {number} dateIndex - 日期索引
     */
    handleBooking(item, seatIndex, dateIndex) {
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
      
      let user = JSON.parse(window.localStorage.getItem("user"));
      if (!user) {
        this.$message.error('请先登录');
        this.$router.push('/login');
        return;
      }

      // 检查登录状态
      if (!this.$store.getters.isLoggedIn) {
        this.$message.warning('请先登录后再进行预约');
        this.$router.push('/login');
        return;
      }

      console.log('预约信息:', item, seatIndex, dateIndex);
      console.log('时间段原始数据:', JSON.stringify(this.room.seats[seatIndex].dates[dateIndex]));
      console.log('item数据:', JSON.stringify(item));
      console.log('完整的room.seats结构:', JSON.stringify(this.room.seats));
      
      // 获取时间段信息
      const timeSlot = this.room.seats[seatIndex].dates[dateIndex];
      if (!timeSlot || timeSlot.status === '已预约') {
        this.$message.error('该时间段已被预约');
        return;
      }

      // 检查时间段数据是否完整
      // 尝试从不同的属性中获取时间信息
      let startTime, endTime;
      
      // 方法1: 从timeSlot获取
      if (timeSlot && typeof timeSlot === 'object') {
        startTime = timeSlot.startTime || timeSlot.start || timeSlot.from;
        endTime = timeSlot.endTime || timeSlot.end || timeSlot.to;
        
        // 如果有time属性，尝试解析
        if (!startTime && !endTime && timeSlot.time) {
          const timeParts = String(timeSlot.time).split('-');
          if (timeParts.length === 2) {
            startTime = timeParts[0].trim();
            endTime = timeParts[1].trim();
          }
        }
      }
      
      // 方法2: 从item获取
      if ((!startTime || !endTime) && item && typeof item === 'object') {
        startTime = startTime || item.startTime || item.start || item.from;
        endTime = endTime || item.endTime || item.end || item.to;
        
        if (!startTime && !endTime && item.time) {
          const timeParts = String(item.time).split('-');
          if (timeParts.length === 2) {
            startTime = timeParts[0].trim();
            endTime = timeParts[1].trim();
          }
        }
      }
      
      // 方法3: 使用默认时间段（临时解决方案）
      if (!startTime || !endTime) {
        console.warn('无法从数据中获取时间，使用默认时间段');
        const now = new Date();
        // 使用当前时间+1小时作为开始时间，确保不会早于当前时间
        const startHour = now.getHours() + 1;
        const endHour = startHour + 2;
        startTime = `${startHour.toString().padStart(2, '0')}:00`;
        endTime = `${endHour.toString().padStart(2, '0')}:00`;
        console.log('使用默认时间:', { startTime, endTime });
      }
      
      console.log('最终解析出的时间:', { startTime, endTime });

      // 获取当前日期，并构造完整的开始和结束时间
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // 获取YYYY-MM-DD格式
      
      // 确保时间格式正确（HH:mm）
      startTime = String(startTime).trim();
      endTime = String(endTime).trim();
      
      // 如果时间不包含冒号，尝试修复格式
      if (!startTime.includes(':')) {
        startTime = startTime.length === 1 ? `0${startTime}:00` : `${startTime}:00`;
      } else if (startTime.split(':').length === 2) {
        // 确保有秒数
        startTime = `${startTime}:00`;
      }
      
      if (!endTime.includes(':')) {
        endTime = endTime.length === 1 ? `0${endTime}:00` : `${endTime}:00`;
      } else if (endTime.split(':').length === 2) {
        // 确保有秒数
        endTime = `${endTime}:00`;
      }
      
      // 构造完整的日期时间字符串
      const fullStartTime = `${dateStr} ${startTime}`;
      const fullEndTime = `${dateStr} ${endTime}`;

      console.log('构造的时间:', { fullStartTime, fullEndTime });

      // 构造预约数据
      const reservationData = {
        roomId: this.roomId,
        title: `琴房预约 - ${this.room.name || ''}`,
        purpose: '琴房使用',
        startTime: fullStartTime,
        endTime: fullEndTime,
        attendees: 1,
        userId: user.id,
        contactPhone: user.phone || '',
        remarks: `座位${seatIndex + 1} - ${timeSlot.time || startTime + '-' + endTime}`
      };

      console.log('提交预约数据:', reservationData);

      // 显示加载状态
      const loading = this.$loading({
        lock: true,
        text: '正在提交预约...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      // 调用API创建预约
      reservationApi.createReservation(reservationData)
        .then(response => {
          console.log('预约API响应:', response);
          if (response && response.code == 1) {
            // 预约成功，更新前端状态
            this.room.seats[seatIndex].dates[dateIndex].status = '已预约';
            this.room.seats[seatIndex].dates[dateIndex].username = user.realName;
            this.room.seats[seatIndex].dates[dateIndex].id = user.id;
            this.room.seats[seatIndex].dates[dateIndex].reservationId = response.data.id;
            
            this.$message.success('预约申请提交成功！');
            console.log('更新后的座位信息:', this.room.seats);
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
          loading.close();
        });
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
            this.room.seats = JSON.parse(response.data.seats)
            console.log('获取到的琴房详情:', this.room);

            // 确保设施是数组
            if (!Array.isArray(this.room.facilities)) {
              this.room.facilities = this.room.facilities ? this.room.facilities.split(',') : [];
            }
          } else {
            this.$message.error('获取琴房详情失败');
            // 使用模拟数据
            this.loadMockRoomDetail();
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
     * 生成时间段列表
     * @param {Array} bookedSlots - 已预约的时间段
     * @returns {Array} - 所有时间段列表
     */
    generateTimeSlots(bookedSlots) {
      const slots = [];
      const date = this.selectedDate;
      const { startHour, endHour } = this.timeConfig;

      // 按时间排序已预约的时间段
      const sortedBookedSlots = [...bookedSlots].sort((a, b) =>
        dayjs(a.isoStart).valueOf() - dayjs(b.isoStart).valueOf()
      );

      // 当前时间点
      let currentTime = dayjs(date).hour(startHour).minute(0);
      const endTime = dayjs(date).hour(endHour).minute(0);

      // 处理每个已预约时间段前的可用时间
      sortedBookedSlots.forEach(bookedSlot => {
        const bookingStart = dayjs(bookedSlot.isoStart);

        // 如果当前时间点到预约开始时间有空隙，添加可用时间段
        if (currentTime.isBefore(bookingStart)) {
          // 计算可用的分钟数
          const availableMinutes = bookingStart.diff(currentTime, 'minute');

          // 如果可用时间大于等于30分钟，才创建时间段
          if (availableMinutes >= 30) {
            // 优先创建2小时的时间段
            while (currentTime.isBefore(bookingStart)) {
              const slotEnd = currentTime.add(120, 'minute');
              const actualEnd = slotEnd.isAfter(bookingStart) ? bookingStart : slotEnd;

              slots.push({
                id: `${currentTime.toISOString()}-${actualEnd.toISOString()}`,
                startTime: currentTime.format('HH:mm'),
                endTime: actualEnd.format('HH:mm'),
                isoStart: currentTime.toISOString(),
                isoEnd: actualEnd.toISOString(),
                available: true,
                period: this.getTimePeriod(currentTime.toISOString())
              });

              if (actualEnd.isSame(bookingStart)) {
                break;
              }
              currentTime = slotEnd;
            }
          }
        }

        // 添加已预约时间段
        slots.push({
          id: `${bookedSlot.isoStart}-${bookedSlot.isoEnd}`,
          startTime: dayjs(bookedSlot.isoStart).format('HH:mm'),
          endTime: dayjs(bookedSlot.isoEnd).format('HH:mm'),
          isoStart: bookedSlot.isoStart,
          isoEnd: bookedSlot.isoEnd,
          available: false,
          period: this.getTimePeriod(bookedSlot.isoStart),
          conflictReason: bookedSlot.conflictReason || '该时间段已被预约'
        });

        currentTime = dayjs(bookedSlot.isoEnd);
      });

      // 处理最后一个预约之后到结束时间的时间段
      if (currentTime.isBefore(endTime)) {
        while (currentTime.isBefore(endTime)) {
          const slotEnd = currentTime.add(120, 'minute');
          const actualEnd = slotEnd.isAfter(endTime) ? endTime : slotEnd;

          // 如果剩余时间大于等于30分钟，才创建时间段
          if (actualEnd.diff(currentTime, 'minute') >= 30) {
            slots.push({
              id: `${currentTime.toISOString()}-${actualEnd.toISOString()}`,
              startTime: currentTime.format('HH:mm'),
              endTime: actualEnd.format('HH:mm'),
              isoStart: currentTime.toISOString(),
              isoEnd: actualEnd.toISOString(),
              available: true,
              period: this.getTimePeriod(currentTime.toISOString())
            });
          }

          if (actualEnd.isSame(endTime)) {
            break;
          }
          currentTime = slotEnd;
        }
      }

      // 如果没有任何预约，生成全天的时间段
      if (sortedBookedSlots.length === 0) {
        currentTime = dayjs(date).hour(startHour).minute(0);
        while (currentTime.isBefore(endTime)) {
          const slotEnd = currentTime.add(120, 'minute');
          const actualEnd = slotEnd.isAfter(endTime) ? endTime : slotEnd;

          slots.push({
            id: `${currentTime.toISOString()}-${actualEnd.toISOString()}`,
            startTime: currentTime.format('HH:mm'),
            endTime: actualEnd.format('HH:mm'),
            isoStart: currentTime.toISOString(),
            isoEnd: actualEnd.toISOString(),
            available: true,
            period: this.getTimePeriod(currentTime.toISOString())
          });

          if (actualEnd.isSame(endTime)) {
            break;
          }
          currentTime = slotEnd;
        }
      }

      return slots;
    },

    /**
     * 获取可用时间
     */
    fetchAvailableTime() {
      this.loadingTimeSlots = true;

      // 确保日期格式正确 (YYYY-MM-DD)
      let formattedDate = this.selectedDate;
      if (typeof this.selectedDate === 'object' || this.selectedDate.includes('T')) {
        formattedDate = dayjs(this.selectedDate).format('YYYY-MM-DD');
      }

      const params = {
        roomId: this.roomId,
        date: formattedDate
      };

      console.log('请求可用时间参数:', params);

      reservationApi.getAvailability(params)
        .then(response => {
          if (response && response.data) {
            // 生成时间段列表
            this.timeSlots = this.generateTimeSlots(response.data);

            console.log('获取到的时间段:', this.timeSlots);
          } else {
            this.timeSlots = [];
            this.loadMockTimeSlots();
          }
        })
        .catch(error => {
          console.error('获取可用时间出错', error);
          this.timeSlots = [];
          this.loadMockTimeSlots();
        })
        .finally(() => {
          this.loadingTimeSlots = false;
        });
    },

    /**
     * 获取今日预约记录
     */
    fetchBookingRecords() {
      this.loadingBookings = true;

      // 确保使用正确的日期格式
      let formattedDate = this.selectedDate;
      if (typeof this.selectedDate === 'object' || (this.selectedDate && this.selectedDate.includes('T'))) {
        formattedDate = dayjs(this.selectedDate).format('YYYY-MM-DD');
      }

      const params = {
        roomId: this.roomId,
        startDate: formattedDate
      };

      console.log('请求预约记录参数:', params);

      reservationApi.getReservationList(params)
        .then(response => {
          if (response && response.data) {
            this.bookings = response.data.rows || [];
            console.log('获取到的预约记录:', this.bookings);
          } else {
            this.bookings = [];
            // 使用模拟数据
            this.loadMockBookings();
          }
        })
        .catch(error => {
          console.error('获取预约记录出错', error);
          this.bookings = [];
          // 使用模拟数据
          this.loadMockBookings();
        })
        .finally(() => {
          this.loadingBookings = false;
        });
    },

    /**
     * 加载模拟琴房详情（测试用）
     */
    loadMockRoomDetail() {
      this.room = {
        id: this.roomId,
        buildingName: '主教学楼',
        roomName: '301',
        roomCode: 'MJX-301',
        floor: 3,
        roomType: 'classroom',
        capacity: 60,
        openTime: '08:00-22:00',
        available: true,
        facilities: ['projector', 'computer', 'airConditioner', 'network'],
        description: '这是一间位于主教学楼3层的普通琴房，适合小班教学、小组讨论等活动。琴房配备基础投影设备和电脑，环境整洁舒适。'
      };
    },

    /**
     * 加载模拟可用时间（测试用）
     */
    loadMockTimeSlots() {
      this.timeSlots = [
        { id: 1, startTime: '08:00', endTime: '10:00', available: true, period: 'morning' },
        { id: 2, startTime: '10:00', endTime: '12:00', available: false, period: 'morning' },
        { id: 3, startTime: '13:00', endTime: '15:00', available: true, period: 'afternoon' },
        { id: 4, startTime: '15:00', endTime: '17:00', available: true, period: 'afternoon' },
        { id: 5, startTime: '18:00', endTime: '20:00', available: false, period: 'evening' },
        { id: 6, startTime: '20:00', endTime: '22:00', available: true, period: 'evening' }
      ];
    },

    /**
     * 加载模拟预约记录（测试用）
     */
    loadMockBookings() {
      this.bookings = [
        {
          id: 1,
          title: '高数课程辅导',
          startTime: '10:00',
          endTime: '12:00',
          status: 'confirmed',
          userName: '张教授'
        },
        {
          id: 2,
          title: '学习小组讨论',
          startTime: '18:00',
          endTime: '20:00',
          status: 'completed',
          userName: '李同学'
        }
      ];
    },

    /**
     * 按时间段分类获取时间槽
     * @param {string} period - 时间段
     * @returns {Array} - 时间槽数组
     */
    getTimeSlotsByPeriod(period) {
      return this.timeSlots.filter(slot => slot.period === period);
    },

    /**
     * 格式化琴房类型
     * @param {string} type - 琴房类型
     * @returns {string} - 格式化后的琴房类型
     */
    formatRoomType(type) {
      const typeMap = {
        'classroom': '普通琴房',
        'multimedia': '多媒体琴房',
        'lab': '实验室',
        'meeting': '会议室',
      };
      return typeMap[type] || type;
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
     * 禁用日期
     * @param {Date} date - 日期
     * @returns {boolean} - 是否禁用
     */
    disabledDate(date) {
      return date < new Date(new Date().setHours(0, 0, 0, 0));
    },

    /**
     * 获取预约状态类型
     * @param {string} status - 预约状态
     * @returns {string} - 状态类型
     */
    getBookingType(status) {
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
     * 获取预约状态颜色
     * @param {string} status - 预约状态
     * @returns {string} - 状态颜色
     */
    getBookingColor(status) {
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
     * 获取预约标签类型
     * @param {string} status - 预约状态
     * @returns {string} - 标签类型
     */
    getBookingTagType(status) {
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
     * 格式化预约状态
     * @param {string} status - 预约状态
     * @returns {string} - 格式化后的状态
     */
    formatBookingStatus(status) {
      const statusMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'completed': '已完成',
        'cancelled': '已取消',
        'occupied': '已占用'
      };
      return statusMap[status] || status;
    },

    /**
     * 预约琴房
     */
    bookRoom() {
      // 检查用户是否登录
      const token = localStorage.getItem('token');
      if (!token) {
        this.$message({
          message: '请先登录后再进行预约',
          type: 'warning'
        });
        this.$router.push('/login');
        return;
      }

      // 跳转到预约页面
      this.$router.push(`/reservations/create/${this.roomId}`);
    },

    /**
     * 根据时间判断属于哪个时间段
     * @param {string} isoTime - ISO格式时间
     * @returns {string} - 时间段
     */
    getTimePeriod(isoTime) {
      const hour = dayjs(isoTime).hour();
      if (hour >= 8 && hour < 12) {
        return 'morning';
      } else if (hour >= 13 && hour < 17) {
        return 'afternoon';
      } else if (hour >= 18 && hour < 22) {
        return 'evening';
      }
      return '';
    },

    /**
     * 处理日期变化
     */
    handleDateChange() {
      // 更新可用时间
      this.fetchAvailableTime();
      // 同时更新预约记录
      this.fetchBookingRecords();
    }
  }
};
</script>

<style scoped>
.room-detail-container {
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

.room-info-card,
.availability-card,
.booking-records-card {
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

.room-status {
  margin-right: 10px;
}

.room-title {
  margin: 0;
  font-size: 18px;
}

.room-detail-content {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 5px;
  color: #409EFF;
}

.info-row {
  margin-bottom: 15px;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.info-value {
  font-size: 16px;
  color: #303133;
}

.text-success {
  color: #67C23A;
}

.text-danger {
  color: #F56C6C;
}

.facilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.facility-tag {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

.facility-tag i {
  margin-right: 5px;
}

.room-description,
.room-usage-notes {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.room-usage-notes ol {
  padding-left: 20px;
  margin: 0;
}

.room-usage-notes li {
  margin-bottom: 8px;
}

.date-selector {
  margin-bottom: 20px;
}

.time-slots-loading,
.bookings-loading {
  padding: 10px;
}

.time-slot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.time-slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-radius: 4px;
  border: 1px solid #EBEEF5;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.time-slot-item.available {
  background-color: #F0F9EB;
  border-color: #E1F3D8;
}

.time-slot-item.unavailable {
  background-color: #FEF0F0;
  border-color: #FDE2E2;
}

.time-range {
  font-size: 14px;
  font-weight: 500;
}

.time-slot-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-icon {
  color: #E6A23C;
  font-size: 16px;
  cursor: pointer;
}

.booking-btn-container {
  margin-top: 20px;
  text-align: center;
}

.booking-btn {
  width: 100%;
}

.booking-card {
  margin-bottom: 10px;
}

.booking-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.booking-title {
  font-weight: bold;
}

.booking-user {
  font-size: 13px;
  color: #909399;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 10px;
  }

  .room-info-card,
  .availability-card,
  .booking-records-card {
    margin-bottom: 15px;
  }

  .time-slot-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    margin-bottom: 10px;
  }
}

.time-slots-summary {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 15px;
}

.summary-item {
  text-align: center;
  padding: 0 15px;
}

.summary-label {
  font-size: 14px;
  color: #606266;
  margin-right: 5px;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.summary-item.available .summary-value {
  color: #67C23A;
}

.summary-item.booked .summary-value {
  color: #F56C6C;
}
</style>
