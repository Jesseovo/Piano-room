<template>
  <el-dialog
    title="维修记录详情"
    :visible.sync="dialogVisible"
    width="600px"
    @close="handleClose"
  >
    <el-descriptions class="margin-top" :column="1" border>
      <el-descriptions-item label="琴房名称">{{ maintenance.roomName }}</el-descriptions-item>
      <el-descriptions-item label="维修类型">{{ maintenance.maintenanceType }}</el-descriptions-item>
      <el-descriptions-item label="维修原因">{{ maintenance.reason || '无' }}</el-descriptions-item>
      <el-descriptions-item label="开始时间">{{ maintenance.startTime }}</el-descriptions-item>
      <el-descriptions-item label="结束时间">{{ maintenance.endTime }}</el-descriptions-item>
      <el-descriptions-item label="维修状态">
        <el-tag :type="getStatusType(maintenance.status)">{{ maintenance.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ maintenance.createdAt }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ maintenance.updatedAt }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ maintenance.remark || '无' }}</el-descriptions-item>
    </el-descriptions>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关 闭</el-button>
      <el-button type="primary" @click="handleEdit">编 辑</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'MaintenanceDetails',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    maintenance: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    }
  },
  methods: {
    // 获取状态类型
    getStatusType(status) {
      const statusMap = {
        '未开始': 'warning',
        '进行中': 'primary',
        '已完成': 'success',
        '已取消': 'info'
      }
      return statusMap[status] || ''
    },
    // 处理关闭
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    // 处理编辑
    handleEdit() {
      // 确保roomId字段存在且正确
      const editData = { ...this.maintenance }
      if (!editData.roomId && editData.id) {
        editData.roomId = editData.id
      }
      this.$emit('edit', editData)
      this.handleClose()
    }
  }
}
</script>

<style scoped>
.el-descriptions {
  margin-bottom: 20px;
}
</style> 