<template>
  <el-dialog title="院系详情" :visible="localVisible" @update:visible="handleVisibleChange" width="500px">
    <div class="detail-container">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="院系名称">{{ department.name }}</el-descriptions-item>
        <el-descriptions-item label="院系代码">{{ department.code }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(department.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(department.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { formatDate } from '@/utils/date'

export default {
  name: 'DepartmentDetail',
  props: {
    // 对话框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 院系对象
    department: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
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
    // 格式化日期时间
    formatDateTime(value) {
      if (!value) return ''
      return formatDate(new Date(value), 'yyyy-MM-dd HH:mm:ss')
    },
    
    // 处理对话框可见性变化
    handleVisibleChange(val) {
      this.$emit('update:visible', val)
    },
    
    // 关闭对话框
    closeDialog() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.detail-container {
  padding: 0 20px;
}
</style> 