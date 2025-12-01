<template>
  <div class="feedback-form">
    <el-form ref="feedbackForm" :model="feedbackData" :rules="rules" label-width="100px">
      <el-form-item label="反馈类型" prop="feedbackType">
        <el-select v-model="feedbackData.feedbackType" placeholder="请选择反馈类型">
          <el-option label="功能异常(BUG)" value="BUG"></el-option>
          <el-option label="功能建议" value="SUGGESTION"></el-option>
          <el-option label="其他" value="OTHER"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="反馈内容" prop="content">
        <el-input
          type="textarea"
          v-model="feedbackData.content"
          placeholder="请详细描述您的问题或建议..."
          :rows="5"
        ></el-input>
      </el-form-item>
      <el-form-item label="联系方式" prop="contactInfo">
        <el-input
          v-model="feedbackData.contactInfo"
          placeholder="请留下您的邮箱或手机号，方便我们联系您"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">提交反馈</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { feedbackApi } from '@/api/feedback';

export default {
  name: 'FeedbackForm',
  data() {
    return {
      // 反馈表单数据
      feedbackData: {
        feedbackType: '',
        content: '',
        contactInfo: ''
      },
      // 表单验证规则
      rules: {
        feedbackType: [
          { required: true, message: '请选择反馈类型', trigger: 'change' }
        ],
        content: [
          { required: true, message: '请输入反馈内容', trigger: 'blur' },
          { min: 5, max: 500, message: '内容长度在 5 到 500 个字符', trigger: 'blur' }
        ],
        contactInfo: [
          { required: true, message: '请输入联系方式', trigger: 'blur' }
        ]
      },
      // 提交加载状态
      loading: false
    };
  },
  methods: {
    // 提交表单
    submitForm() {
      this.$refs.feedbackForm.validate(valid => {
        if (valid) {
          this.loading = true;
          feedbackApi
            .submitFeedback(this.feedbackData)
            .then(() => {
              this.$message.success('反馈提交成功！感谢您的反馈');
              this.resetForm();
              this.$emit('submit-success');
            })
            .catch(() => {
              this.$message.error('提交失败，请稍后重试');
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    // 重置表单
    resetForm() {
      this.$refs.feedbackForm.resetFields();
    }
  }
};
</script>

<style scoped>
.feedback-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style> 