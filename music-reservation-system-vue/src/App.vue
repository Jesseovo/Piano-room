<template>
  <div id="app">
   
    <router-view/>
    <!-- <FooterBar /> -->
  </div>
</template>
<script>
import {settingsApi} from '@/api/settings'
import FooterBar from '@/views/front/components/FooterBar'
export default {
  components: {
    FooterBar
  },
  created() {
     this.getBasicSettings()
  },
  methods: {
    getBasicSettings() {
      settingsApi.getBasicSettings().then(response => {
        // 检查响应数据格式
        let data = response.data;
        
        // 如果data是字符串，尝试解析成对象
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error('解析设置数据失败:', e);
          }
        }

        // 设置页面标题
        if (data.systemName) {
          document.title = data?.systemName || '智慧琴房预约系统';
        }
        
        // 设置favicon
        if (data.favicon) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.favicon;
        }
        
        // 应用主题色
        if (data.primaryColor) {
          // 直接设置CSS变量
          // document.documentElement.style.setProperty('--primary-color', data.primaryColor);
          console.log('应用主题色:', data.primaryColor);
        }
      }).catch(err => {
        console.error('获取基本设置失败:', err);
      });
    }
  }
}
</script>
<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: auto;
}

/* 定义默认主题色变量 */
/* :root {
  --primary-color: #409EFF;
} */

/* 应用主题色到Element UI组件 */
/* .el-button--primary { */
  /* background-color: var(--primary-color) !important; */
  /* border-color: var(--primary-color) !important; */
/* } */

/* .el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: var(--primary-color) !important;
}

.el-checkbox__input.is-checked .el-checkbox__inner,
.el-radio__input.is-checked .el-radio__inner {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
}

.el-switch.is-checked .el-switch__core {
  border-color: var(--primary-color) !important;
  background-color: var(--primary-color) !important;
} */
</style>
