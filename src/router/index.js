import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
Vue.use(VueRouter)

const routes = [
  {
	path: '/',
	redirect: '/login'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})
// router.beforeEach 路由守卫现在是异步工作的，并且携带一个 next 函数作为其第三个参数。
router.beforeEach(function (to, from, next) {
  if (to.path === '/home') {
    next();
	const tokenStr = window.sessionStorage.getItem('token');
	if (!tokenStr) {
		next('/login');
	}
  } else {
    next();
  }
})

export default router
