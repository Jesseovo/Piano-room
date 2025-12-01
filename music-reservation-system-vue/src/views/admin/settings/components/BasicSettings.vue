<template>
  <div class="basic-settings">
    <el-form :model="formData" :rules="rules" ref="basicForm" label-width="120px" size="medium">
      <!-- 系统名称 -->
      <el-form-item label="系统名称" prop="systemName">
        <el-input v-model="formData.systemName" placeholder="请输入系统名称"></el-input>
        <div class="form-tip">设置显示在浏览器标签和系统顶部的名称</div>
      </el-form-item>
      
      <!-- LOGO上传 -->
      <el-form-item label="系统LOGO" prop="logo">
        <el-upload
          class="logo-uploader"
          :action="baseURL + '/upload'"
          :show-file-list="false"
          :on-success="uploadLogoSuccess"
          :before-upload="beforeLogoUpload"
          :headers="uploadHeaders"
        >
          <img v-if="formData.logo" :src="formData.logo" class="logo-image">
          <i v-else class="el-icon-plus logo-uploader-icon"></i>
        </el-upload>
        <div class="form-tip">建议上传正方形图片，大小不超过1MB</div>
      </el-form-item>
      
      <!-- 网站图标 -->
      <el-form-item label="网站图标" prop="favicon">
        <el-upload
          class="favicon-uploader"
          :action="baseURL + '/upload'"
          :show-file-list="false"
          :on-success="handleFaviconSuccess"
          :before-upload="beforeFaviconUpload"
          :headers="uploadHeaders"
        >
          <img v-if="formData.favicon" :src="formData.favicon" class="favicon-image">
          <i v-else class="el-icon-plus favicon-uploader-icon"></i>
        </el-upload>
        <div class="form-tip">建议上传ICO格式图标，将显示在浏览器标签栏</div>
      </el-form-item>

      <!-- 联系电话 -->
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话"></el-input>
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      
      <!-- 主题色 -->
      <!-- <el-form-item label="主题色" prop="primaryColor">
        <el-color-picker v-model="formData.primaryColor" show-alpha :predefine="predefineColors"></el-color-picker>
        <div class="form-tip">选择系统的主要配色，会应用到按钮、链接等元素上</div>
      </el-form-item> -->
      
      <!-- 系统描述 -->
      <el-form-item label="系统描述" prop="description">
        <el-input 
          type="textarea" 
          v-model="formData.description" 
          :rows="4"
          placeholder="请输入系统描述信息"
        ></el-input>
        <div class="form-tip">简要描述系统的用途和功能</div>
      </el-form-item>
      
      <!-- 底部版权信息 -->
      <el-form-item label="版权信息" prop="copyright">
        <el-input v-model="formData.copyright" placeholder="请输入版权信息"></el-input>
        <div class="form-tip">显示在页面底部的版权声明，支持HTML</div>
      </el-form-item>
      
      <!-- 保存按钮 -->
      <el-form-item>
        <el-button type="primary" @click="saveSettings" :loading="loading">保存设置</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { settingsApi } from '@/api/settings.js'
// import { getToken } from '@/utils/auth'


