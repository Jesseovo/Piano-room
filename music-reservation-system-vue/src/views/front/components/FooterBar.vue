<!-- 页脚组件 -->
<template>
  <footer class="footer-component">
    <div class="container">
      <!-- 主要内容区 -->
      <div class="footer-content">
        <!-- 左侧：系统名称和描述 -->
        <div class="footer-section">
          <div class="footer-brand">{{ baseStetting?.systemName == null?'琴房预约系统':baseStetting?.systemName }}</div>
          <div class="footer-description">{{ baseStetting?.description?baseStetting?.description:'为师生提供便捷的琴房预约服务' }}</div>
        </div>
        
        <!-- 中间：快速链接 -->
        <div class="footer-section">
          <div class="footer-title">快速链接</div>
          <div class="quick-links">
            <router-link to="/">首页</router-link>
            <!-- 公告功能已移除 -->
            <router-link to="/rooms">琴房预约</router-link>
            <router-link to="/help">帮助中心</router-link>
            <router-link to="/about">关于我们</router-link>
          </div>
        </div>
        
        <!-- 右侧：联系我们 -->
        <div class="footer-section">
          <div class="footer-title">联系我们</div>
          <div class="contact-info">
            <div>{{ baseStetting?.email }}</div>
            <div>{{ baseStetting?.phone }}</div>
          </div>
        </div>
      </div>
      
      <!-- 底部：版权信息 -->
      <div class="copyright">
        <div v-if="baseStetting?.copyright">
          {{baseStetting?.copyright }}
        </div>
        <div v-else>
          © {{ currentYear }} 琴房预约系统. 保留所有权利.
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import {settingsApi} from '@/api/settings'
export default {
  name: 'FooterBar',
  data() {
    return {
      // 联系信息数据
      contactEmail: 'admin@school.edu',
      contactPhone: '123-456-7890',
      // 当前年份（动态获取）
      currentYear: new Date().getFullYear(),
      baseStetting: {
        systemName: "",
        logo: "",
        favicon: "",
        primaryColor: null,
        description: "",
        copyright: "",
        phone: "",
        email: ""
      }
    }
  },
  created() {
    this.getBasicSettings()
  },
  methods: {
    getBasicSettings() {
      settingsApi.getBasicSettings().then(response => {
        this.baseStetting = response.data;
      })
    },
  }

}
</script>

<style scoped>
.footer-component {
  background-color: #212529;
  color: #fff;
  padding: 2rem 0;
  margin-top: 1rem;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.footer-section {
  flex: 1;
  min-width: 200px;
  margin-bottom: 1.5rem;
  padding-right: 2rem;
}

.footer-brand {
  font-size: 1.2rem;
  font-weight: 500;
  color: #fff;
  margin-bottom: 0.5rem;
}

.footer-description {
  color: #adb5bd;
  font-size: 0.9rem;
}

.footer-title {
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-links a {
  color: #adb5bd;
  text-decoration: none;
  transition: color 0.2s;
}

.quick-links a:hover {
  color: #fff;
}

.contact-info {
  color: #adb5bd;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.copyright {
  color: #6c757d;
  font-size: 0.8rem;
  padding-top: 1.5rem;
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
  }
  
  .footer-section {
    margin-bottom: 2rem;
    padding-right: 0;
  }
}
</style> 