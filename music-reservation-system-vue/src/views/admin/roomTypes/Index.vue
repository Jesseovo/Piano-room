<template>
  <div class="room-type-management">
    <div class="page-header">
      <h2>琴房类型管理</h2>
    </div>
    
    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span>琴房类型列表</span>
        <el-button 
          type="primary" 
          icon="el-icon-plus" 
          @click="showAddRoomTypeDialog" 
          style="float: right;">
          添加琴房类型
        </el-button>
      </div>
      
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="类型名称">
          <el-input 
            v-model="queryParams.typeName" 
            placeholder="类型名称" 
            clearable
         >
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">查询</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 琴房类型列表表格 -->
      <el-table
        v-loading="loading"
        :data="roomTypeList"
        border
        style="width: 100%">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="id"
          label="ID"
          width="80">
        </el-table-column>
        <el-table-column
          prop="typeName"
          label="类型名称"
          width="180">
        </el-table-column>
        <el-table-column
          prop="description"
          label="描述"
          :show-overflow-tooltip="true">
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="150">
          <template slot-scope="scope">
            <el-button 
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
              title="编辑">
            </el-button>
            <el-button 
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              title="删除">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="pagination">
      </el-pagination>
    </el-card>
    
    <!-- 添加/编辑琴房类型对话框 -->
    <room-type-form 
      :visible.sync="roomTypeFormVisible" 
      :room-type="currentRoomType" 
      :is-add="isAdd"
      @success="handleFormSuccess">
    </room-type-form>
  </div>
</template>

<script>
import { roomTypeApi } from '@/api/roomType'
import RoomTypeForm from './components/RoomTypeForm'
import dayjs from 'dayjs'

export default {
  name: 'RoomTypeManagement',
  components: {
    RoomTypeForm
  },
  data() {
    return {
      // 加载状态
      loading: false,
      
      // 琴房类型列表
      roomTypeList: [],
      
      // 总记录数
      total: 0,
      
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        typeName: ''
      },
      
      // 弹窗显示状态
      roomTypeFormVisible: false,
      
      // 当前操作的琴房类型对象
      currentRoomType: {},
      
      // 是否为添加操作
      isAdd: true
    }
  },
  created() {
    this.fetchRoomTypeList()
  },
  methods: {
    // 获取琴房类型列表
    fetchRoomTypeList() {
      this.loading = true
      roomTypeApi.list(this.queryParams).then(response => {
        // console.log('获取琴房类型列表', response);
        
        if (response && response.code == 1) {
          this.roomTypeList = response.data.list || []
          this.total = response.data.total || 0
        } else {
          this.$message.error(response.msg || '获取琴房类型列表失败')
          this.roomTypeList = []
          this.total = 0
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
        this.$message.error('获取琴房类型列表出错')
        this.roomTypeList = []
        this.total = 0
      })
    },
    
    // 显示添加琴房类型对话框
    showAddRoomTypeDialog() {
      this.isAdd = true
      this.currentRoomType = {
        typeName: '',
        description: ''
      }
      this.roomTypeFormVisible = true
    },
    
    // 处理编辑操作
    handleEdit(row) {
      this.isAdd = false
      this.currentRoomType = JSON.parse(JSON.stringify(row))
      this.roomTypeFormVisible = true
    },
    
    // 处理删除操作
    handleDelete(row) {
      this.$confirm(`确认删除琴房类型 "${row.typeName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        roomTypeApi.deleteById(row.id).then(response => {
          if (response && response.code == 1) {
            this.$message.success('删除成功')
            this.fetchRoomTypeList()
          } else {
            this.$message.error(response.msg || '删除失败')
          }
        }).catch(() => {
          this.$message.error('删除出错')
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    
    // 处理表单提交成功
    handleFormSuccess() {
      this.fetchRoomTypeList()
    },
    
    // 处理查询操作
    handleQuery() {
      this.queryParams.pageNum = 1
      this.fetchRoomTypeList()
      // console.log('查询参数', this.queryParams);
    },
    
    // 重置查询参数
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        typeName: ''
      }
      this.fetchRoomTypeList()
    },
    
    // 处理每页条数变化
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.fetchRoomTypeList()
    },
    
    // 处理页码变化
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.fetchRoomTypeList()
    },
    
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) {
        return ''
      }
      return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>

<style scoped>
.room-type-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
</style> 