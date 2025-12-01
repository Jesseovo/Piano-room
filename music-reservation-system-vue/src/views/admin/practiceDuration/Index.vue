<template>
  <div class="practice-duration-management">
    <el-card class="box-card" shadow="hover">
      <div slot="header" class="card-header">
        <h2><i class="el-icon-timer"></i> 时长管理</h2>
      </div>
      
      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryForm" :inline="true" class="search-form">
        <!-- <el-form-item label="预约日期" class="date-range-item">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            @change="handleDateChange"
            class="date-picker">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="琴房">
          <el-input 
            v-model="queryParams.roomName" 
            placeholder="琴房名称或编号" 
            clearable
            @keyup.enter.native="handleQuery"
            prefix-icon="el-icon-school">
          </el-input>
        </el-form-item> -->
        <el-form-item label="预约人">
          <el-input 
            v-model="queryParams.username"
            placeholder="预约人姓名" 
            clearable
            @keyup.enter.native="handleQuery"
            prefix-icon="el-icon-user">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery" class="search-btn">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 时长管理列表表格 -->
      <el-table
        v-loading="loading"
        :data="durationList"
        border
        stripe
        size="small"
        highlight-current-row
        style="width: 100%"
        class="duration-table">
        <el-table-column
          prop="id"
          label="ID"
          width="60"
          align="center">
        </el-table-column>
        <el-table-column
          prop="realName"
          label="姓名"
          min-width="90">
          <template slot-scope="scope">
            <div class="name-item">
              <i class="el-icon-user"></i>
              <span>{{ scope.row.realName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="phone"
          label="手机号"
          min-width="110">
          <template slot-scope="scope">
            <span>{{ scope.row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="grade"
          label="年级"
          width="80"
          align="center">
          <template slot-scope="scope">
            <span>{{ formatGrade(scope.row.grade) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="major"
          label="专业"
          min-width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.major || '-' }}</span>
          </template>
        </el-table-column> -->
        <el-table-column
          prop="roomNumber"
          label="琴房号"
          width="100"
          align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.roomNumber || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="roomName"
          label="琴房名称"
          min-width="120">
          <template slot-scope="scope">
            <div class="room-name">
              <i class="el-icon-school"></i>
              <span>{{ scope.row.roomName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="startTime"
          label="预约开始时间"
          min-width="160">
          <template slot-scope="scope">
            <div class="time-item">
              <i class="el-icon-time"></i>
              {{ formatDateTime(scope.row.startTime) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="endTime"
          label="预约结束时间"
          min-width="160">
          <template slot-scope="scope">
            <div class="time-item">
              <i class="el-icon-time"></i>
              {{ formatDateTime(scope.row.endTime) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="signStartTime"
          label="签到时间"
          min-width="160">
          <template slot-scope="scope">
            <div class="time-item">
              <i class="el-icon-check"></i>
              {{ scope.row.signStartTime ? formatDateTime(scope.row.signStartTime) : '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="signEndTime"
          label="签退时间"
          min-width="160">
          <template slot-scope="scope">
            <div class="time-item">
              <i class="el-icon-close"></i>
              {{ scope.row.signEndTime ? formatDateTime(scope.row.signEndTime) : '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="practiceDuration"
          label="练习时长"
          min-width="120"
          align="center">
          <template slot-scope="scope">
            <div class="duration-item">
              <i class="el-icon-timer"></i>
              <el-tag 
                :type="scope.row.signStartTime && scope.row.signEndTime ? 'success' : 'info'"
                size="small">
                {{ scope.row.practiceDuration || '未完成' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParams.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="queryParams.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { reservationApi } from '@/api/reservations';

export default {
  name: 'PracticeDurationManagement',
  data() {
    return {
      loading: false,
      durationList: [],
      total: 0,
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roomName: '',
        username: '',
        startDate: null,
        endDate: null
      }
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    /**
     * 加载数据
     */
    async loadData() {
      this.loading = true;
      try {
        const response = await reservationApi.getPracticeDurationList(this.queryParams);
        console.log(response)
        if (response.code === 1) {
          this.durationList = response.data.rows || [];
          this.total = response.data.total || 0;
        } else {
          this.$message.error(response.msg || '查询失败');
        }
      } catch (error) {
        console.error('查询时长管理列表失败:', error);
        this.$message.error('查询失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },

    /**
     * 查询
     */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.loadData();
    },

    /**
     * 重置查询
     */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        // roomName: '',
        username: ''
        // ,
        // startDate: null,
        // endDate: null
      };
      this.loadData();
    },

    /**
     * 日期范围变化
     */
    handleDateChange(value) {
      if (value && value.length === 2) {
        this.queryParams.startDate = value[0];
        this.queryParams.endDate = value[1];
      } else {
        this.queryParams.startDate = null;
        this.queryParams.endDate = null;
      }
    },

    /**
     * 分页大小变化
     */
    handleSizeChange(val) {
      this.queryParams.pageSize = val;
      this.loadData();
    },

    /**
     * 当前页变化
     */
    handleCurrentChange(val) {
      this.queryParams.pageNum = val;
      this.loadData();
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return '-';
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    /**
     * 格式化年级
     */
    formatGrade(grade) {
      if (!grade) return '';
      const gradeMap = {
        '1': '大一',
        '2': '大二',
        '3': '大三',
        '4': '大四',
        '5': '研一',
        '6': '研二',
        '7': '研三'
      };
      return gradeMap[grade] || grade;
    }
  }
};
</script>

<style scoped>
.practice-duration-management {
  padding: 20px;
}

.box-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.card-header h2 i {
  margin-right: 8px;
  color: #409EFF;
}

.search-form {
  margin-bottom: 20px;
}

.search-form .el-form-item {
  margin-bottom: 15px;
}

.date-range-item {
  width: 280px;
}

.search-btn {
  margin-left: 10px;
}

.duration-table {
  margin-top: 20px;
}

.name-item,
.room-name,
.time-item,
.duration-item {
  display: flex;
  align-items: center;
}

.name-item i,
.room-name i,
.time-item i,
.duration-item i {
  margin-right: 5px;
  color: #909399;
}

.duration-item .el-tag {
  margin-left: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
