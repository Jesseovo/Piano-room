import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/styles/transition.css';
import permission from './directives/permission'



Vue.config.productionTip = false


// 注册权限指令
Vue.directive('permission', permission)


Vue.use(ElementUI)  
// Vue.prototype.baseURL = 'http://localhost:8080'
Vue.prototype.baseURL = 'http://localhost:8099'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
