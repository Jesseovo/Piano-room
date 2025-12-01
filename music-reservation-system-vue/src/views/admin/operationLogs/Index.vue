<template>
  <div class="operation-logs-container">
    <h2 class="page-title">操作日志</h2>
    
    <!-- 筛选和搜索 -->
    <el-card shadow="hover" class="filter-container">
      <div slot="header" class="clearfix">
        <span>操作日志列表</span>
      </div>
      
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable></el-input>
        </el-form-item>
        <el-form-item label="操作模块">
          <el-input v-model="queryParams.operationModule" placeholder="请输入操作模块" clearable></el-input>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-input v-model="queryParams.operationType" placeholder="请输入操作类型" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="成功" :value="1"></el-option>
            <el-option label="失败" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作日志列表表格 -->
      <el-table
        v-loading="loading"
        :data="logsList"
        border
        stripe>
        <el-table-column prop="username" label="用户名" width="100" show-overflow-tooltip></el-table-column>
        <el-table-column prop="operationModule" label="操作模块" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="100" show-overflow-tooltip></el-table-column>
        <el-table-column prop="operationDesc" label="操作描述" width="180" show-overflow-tooltip></el-table-column>
        <el-table-column prop="requestMethod" label="请求方法" width="80" show-overflow-tooltip></el-table-column>
        <el-table-column prop="requestIp" label="IP地址" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button 
              size="mini" 
              type="primary" 
              icon="el-icon-view" 
              @click="handleView(scope.row)"
              title="查看详情">
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParams.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="queryParams.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 查看日志详情对话框 -->
    <operation-log-detail
      :visible.sync="detailDialogVisible"
      :operationLog="viewingLog"
    />
  </div>
</template>

<script>
import { operationLogApi } from '@/api/operationLog'
import OperationLogDetail from './components/OperationLogDetail'
import { formatDate } from '@/utils/date'

export default {
  name: 'OperationLogs',
  components: {
    OperationLogDetail
  },
  data() {
    return {
      // 加载状态
      loading: false,
      // 日志列表
      logsList: [],
      // 总记录数
      total: 0,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        username: '',
        operationModule: '',
        operationType: '',
        status: null,
        startTime: '',
        endTime: ''
      },
      // 详情对话框显示状态
      detailDialogVisible: false,
      // 当前查看的日志（用于详情）
      viewingLog: {}
    }
  },
  created() {
    this.getList()
  },
  watch: {
    dateRange(val) {
      if (val) {
        this.queryParams.startTime = val[0]
        this.queryParams.endTime = val[1]
      } else {
        this.queryParams.startTime = ''
        this.queryParams.endTime = ''
      }
    }
  },
  methods: {
    // 获取日志列表
    getList() {
      this.loading = true
      operationLogApi.getOperationLogPage(this.queryParams).then(response => {
        this.logsList = response.data.rows || []
        this.total = response.data.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    
    // 搜索
    handleSearch() {
      this.queryParams.page = 1
      this.getList()
    },
    
    // 重置查询条件
    resetQuery() {
      this.dateRange = []
      this.queryParams = {
        page: 1,
        pageSize: 10,
        username: '',
        operationModule: '',
        operationType: '',
        status: null,
        startTime: '',
        endTime: ''
      }
      this.getList()
    },
    
    // 每页大小变化
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.getList()
    },
    
    // 页码变化
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.getList()
    },
    
    // 查看日志详情
    handleView(row) {
      this.viewingLog = JSON.parse(JSON.stringify(row))
      this.detailDialogVisible = true
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) {
        return '--'
      }
      return formatDate(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss')
    }
  }
}
</script>

<style scoped>
.operation-logs-container {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style> 