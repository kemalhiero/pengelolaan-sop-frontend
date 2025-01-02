import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
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
      path: '/regist',
      component: () => import('@/views/Register.vue')
    },
    {
      path: '/forget-pw',
      component: () => import('@/views/ForgetPassword.vue')
    },
    {
      path: '/reset-pw',
      component: () => import('@/views/ResetPassword.vue')
    },
    {
      path: '/unauthorized',
      component: () => import('@/views/Unauthorized.vue')
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
      name: 'Assignment',
      component: () => import('@/views/authenticated/Assignment.vue'),
      meta: {
        requiresAuth: true,
        roles: ['penyusun']
      }
    },
    {
      path: '/assignment/:id',
      name: 'AssignmentDetail',
      component: () => import('@/views/authenticated/AssignmentDetail.vue'),
      meta: {
        requiresAuth: true,
        roles: ['penyusun']
      }
    },
    
    // App
    {
      path: '/app',
      name: 'AuthenticatedDashboard',
      component: () => import('@/views/authenticated/Dashboard.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kaprodi']
      }
    },
    {
      path: '/app/docs',
      name: 'SopDocs',
      component: () => import('@/views/authenticated/SopDocs.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kaprodi']
      }
    },
    {
      path: '/app/docs/:id',
      name: 'SopDocDetail',
      component: () => import('@/views/authenticated/SopDocsDetail.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kaprodi']
      }
    },
    {
      path: '/app/org',
      name: 'SopOrg',
      component: () => import('@/views/authenticated/SopOrg.vue'),
      meta: {
        requiresAuth: true,
        roles: ['kaprodi']
      }
    },
    {
      path: '/app/lawbasis',
      name: 'SopLawBasis',
      component: () => import('@/views/authenticated/SopLawBasis.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kaprodi']
      }
    },
    {
      path: '/app/lawtype',
      name: 'SopLawType',
      component: () => import('@/views/authenticated/SopLawType.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kaprodi']
      }
    },
    {
      path: '/app/propose',
      name: 'SopPropose',
      component: () => import('@/views/authenticated/SopPropose.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kaprodi']
      }
    },
    {
      path: '/app/propose-version/:id',
      name: 'SopProposeVersion',
      component: () => import('@/views/authenticated/SopProposeVersion.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kaprodi']
      }
    },
    {
      path: '/app/review',
      name: 'SopReview',
      component: () => import('@/views/authenticated/SopReview.vue'),
      // TODO lupa buat apa😔
    },
    {
      path: '/app/agreement',
      name: 'SopAgreement',
      component: () => import('@/views/authenticated/SopAgreement.vue'),
      // TODO lupa buat apa😔
    },
    {
      path: '/app/feedback',
      name: 'SopFeedback',
      component: () => import('@/views/authenticated/SopFeedback.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kaprodi']
      }
    },
    {
      path: '/app/guide',
      name: 'AppGuide',
      component: () => import('@/views/authenticated/Guide.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kaprodi']
      }
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
});

router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, hasRole } = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next('/login');
      return;
    }

    if (to.meta.roles && !hasRole(to.meta.roles)) {
      next('/unauthorized');
      return;
    }
  };

  next();
});

export default router;
