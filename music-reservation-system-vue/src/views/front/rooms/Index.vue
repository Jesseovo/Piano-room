<template>
  <div class="rooms-container">
    <!-- 顶部导航栏 -->
    <top-navbar></top-navbar>

    <div class="content-wrapper">
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>琴房预约</el-breadcrumb-item>
        </el-breadcrumb>
        <h2 class="page-title">琴房预约</h2>
      </div>

      <el-row :gutter="20">

        <!-- 右侧琴房列表 -->
        <el-col :xs="24" :sm="24" :md="34">
          <el-card class="room-list-card" shadow="hover">
            <div slot="header" class="card-header">
              <div class="header-left">
                <i class="el-icon-office-building"></i> 可用琴房
                <el-tag type="success" size="small" class="room-count">共 {{total}} 个</el-tag>
              </div>
              <div class="header-right">
                <el-radio-group v-model="viewMode" size="small">
                  <el-radio-button label="card">
                    <i class="el-icon-s-grid"></i> 卡片视图
                  </el-radio-button>
                  <el-radio-button label="table">
                    <i class="el-icon-s-unfold"></i> 列表视图
                  </el-radio-button>
                </el-radio-group>
              </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="loading" class="loading-container">
              <el-skeleton :rows="5" animated />
            </div>

            <!-- 无数据状态 -->
            <el-empty
              v-else-if="rooms.length === 0"
              description="暂无符合条件的琴房"
              :image-size="200">
            </el-empty>

            <!-- 卡片视图 -->
            <div v-else-if="viewMode === 'card'" class="room-card-container">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8" v-for="room in rooms" :key="room.id" class="room-card-item-wrapper">
                  <el-card class="room-card-item" shadow="hover" :body-style="{ padding: '0px' }">
                    <div class="room-card-header">
                      <h3 class="room-name"> {{room.name}}</h3>
                      <el-tag
                        :type="room.status == '1' ? 'success' : 'danger'"
                        size="small">
                        {{room.status == '1' ? '可预约' : '维护中'}}
                      </el-tag>
                    </div>
                    <div class="room-card-footer">
                      <el-button type="text" @click="viewRoomDetail(room.id)" icon="el-icon-info">详情</el-button>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>

            <!-- 列表视图 -->
            <div v-else class="room-table-container">
              <el-table
                :data="rooms"
                style="width: 100%"
                border
                stripe
                :row-class-name="tableRowClassName">
                <el-table-column
                  label="琴房"
                  width="150">
                  <template slot-scope="scope">
                    <div class="room-table-name">
                      <span>{{scope.row.buildingName}} {{scope.row.roomName}}</span>
                      <el-tag
                        :type="scope.row.status == '1' ? 'success' : 'danger'"
                        size="mini">
                        {{scope.row.status == '1' ? '可预约' : '已预约'}}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="roomType"
                  label="琴房类型"
                  width="120">
                  <template slot-scope="scope">
                    {{formatRoomType(scope.row.type)}}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="departmentId"
                  label="所属院系"
                  width="180">
                  <template slot-scope="scope">
                    {{ scope.row.departmentName }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="capacity"
                  label="容纳人数"
                  width="120">
                  <template slot-scope="scope">
                    {{scope.row.capacity}}人
                  </template>
                </el-table-column>
                <el-table-column
                  label="可用时间">
                  <template slot-scope="scope">
                    {{formatAvailableTime(scope.row.availableTimeSlots)}}
                  </template>
                </el-table-column>
                <el-table-column
                  label="设施"
                  width="180">
                  <template slot-scope="scope">
                    <el-tag
                      v-for="(facility, index) in scope.row.facilities"
                      :key="index"
                      size="mini"
                      type="info"
                      class="facility-tag"
                      effect="plain">
                      {{formatFacility(facility)}}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="160">
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      @click="viewRoomDetail(scope.row.id)"
                      type="text"
                      icon="el-icon-info">
                      详情
                    </el-button>
                    <el-button
                      size="mini"
                      type="primary"
                      icon="el-icon-date"
                      @click="bookRoom(scope.row.id)"
                      :disabled="!scope.row.available">
                      预约
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 分页器 -->
            <el-pagination
              v-if="rooms.length > 0"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pagination.pageNum"
              :page-sizes="[6, 12, 18, 24]"
              :page-size="pagination.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              class="pagination-container">
            </el-pagination>
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
import { roomApi } from '@/api/room';
import { buildingApi } from '@/api/building';
import { roomTypeApi } from '@/api/roomType';
import deptApi from '@/api/dept'
import dayjs from 'dayjs';
import FooterBar from '@/views/front/components/FooterBar.vue';

export default {
  name: 'RoomsIndex',
  components: {
    TopNavbar,
    FooterBar
  },
  data() {
    return {
      // 加载状态
      loading: false,

      // 筛选表单
      filterForm: {
        buildingId: '',
        roomTypeId: '',
        departmentId: '',
        capacity: '',
        minCapacity: null,
        maxCapacity: null,
        date: dayjs().format('YYYY-MM-DD'),
        timeRange: '',
        facilities: []
      },

      // 琴房列表
      rooms: [],

      // 视图模式：卡片/列表
      viewMode: 'card',

      // 分页
      pagination: {
        pageNum: 1,
        pageSize: 6
      },

      // 总记录数
      total: 0,

      // 教学楼选项
      buildingOptions: [
        { value: '', label: '全部' },
        { value: '1', label: '主教学楼' },
        { value: '2', label: '科技楼' },
        { value: '3', label: '图书馆' },
        { value: '4', label: '艺术楼' },
        { value: '5', label: '创新楼' }
      ],

      // 院系选项
      departmentOptions: [],

      // 琴房类型选项
      roomTypeOptions: [
        { value: '', label: '全部' },
        { value: 'classroom', label: '普通琴房', icon: 'el-icon-school' },
        { value: 'multimedia', label: '多媒体琴房', icon: 'el-icon-video-camera' },
        { value: 'lab', label: '实验室', icon: 'el-icon-cpu' },
        { value: 'meeting', label: '会议室', icon: 'el-icon-office-building' }
      ],

      // 容纳人数选项
      capacityOptions: [
        { value: '', label: '全部', min: null, max: null },
        { value: '0-30', label: '30人以下', min: 0, max: 30 },
        { value: '30-60', label: '30-60人', min: 30, max: 60 },
        { value: '60-100', label: '60-100人', min: 60, max: 100 },
        { value: '100-', label: '100人以上', min: 100, max: null }
      ],

      // 时间段选项
      timeRangeOptions: [
        { value: '', label: '全部' },
        { value: 'morning', label: '上午 (8:00-12:00)' },
        { value: 'afternoon', label: '下午 (13:00-17:00)' },
        { value: 'evening', label: '晚上 (18:00-22:00)' }
      ]
    };
  },
  created() {
    //获取院系列表
    this.fetchDepartments();
    //琴房类型
    this.fetchRoomTypes();

    this.fetchBuildings();
    // 获取琴房列表
    this.fetchRooms();
  },
  watch: {
    // 监听容量选择变化，设置minCapacity和maxCapacity
    'filterForm.capacity': {
      handler(val) {
        if (!val) {
          // 如果选择"全部"，则清空最小值和最大值
          this.filterForm.minCapacity = null;
          this.filterForm.maxCapacity = null;
        } else {
          // 根据选择设置最小值和最大值
          const selectedOption = this.capacityOptions.find(option => option.value === val);
          if (selectedOption) {
            this.filterForm.minCapacity = selectedOption.min;
            this.filterForm.maxCapacity = selectedOption.max;
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    //获取院系列表
    fetchDepartments() {
      this.loading = true;
      deptApi.list().then(response => {
        this.departmentOptions = response.data || [];
      });
    },
    fetchBuildings() {
      this.loading = true;
      this.buildingOptions = [];
    },
    //获取琴房类型
    fetchRoomTypes() {
      this.loading = true;
      roomTypeApi.getAllTypes().then(response => {
        this.roomTypeOptions = response.data || [];
      });
    },
    /**
     * 获取琴房列表
     */
    fetchRooms() {
      this.loading = true;

      // 构造查询参数
      const params = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        buildingId: this.filterForm.buildingId,
        roomTypeId: this.filterForm.roomTypeId,
        minCapacity: this.filterForm.minCapacity,
        maxCapacity: this.filterForm.maxCapacity,
        date: this.filterForm.date,
        departmentId: this.filterForm.departmentId,
        timeRange: this.filterForm.timeRange,
        facilities: this.filterForm.facilities.join(',')
      };

      // 调用API获取琴房列表
      roomApi.searchRooms(params)
        .then(response => {
          if (response && response.data) {
            this.rooms = response.data.rows || [];
            this.total = response.data.total || 0;
            console.log('获取到的琴房列表:', this.rooms);
          } else {
            this.rooms = [];
            this.total = 0;
            this.$message.error('获取琴房列表失败');
          }
        })
    //     .catch(error => {
    //       console.error('获取琴房列表出错', error);
    //       this.$message.error('获取琴房列表出错');
    //       this.rooms = [];
    //       this.total = 0;

    //       // 测试数据 - 实际开发时删除
    //       this.loadMockData();
    //     })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * 加载模拟数据（测试用）
     */
    loadMockData() {
      // 模拟数据
      this.rooms = [
        {
          id: 1,
          buildingName: '主教学楼',
          roomName: '301',
          roomType: 'classroom',
          capacity: 60,
          available: true,
          availableTimeSlots: '8:00-22:00',
          facilities: ['projector', 'computer']
        },
        {
          id: 2,
          buildingName: '科技楼',
          roomName: '205',
          roomType: 'lab',
          capacity: 45,
          available: true,
          availableTimeSlots: '13:00-17:00',
          facilities: ['projector', 'computer', 'experiment']
        },
        {
          id: 3,
          buildingName: '图书馆',
          roomName: '302',
          roomType: 'multimedia',
          capacity: 80,
          available: true,
          availableTimeSlots: '18:00-22:00',
          facilities: ['projector', 'computer', 'microphone']
        },
        {
          id: 4,
          buildingName: '创新楼',
          roomName: '401',
          roomType: 'meeting',
          capacity: 30,
          available: true,
          availableTimeSlots: '8:00-17:00',
          facilities: ['projector', 'computer', 'microphone']
        },
        {
          id: 5,
          buildingName: '艺术楼',
          roomName: '102',
          roomType: 'multimedia',
          capacity: 120,
          available: true,
          availableTimeSlots: '8:00-22:00',
          facilities: ['projector', 'computer', 'microphone']
        },
        {
          id: 6,
          buildingName: '主教学楼',
          roomName: '405',
          roomType: 'classroom',
          capacity: 90,
          available: false,
          availableTimeSlots: '13:00-17:00',
          facilities: ['projector']
        }
      ];
      this.total = this.rooms.length;
    },

    /**
     * 处理搜索
     */
    handleSearch() {
      this.pagination.pageNum = 1;
      this.fetchRooms();
    },

    /**
     * 重置筛选条件
     */
    resetFilter() {
      this.$refs.filterForm.resetFields();
      this.filterForm = {
        buildingId: '',
        roomTypeId: '',
        departmentId: '',
        capacity: '',
        minCapacity: null,
        maxCapacity: null,
        date: dayjs().format('YYYY-MM-DD'),
        timeRange: '',
        facilities: []
      }
      this.pagination.pageNum = 1;
      this.fetchRooms();
    },

    /**
     * 处理页码变化
     * @param {number} pageNum - 页码
     */
    handleCurrentChange(pageNum) {
      this.pagination.pageNum = pageNum;
      this.fetchRooms();
    },

    /**
     * 处理每页条数变化
     * @param {number} pageSize - 每页条数
     */
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize;
      this.pagination.pageNum = 1;
      this.fetchRooms();
    },

    /**
     * 表格行样式
     * @param {Object} row - 行数据
     * @returns {string} - 行样式名
     */
    tableRowClassName({ row }) {
      return row.available ? '' : 'unavailable-row';
    },

    /**
     * 查看琴房详情
     * @param {number} id - 琴房ID
     */
    viewRoomDetail(id) {
      this.$router.push(`/rooms/detail/${id}`);
    },

    /**
     * 预约琴房
     * @param {number} id - 琴房ID
     */
    bookRoom(id) {
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
      this.$router.push(`/reservations/create/${id}`);
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
        'network': '网络'
      };
      return facilityMap[facility] || facility;
    },

    /**
     * 格式化可用时间
     * @param {string} timeSlots - 可用时间段
     * @returns {string} - 格式化后的可用时间
     */
    formatAvailableTime(timeSlots) {
      if (!timeSlots) return '暂无可用时间';
      return timeSlots;
    }
  }
};
</script>

<style scoped>
.rooms-container {
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

.filter-card,
.room-list-card {
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
  font-weight: bold;
}

.search-btn {
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left i {
  margin-right: 5px;
}

.room-count {
  margin-left: 10px;
}

.room-card-container {
  margin-top: 20px;
}

.room-card-item-wrapper {
  margin-bottom: 20px;
}

.room-card-item {
  height: 100%;
  transition: all 0.3s;
}

.room-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.room-card-header {
  background-color: #f5f7fa;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-name {
  margin: 0;
  font-size: 16px;
}

.room-card-body {
  padding: 15px;
}

.room-info-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.room-info-item i {
  width: 20px;
  margin-right: 5px;
  color: #909399;
}

.room-facilities {
  margin-top: 10px;
}

.room-facilities .el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.room-card-footer {
  padding: 10px 15px;
  border-top: 1px solid #EBEEF5;
  display: flex;
  justify-content: space-between;
}

.loading-container {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.room-table-container {
  margin-top: 20px;
}

.room-table-name {
  display: flex;
  flex-direction: column;
}

.room-table-name .el-tag {
  margin-top: 5px;
  width: fit-content;
}

.facility-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.unavailable-row {
  background-color: #FFF8F8;
  color: #F56C6C;
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 10px;
  }

  .room-list-card,
  .filter-card {
    margin-bottom: 15px;
  }

  .header-right {
    display: none;
  }
}
</style>
