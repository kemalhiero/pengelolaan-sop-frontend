import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView
    },
    {
      path: '/faq',
      component: () => import('@/views/Faq.vue')
    },
    {
      path: '/login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/sop',
      component: () => import('@/views/sop/SopSearch.vue')
    },
    {
      path: '/sop/detail',
      name: 'DetailSop',
      component: () => import('@/views/sop/SopDetail.vue')
    },
    {
      path: '/sop/download',
      name: 'DownloadSop',
      component: () => import('@/views/sop/SopDownload.vue')
    },
    
    // Authenticated
    {
      path: '/assignment',
      component: () => import('@/views/authenticated/Assignment.vue')
    },
    {
      path: '/assignment/detail',
      component: () => import('@/views/authenticated/AssignmentDetail.vue')
    },

    // App
    {
      path: '/app',
      name: 'AuthenticatedDashboard',
      component: () => import('@/views/authenticated/Dashboard.vue')
    },
    {
      path: '/app/docs',
      name: 'SopDocs',
      component: () => import('@/views/authenticated/SopDocs.vue')
    },
    {
      path: '/app/docs/detail',
      name: 'SopDocDetail',
      component: () => import('@/views/authenticated/SopDocsDetail.vue')
    },
    {
      path: '/app/org',
      name: 'SopOrg',
      component: () => import('@/views/authenticated/SopOrg.vue')
    },
    {
      path: '/app/lawbasis',
      name: 'SopLawBasis',
      component: () => import('@/views/authenticated/SopLawBasis.vue')
    },
    {
      path: '/app/lawtype',
      name: 'SopLawType',
      component: () => import('@/views/authenticated/SopLawType.vue')
    },
    {
      path: '/app/propose',
      name: 'SopPropose',
      component: () => import('@/views/authenticated/SopPropose.vue')
    },
    {
      path: '/app/propose-version',
      name: 'SopProposeVersion',
      component: () => import('@/views/authenticated/SopProposeVersion.vue')
    },
    {
      path: '/app/review',
      name: 'SopReview',
      component: () => import('@/views/authenticated/SopReview.vue')
    },
    {
      path: '/app/agreement',
      name: 'SopAgreement',
      component: () => import('@/views/authenticated/SopAgreement.vue')
    },
    {
      path: '/app/feedback',
      name: 'SopFeedback',
      component: () => import('@/views/authenticated/SopFeedback.vue')
    },
    {
      path: '/app/guide',
      name: 'AppGuide',
      component: () => import('@/views/authenticated/Guide.vue')
    },

    // Test
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
