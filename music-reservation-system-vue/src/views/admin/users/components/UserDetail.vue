<template>
  <el-dialog 
    title="用户详情" 
    :visible.sync="localVisible" 
    width="550px" 
    @update:visible="handleVisibleChange"
    center>
    <div class="user-detail-container" v-loading="loading">
      <div class="user-avatar">
        <el-avatar :size="100" icon="el-icon-user-solid" :src="user.avatarUrl"></el-avatar>
      </div>
      
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ user.realName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone }}</el-descriptions-item>
        <el-descriptions-item label="用户类型">
          <el-tag :type="userTypeTag(user.userType)">{{ formatUserType(user.userType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="user.status === 1 ? 'success' : 'danger'">
            {{ user.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">
          {{ formatDateTime(user.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后登录时间" :span="2">
          {{ formatDateTime(user.lastLoginTime) || '暂无登录记录' }}
        </el-descriptions-item>
        <el-descriptions-item 
          label="所属院系" 
          :span="2" 
          v-if="user.userType !== 'ADMIN' && user.departmentName">
          {{ user.departmentName }}
        </el-descriptions-item>
      </el-descriptions>
      
      <el-descriptions title="其他信息" :column="1" border style="margin-top: 20px" v-if="user.userType !== 'ADMIN'">
        <el-descriptions-item label="预约次数">{{ user.reservationCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="取消次数">{{ user.cancelCount || 0 }}</el-descriptions-item>
      </el-descriptions>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'UserDetail',
  props: {
    // 对话框可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 用户对象
    user: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 加载状态
      loading: false,
      // 本地可见性控制
      localVisible: false
    }
  },
  watch: {
    // 监听外部visible变化，更新本地状态
    visible: {
      handler(newVal) {
        this.localVisible = newVal
      },
      immediate: true
    }
  },
  methods: {
    // 处理对话框可见性变化
    handleVisibleChange(val) {
      this.$emit('update:visible', val)
    },
    
    // 关闭对话框
    closeDialog() {
      this.$emit('update:visible', false)
    },
    
    // 格式化时间
    formatDateTime(datetime) {
      if (!datetime) return '--'
      
      // 如果是字符串，直接返回
      if (typeof datetime === 'string') {
        return datetime
      }
      
      // 如果是Date对象，格式化为字符串
      if (datetime instanceof Date) {
        const year = datetime.getFullYear()
        const month = (datetime.getMonth() + 1).toString().padStart(2, '0')
        const day = datetime.getDate().toString().padStart(2, '0')
        const hours = datetime.getHours().toString().padStart(2, '0')
        const minutes = datetime.getMinutes().toString().padStart(2, '0')
        const seconds = datetime.getSeconds().toString().padStart(2, '0')
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }
      
      return '--'
    },
    
    // 格式化用户类型
    formatUserType(type) {
      switch (type) {
        case 'admin': return '管理员'
        case 'teacher': return '教师'
        case 'student': return '学生'
        default: return '未知'
      }
    },
    
    // 获取用户类型标签样式
    userTypeTag(type) {
      switch (type) {
        case 'ADMIN': return 'danger'
        case 'TEACHER': return 'warning'
        case 'STUDENT': return 'success'
        default: return 'info'
      }
    }
  }
}
</script>

<style scoped>
.user-detail-container {
  padding: 0 20px;
}

.user-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.el-descriptions {
  margin-bottom: 20px;
}
</style> 