export default {
  name: 'BasicSettings',
  data() {
    return {
      loading: false,
      formData: {
        systemName: '琴房预约管理系统',
        logo: '',
        favicon: '',
        primaryColor: '#409EFF',
        description: '',
        copyright: '© 2023 琴房预约管理系统 版权所有',
        phone:'',
        email:''
      },
      rules: {
        systemName: [
          { required: true, message: '请输入系统名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ],
        description: [
          { max: 200, message: '不超过200个字符', trigger: 'blur' }
        ],
        copyright: [
          { required: true, message: '请输入版权信息', trigger: 'blur' }
        ]
      },
      predefineColors: [
        '#409EFF', // 蓝色
        '#67C23A', // 绿色
        '#E6A23C', // 黄色
        '#F56C6C', // 红色
        '#909399', // 灰色
        '#303133', // 深灰
        '#1890ff', // 浅蓝
        '#722ed1'  // 紫色
      ]
    }
  },
  computed: {
    uploadHeaders() {
      return {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }
  },
  created() {
    this.fetchSettings()
  },
  methods: {
    // 上传Logo成功
    uploadLogoSuccess(res) {
      if (res.code === 1) {
        this.formData.logo = res.data
        this.$message.success('Logo上传成功')
      }
    },
    // 获取当前设置
    fetchSettings() {
      this.loading = true
      
      settingsApi.getBasicSettings().then(response => {
        if (response.code === 1) {
          this.formData = response.data
        } else {
          this.$message.error(response.msg || '获取设置失败')
        }
      }).catch(error => {
        console.error('获取设置失败:', error)
        this.$message.error('获取设置失败: ' + error.message)
      }).finally(() => {
        this.loading = false
      })
    },
    
    // 保存设置
    saveSettings() {
      this.$refs.basicForm.validate(valid => {
        if (!valid) return
        
        this.loading = true

        const submitData = {
          systemName:'baseSetting',
          description: JSON.stringify(this.formData),
        }
        settingsApi.updateBasicSettings(submitData).then(response => {
          if (response.code === 1) {
            this.$message.success('保存成功')
            // 应用设置
            this.applySettings()
          } else {
            this.$message.error(response.msg || '保存失败')
          }
        }).catch(error => {
          console.error('保存设置失败:', error)
          this.$message.error('保存失败: ' + error.message)
        }).finally(() => {
          this.loading = false
        })
      })
    },
    
    // 应用设置到页面
    applySettings() {
      // 设置页面标题
      document.title = this.formData.systemName
      
      // 设置favicon
      if (this.formData.favicon) {
        let link = document.querySelector("link[rel~='icon']")
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = this.formData.favicon
      }
      
      // 应用主题色
      if (this.formData.primaryColor) {
        // 直接设置CSS变量 - 这是应用主题的关键
        // document.documentElement.style.setProperty('--primary-color', this.formData.primaryColor);
        console.log('主题色已更新:', this.formData.primaryColor);
      }
      
      // 如果有Vuex存储，也可以更新到Vuex
      // localStorage.setItem('basicSettings',JSON.stringify(this.formData))
      // this.$store.commit('SET_BASIC_SETTINGS', this.formData)
    },
    
    // 重置表单
    resetForm() {
      this.$refs.basicForm.resetFields()
      this.fetchSettings()
    },
    
    // LOGO上传相关方法
    handleLogoSuccess(res) {
      if (res.code === 1) {
        this.formData.logo = res.data
        this.$message.success('Logo上传成功')
      } else {
        this.$message.error(res.msg || 'Logo上传失败')
      }
    },
    
    beforeLogoUpload(file) {
      const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
      const isLt1M = file.size / 1024 / 1024 < 1
      
      if (!isImage) {
        this.$message.error('上传Logo只能是图片格式!')
      }
      
      if (!isLt1M) {
        this.$message.error('上传Logo大小不能超过 1MB!')
      }
      
      return isImage && isLt1M
    },
    
    // Favicon上传相关方法
    handleFaviconSuccess(res) {
      if (res.code === 1) {
        this.formData.favicon = res.data
        this.$message.success('图标上传成功')
      } else {
        this.$message.error(res.msg || '图标上传失败')
      }
    },
    
    beforeFaviconUpload(file) {
      const isValidType = ['image/x-icon', 'image/png', 'image/jpeg'].includes(file.type)
      const isLt100K = file.size / 1024 < 100
      
      if (!isValidType) {
        this.$message.error('上传图标只能是ICO/PNG/JPEG格式!')
      }
      
      if (!isLt100K) {
        this.$message.error('上传图标大小不能超过 100KB!')
      }
      
      return isValidType && isLt100K
    }
  }
}
</script>

<style scoped>
.basic-settings {
  padding: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.logo-uploader,
.favicon-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.logo-uploader:hover,
.favicon-uploader:hover {
  border-color: #409EFF;
}

.logo-uploader-icon,
.favicon-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.favicon-uploader-icon {
  width: 60px;
  height: 60px;
  line-height: 60px;
}

.logo-image {
  width: 120px;
  height: 120px;
  display: block;
}

.favicon-image {
  width: 60px;
  height: 60px;
  display: block;
}
</style> 