// 皮埃诺预约系统 · Piano Room Booking System
// 作者：Jesse（刘家鑫） 联系方式：13709406630
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 全局样式（含中文字体、乱码修复、CSS变量）
import './assets/styles/global.css'
// Y2K 千禧年风格主题
import './assets/styles/y2k-theme.css'

const app = createApp(App)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
// 使用中文语言包，彻底解决 Element Plus 组件内的中文显示
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
})

app.mount('#app')
