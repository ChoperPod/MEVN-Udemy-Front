import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

// importamos la tienda
import store from '../store/index.js'

Vue.use(VueRouter)


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/notas',
      name: 'notas',
      component: () => import(/* webpackChunkName: "about" */ '../views/NotasView.vue'),
      meta: { requireAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "about" */ '../views/LoginView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const rutaProtegida = to.matched.some(record => record.meta.requireAuth);

  if (rutaProtegida && store.state.token === '') {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
