import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/faq',
      name: 'faq',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/Faq.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/About.vue')
    },
    {
      path: '/sop',
      name: 'sop',
      component: () => import('@/views/sop/SopSearch.vue')
    },
    {
      path: '/sop/detail',
      name: 'DetailSop',
      component: () => import('@/views/sop/SopDetail.vue')
    },
    {
      path: '/app',
      name: 'AuthenticatedApp',
      component: () => import('@/views/authenticated/Index.vue')
    },
    {
      path: '/test1',
      component: () => import('@/views/test/Test1.vue')
    },
    {
      path: '/test2',
      component: () => import('@/views/test/Test2.vue')
    },
  ]
})

export default router
