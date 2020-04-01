import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截
axios.interceptors.request.use(config => {
    // 为请求头对象，添加 Token 验证的 Authorization
    config.headers.Authorization = window.sessionStorage.getItem('token')
    // 必须 return通过 axios 请求拦截器添加 token，保证拥有获取数据的权限。
    return config
})
Vue.prototype.$ajax = axios
Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
