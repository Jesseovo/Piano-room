<template>
  <div class="room-management">
    <div class="page-header">
      <h2>琴房管理</h2>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="hover">
      <div slot="header" class="clearfix">
        <span>琴房列表</span>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddRoomDialog"
          style="float: right;">
          添加琴房
        </el-button>
      </div>


      <!-- 琴房列表表格 -->
      <el-table
        v-loading="loading"
        :data="roomList"
        border
        style="width: 100%">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="roomNumber"
          label="琴房号"
          width="120">
        </el-table-column>
        <el-table-column
          prop="name"
          label="名称"
          width="180">
        </el-table-column>
        <el-table-column
          prop="capacity"
          label="容量"
          width="100">
          <template slot-scope="scope">
            {{ scope.row.capacity }}人
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200">
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
              type="warning"
              icon="el-icon-s-tools"
              @click="handleMaintenance(scope.row)"
              title="维护">
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

    <!-- 添加/编辑琴房对话框 -->
    <room-form
      :visible.sync="roomFormVisible"
      :room="currentRoom"
      :is-add="isAdd"
      @success="handleFormSuccess">
    </room-form>

    <!-- 琴房维护对话框 -->
    <maintenance-form
      :visible.sync="maintenanceFormVisible"
      :room="currentRoom"
      @success="handleFormSuccess">
    </maintenance-form>
  </div>
</template>

<script>
import { roomApi } from '@/api/room'
import { roomTypeApi } from '@/api/roomType'
import RoomForm from './components/RoomForm'
import MaintenanceForm from './components/MaintenanceForm'

export default {
  name: 'RoomManagement',
  components: {
    RoomForm,
    MaintenanceForm
  },
  data() {
    return {
      buildingList: [],
      roomTypeList: [],
      // 加载状态
      loading: false,
      // 琴房列表
      roomList: [],
      // 总记录数
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10
      },
      // 表单对话框可见性
      roomFormVisible: false,
      // 维护表单对话框可见性
      maintenanceFormVisible: false,
      // 当前操作的琴房
      currentRoom: {},
      // 是否为添加操作
      isAdd: false
    }
  },
  created() {
    this.fetchBuildingList()
    this.fetchRoomList()
    this.fetchRoomTypeList()
  },
  methods: {
    fetchBuildingList() {
      this.buildingList = []
    },

    // 获取琴房类型列表
    fetchRoomTypeList() {
      roomTypeApi.list().then(res => {
       if(res.code === 1 && res.data){
        this.roomTypeList = res.data.list
        return;
       }
       this.$message.error('获取琴房类型列表失败')
      })
    },

    // 获取琴房列表
    fetchRoomList() {
      this.loading = true
      roomApi.list(this.queryParams).then(res => {
        // 判断返回的数据结构
        if (res.code === 1 && res.data) {
          this.roomList = res.data.rows
          this.total = res.data.total ||  0
        } else {
          this.roomList = []
          this.total = 0
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
        this.$message.error('获取琴房列表失败')
        this.roomList = []
        this.total = 0
      })
    },


    // 每页条数改变
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.fetchRoomList()
    },

    // 页码改变
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      this.fetchRoomList()
    },

    // 显示添加琴房对话框
    showAddRoomDialog() {
      this.isAdd = true
      this.currentRoom = {
        status: 1 // 默认状态为可用
      }
      this.roomFormVisible = true
    },

    // 显示编辑琴房对话框
    handleEdit(row) {
      this.isAdd = false
      this.loading = true
      roomApi.getById(row.id).then(res => {
        this.loading = false
        // 处理后端返回的数据
        if (res.code === 1 && res.data) {
          this.currentRoom = res.data
        } else {
          this.currentRoom = res
        }
        this.roomFormVisible = true
      }).catch(error => {
        this.loading = false
        this.$message.error('获取琴房详情失败: ' + (error.message || '未知错误'))
      })
    },

    // 显示维护对话框
    handleMaintenance(row) {
      // console.log('Opening maintenance dialog for room:', row); // 调试日志
      this.currentRoom = JSON.parse(JSON.stringify(row)); // 深拷贝防止影响原始数据
      this.maintenanceFormVisible = true;
    },

    // 删除琴房
    handleDelete(row) {
      this.$confirm('确认删除琴房 ' + row.name + '？删除后无法恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        roomApi.deleteById(row.id).then(res => {
          this.loading = false
          // 判断删除是否成功
          if (res.code === 1) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.fetchRoomList()
          } else {
            this.$message.error(res.msg || '删除失败')
          }
        }).catch(error => {
          this.loading = false
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        })
      }).catch(() => {
        // 取消删除
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    // 表单提交成功
    handleFormSuccess() {
      this.fetchRoomList()
    },

    // 格式化琴房类型
    formatRoomType(roomTypeId) {
      const typeMap = this.roomTypeList.find(item => item.id == roomTypeId)
      return typeMap ? typeMap.typeName : '未知'
    },

    // 获取设施列表
    getFacilitiesList(facilities) {
      if (!facilities) return []
      return facilities.split(',')
    },

    // 格式化状态
    formatStatus(status) {
      const statusMap = {
        0: '已禁用',
        1: '可用',
        2: '维护中'
      }
      return statusMap[status] || '未知'
    },

    // 获取状态类型（用于标签颜色）
    getStatusType(status) {
      const typeMap = {
        0: 'danger',
        1: 'success',
        2: 'warning'
      }
      return typeMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.room-management {
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

.facility-tag {
  margin-right: 5px;
}
</style>
