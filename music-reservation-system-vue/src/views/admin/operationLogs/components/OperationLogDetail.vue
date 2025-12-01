<template>
  <el-dialog
    title="操作日志详情"
    :visible.sync="dialogVisible"
    width="700px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="用户名">{{ operationLog.username }}</el-descriptions-item>
      <el-descriptions-item label="操作模块">{{ operationLog.operationModule }}</el-descriptions-item>
      <el-descriptions-item label="操作类型">{{ operationLog.operationType }}</el-descriptions-item>
      <el-descriptions-item label="操作描述">{{ operationLog.operationDesc }}</el-descriptions-item>
      <el-descriptions-item label="请求URL">{{ operationLog.requestUrl }}</el-descriptions-item>
      <el-descriptions-item label="请求方法">{{ operationLog.requestMethod }}</el-descriptions-item>
      <el-descriptions-item label="请求IP">{{ operationLog.requestIp }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="operationLog.status === 1 ? 'success' : 'danger'">
          {{ operationLog.status === 1 ? '成功' : '失败' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="操作时间">{{ formatDateTime(operationLog.createdAt) }}</el-descriptions-item>
      <el-descriptions-item label="请求参数">
        <pre class="code-block">{{ formatJson(operationLog.requestParam) }}</pre>
      </el-descriptions-item>
      <el-descriptions-item label="响应结果">
        <pre class="code-block">{{ formatJson(operationLog.responseResult) }}</pre>
      </el-descriptions-item>
      <el-descriptions-item v-if="operationLog.errorMsg" label="错误信息">
        <pre class="code-block error">{{ operationLog.errorMsg }}</pre>
      </el-descriptions-item>
    </el-descriptions>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { formatDate } from '@/utils/date'

export default {
  name: 'OperationLogDetail',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    operationLog: {
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
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) {
        return '--'
      }
      return formatDate(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss')
    },
    
    // 格式化JSON字符串
    formatJson(jsonStr) {
      if (!jsonStr) {
        return '--'
      }
      
      try {
        // 尝试解析JSON字符串并格式化
        const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        // 如果不是有效的JSON，则直接返回原始字符串
        return jsonStr
      }
    }
  }
}
</script>

<style scoped>
.code-block {
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
  font-size: 12px;
}

.error {
  background-color: #fef0f0;
  color: #f56c6c;
}
</style> 