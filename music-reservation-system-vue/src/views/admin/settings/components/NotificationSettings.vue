<template>
  <div class="notification-settings">
    <h3 class="section-title">通知设置</h3>
    <p class="section-desc">配置系统通知方式和模板，包括邮件通知和短信通知设置。</p>
    
    <el-tabs v-model="activeTab" type="card">
      <!-- 邮件通知选项卡 -->
      <el-tab-pane label="邮件通知设置" name="email">
        <email-settings ref="emailSettings" />
      </el-tab-pane>
      
      <!-- 短信通知选项卡 -->
      <el-tab-pane label="短信通知设置" name="sms">
        <div class="sms-settings">
          <el-form :model="smsForm" :rules="smsRules" ref="smsForm" label-width="120px" size="medium">
            <!-- 是否启用短信服务 -->
            <el-form-item label="启用短信" prop="enabled">
              <el-switch v-model="smsForm.enabled"></el-switch>
              <div class="form-tip">启用后系统将可以发送短信通知</div>
            </el-form-item>
            
            <!-- 短信服务商 -->
            <el-form-item label="短信服务商" prop="provider" :required="smsForm.enabled">
              <el-select v-model="smsForm.provider" placeholder="选择短信服务商" :disabled="!smsForm.enabled">
                <el-option label="阿里云" value="ALIYUN"></el-option>
                <el-option label="腾讯云" value="TENCENT"></el-option>
                <el-option label="华为云" value="HUAWEI"></el-option>
              </el-select>
              <div class="form-tip">选择短信服务提供商</div>
            </el-form-item>
            
            <!-- API密钥/Access Key -->
            <el-form-item label="Access Key" prop="accessKey" :required="smsForm.enabled">
              <el-input 
                v-model="smsForm.accessKey" 
                placeholder="短信服务API密钥" 
                :disabled="!smsForm.enabled"
                show-password
              ></el-input>
              <div class="form-tip">短信服务提供商的API密钥或Access Key</div>
            </el-form-item>
            
            <!-- Secret Key -->
            <el-form-item label="Secret Key" prop="secretKey" :required="smsForm.enabled">
              <el-input 
                v-model="smsForm.secretKey" 
                type="password" 
                placeholder="短信服务Secret Key" 
                :disabled="!smsForm.enabled"
                show-password
              ></el-input>
              <div class="form-tip">短信服务提供商的Secret Key</div>
            </el-form-item>
            
            <!-- 短信签名 -->
            <el-form-item label="短信签名" prop="signName" :required="smsForm.enabled">
              <el-input 
                v-model="smsForm.signName" 
                placeholder="短信签名" 
                :disabled="!smsForm.enabled"
              ></el-input>
              <div class="form-tip">已在服务商平台备案的短信签名</div>
            </el-form-item>
            
            <!-- 模板ID（预约提醒） -->
            <el-form-item label="预约提醒模板" prop="reservationTemplateId" :required="smsForm.enabled">
              <el-input 
                v-model="smsForm.reservationTemplateId" 
                placeholder="预约提醒模板ID" 
                :disabled="!smsForm.enabled"
              ></el-input>
              <div class="form-tip">用于发送预约成功或提醒的短信模板ID</div>
            </el-form-item>
            
            <!-- 模板ID（验证码） -->
            <el-form-item label="验证码模板" prop="verificationTemplateId" :required="smsForm.enabled">
              <el-input 
                v-model="smsForm.verificationTemplateId" 
                placeholder="验证码模板ID" 
                :disabled="!smsForm.enabled"
              ></el-input>
              <div class="form-tip">用于发送验证码的短信模板ID</div>
            </el-form-item>
            
            <!-- 测试手机号 -->
            <el-form-item label="测试手机号" prop="testPhone" v-if="smsForm.enabled">
              <el-input v-model="smsForm.testPhone" placeholder="用于接收测试短信的手机号"></el-input>
            </el-form-item>
            
            <!-- 测试按钮 -->
            <el-form-item v-if="smsForm.enabled">
              <el-button 
                type="primary" 
                @click="testSmsSettings"
                :loading="testing"
                :disabled="!smsForm.testPhone"
              >
                发送测试短信
              </el-button>
            </el-form-item>
            
            <!-- 保存按钮 -->
            <el-form-item>
              <el-button type="primary" @click="saveSmsSettings" :loading="loading">保存设置</el-button>
              <el-button @click="resetSmsForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      
      <!-- 通知模板选项卡 -->
      <el-tab-pane label="通知模板设置" name="templates">
        <div class="notification-templates">
          <el-alert
            title="通知模板用于定义系统发送的邮件和短信内容，支持变量替换。"
            type="info"
            :closable="false"
            show-icon
          ></el-alert>
          
          <el-table :data="templates" style="width: 100%; margin-top: 20px;">
            <el-table-column prop="name" label="模板名称" min-width="150"></el-table-column>
            <el-table-column prop="type" label="模板类型" min-width="100">
              <template #default="scope">
                <el-tag :type="scope.row.type === 'email' ? 'primary' : 'success'">
                  {{ scope.row.type === 'email' ? '邮件模板' : '短信模板' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="mini" type="text" @click="editTemplate(scope.row)">编辑</el-button>
                <el-button size="mini" type="text" @click="previewTemplate(scope.row)">预览</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 模板编辑对话框 -->
    <el-dialog title="编辑通知模板" v-model="templateDialogVisible" width="60%">
      <el-form :model="currentTemplate" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="currentTemplate.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="模板标题" v-if="currentTemplate.type === 'email'">
          <el-input v-model="currentTemplate.subject" placeholder="邮件标题"></el-input>
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input 
            v-if="currentTemplate.type === 'sms'" 
            type="textarea" 
            :rows="4" 
            v-model="currentTemplate.content" 
            placeholder="短信内容，注意字数限制"
          ></el-input>
          <div v-else>
            <el-alert
              title="支持的变量: {userName} - 用户名, {roomName} - 琴房名称, {startTime} - 开始时间, {endTime} - 结束时间"
              type="info"
              :closable="false"
              style="margin-bottom: 10px;"
            ></el-alert>
            <div class="editor-container" style="height: 300px; border: 1px solid #dcdfe6; border-radius: 4px;">
              <!-- 这里可以集成富文本编辑器 -->
              <el-input 
                type="textarea" 
                v-model="currentTemplate.content" 
                :rows="12" 
                placeholder="邮件内容，支持HTML"
              ></el-input>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 模板预览对话框 -->
    <el-dialog title="模板预览" v-model="previewDialogVisible" width="50%">
      <div v-if="currentTemplate.type === 'email'" class="email-preview">
        <div class="email-preview-header">
          <h3>{{ currentTemplate.subject }}</h3>
        </div>
        <div class="email-preview-body" v-html="previewContent"></div>
      </div>
      <div v-else class="sms-preview">
        <div class="sms-preview-content">
          {{ previewContent }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import EmailSettings from './EmailSettings.vue'
// 假设存在设置API
// import { settingsApi } from '@/api/settings.js'

export default {
  name: 'NotificationSettings',
  components: {
    EmailSettings
  },
  data() {
    // 验证手机号格式
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(value)) {
        callback(new Error('请输入正确的手机号格式'))
      } else {
        callback()
      }
    }
    
    return {
      activeTab: 'email',
      loading: false,
      testing: false,
      smsForm: {
        enabled: false,
        provider: 'ALIYUN',
        accessKey: '',
        secretKey: '',
        signName: '',
        reservationTemplateId: '',
        verificationTemplateId: '',
        testPhone: ''
      },
      smsRules: {
        accessKey: [
          { required: true, message: '请输入Access Key', trigger: 'blur' }
        ],
        secretKey: [
          { required: true, message: '请输入Secret Key', trigger: 'blur' }
        ],
        signName: [
          { required: true, message: '请输入短信签名', trigger: 'blur' }
        ],
        reservationTemplateId: [
          { required: true, message: '请输入预约提醒模板ID', trigger: 'blur' }
        ],
        verificationTemplateId: [
          { required: true, message: '请输入验证码模板ID', trigger: 'blur' }
        ],
        testPhone: [
          { validator: validatePhone, trigger: 'blur' }
        ]
      },
      templates: [
        { id: 1, name: '预约成功通知', type: 'email', description: '用户预约成功后发送的通知邮件', subject: '您的预约已成功', content: '<p>尊敬的{userName}：</p><p>您已成功预约{roomName}，时间为{startTime}至{endTime}。</p>' },
        { id: 2, name: '预约取消通知', type: 'email', description: '用户取消预约后发送的通知邮件', subject: '您的预约已取消', content: '<p>尊敬的{userName}：</p><p>您已取消{roomName}的预约，时间为{startTime}至{endTime}。</p>' },
        { id: 3, name: '预约提醒', type: 'sms', description: '预约开始前的短信提醒', content: '【琴房预约系统】尊敬的{userName}，提醒您已预约{roomName}，时间为{startTime}至{endTime}。' },
        { id: 4, name: '验证码通知', type: 'sms', description: '验证码短信', content: '【琴房预约系统】您的验证码为：{code}，有效期10分钟，请勿泄露给他人。' }
      ],
      currentTemplate: {},
      templateDialogVisible: false,
      previewDialogVisible: false,
      previewContent: ''
    }
  },
  created() {
    this.fetchNotificationSettings()
  },
  methods: {
    // 获取通知设置
    fetchNotificationSettings() {
      this.loading = true
      
      // 模拟API调用，实际应用中应替换为真实API
      setTimeout(() => {
        // settingsApi.getNotificationSettings().then(response => {
        //   if (response.success) {
        //     this.smsForm = {...this.smsForm, ...response.data.sms}
        //     this.templates = response.data.templates || this.templates
        //   }
        // }).catch(error => {
        //   this.$message.error('获取通知设置失败：' + error.message)
        // }).finally(() => {
        //   this.loading = false
        // })
        
        // 模拟数据
        this.smsForm = {
          enabled: true,
          provider: 'ALIYUN',
          accessKey: 'LTA*********',
          secretKey: '***************',
          signName: '琴房预约系统',
          reservationTemplateId: 'SMS_1234567',
          verificationTemplateId: 'SMS_7654321',
          testPhone: ''
        }
        
        this.loading = false
      }, 800)
    },
    
    // 保存短信设置
    saveSmsSettings() {
      // 如果没有启用短信服务，跳过验证直接保存
      if (!this.smsForm.enabled) {
        this.submitSmsSave();
        return;
      }
      
      this.$refs.smsForm.validate(valid => {
        if (!valid) return;
        this.submitSmsSave();
      })
    },
    
    // 提交保存短信设置
    submitSmsSave() {
      this.loading = true
      
      // 模拟API调用，实际应用中应替换为真实API
      setTimeout(() => {
        // settingsApi.updateNotificationSettings({
        //   sms: this.smsForm
        // }).then(response => {
        //   if (response.success) {
        //     this.$message.success('保存成功')
        //   } else {
        //     this.$message.error(response.message || '保存失败')
        //   }
        // }).catch(error => {
        //   this.$message.error('保存失败：' + error.message)
        // }).finally(() => {
        //   this.loading = false
        // })
        
        // 模拟成功
        this.$message.success('短信设置保存成功')
        this.loading = false
      }, 800)
    },
    
    // 测试短信设置
    testSmsSettings() {
      if (!this.smsForm.testPhone) {
        this.$message.warning('请输入测试接收手机号')
        return
      }
      
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(this.smsForm.testPhone)) {
        this.$message.error('请输入正确的手机号格式')
        return
      }
      
      this.testing = true
      
      // 模拟API调用，实际应用中应替换为真实API
      setTimeout(() => {
        // const testParams = {
        //   ...this.smsForm,
        //   templateId: this.smsForm.verificationTemplateId,
        //   params: {
        //     code: '123456'
        //   }
        // }
        // 
        // settingsApi.testSms(testParams).then(response => {
        //   if (response.success) {
        //     this.$message.success('测试短信发送成功，请查收')
        //   } else {
        //     this.$message.error(response.message || '测试短信发送失败')
        //   }
        // }).catch(error => {
        //   this.$message.error('测试短信发送失败：' + error.message)
        // }).finally(() => {
        //   this.testing = false
        // })
        
        // 模拟成功
        this.$message.success('测试短信已发送，请检查接收手机')
        this.testing = false
      }, 1500)
    },
    
    // 重置短信表单
    resetSmsForm() {
      this.$refs.smsForm.resetFields()
      this.fetchNotificationSettings()
    },
    
    // 保存所有设置
    saveSettings() {
      if (this.activeTab === 'email') {
        this.$refs.emailSettings.saveSettings()
      } else if (this.activeTab === 'sms') {
        this.saveSmsSettings()
      } else if (this.activeTab === 'templates') {
        this.$message.success('模板设置已保存')
      }
    },
    
    // 编辑模板
    editTemplate(template) {
      this.currentTemplate = JSON.parse(JSON.stringify(template)) // 深拷贝
      this.templateDialogVisible = true
    },
    
    // 保存模板
    saveTemplate() {
      // 实际应用中应该调用API保存模板
      const index = this.templates.findIndex(t => t.id === this.currentTemplate.id)
      if (index !== -1) {
        this.templates[index] = this.currentTemplate
      }
      
      this.$message.success('模板保存成功')
      this.templateDialogVisible = false
    },
    
    // 预览模板
    previewTemplate(template) {
      this.currentTemplate = JSON.parse(JSON.stringify(template)) // 深拷贝
      
      // 替换模板变量为示例值
      let content = template.content
        .replace(/{userName}/g, '张三')
        .replace(/{roomName}/g, '第一教学楼101')
        .replace(/{startTime}/g, '2023-05-20 14:00')
        .replace(/{endTime}/g, '2023-05-20 16:00')
        .replace(/{code}/g, '123456')
      
      this.previewContent = content
      this.previewDialogVisible = true
    }
  }
}
</script>

<style scoped>
.notification-settings {
  padding: 10px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 10px;
  color: #303133;
}

.section-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.sms-settings, .notification-templates {
  margin-top: 20px;
}

.email-preview, .sms-preview {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
}

.email-preview-header {
  border-bottom: 1px solid #dcdfe6;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.email-preview-body {
  min-height: 150px;
}

.sms-preview-content {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  font-family: 'PingFang SC', Arial, sans-serif;
}
</style> 