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
      path: '/profile',
      component: () => import('@/views/authenticated/UserProfile.vue'),
      meta: {
        requiresAuth: true,
      }
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
        roles: ['penyusun', 'pj', 'kadep']
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
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/docs',
      name: 'SopDocs',
      component: () => import('@/views/authenticated/SopDocs.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/docs/:id',
      name: 'SopDocDetail',
      component: () => import('@/views/authenticated/SopDocsDetail.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/implementer',
      name: 'SopImplementer',
      component: () => import('@/views/authenticated/SopImplementer.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/org',
      name: 'SopOrg',
      component: () => import('@/views/authenticated/SopOrg.vue'),
      meta: {
        requiresAuth: true,
        roles: ['kadep']
      }
    },
    {
      path: '/app/law',
      redirect: { name: 'SopLawBasis' }
    },
    {
      path: '/app/law/basis',
      name: 'SopLawBasis',
      component: () => import('@/views/authenticated/SopLawBasis.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/law/type',
      name: 'SopLawType',
      component: () => import('@/views/authenticated/SopLawType.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/propose',
      name: 'SopPropose',
      component: () => import('@/views/authenticated/SopPropose.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/propose-version/:id',
      name: 'SopProposeVersion',
      component: () => import('@/views/authenticated/SopProposeVersion.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
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
      path: '/app/role',
      redirect: { name: 'KaprodiManagement' }
    },
    {
      path: '/app/role/hod',
      name: 'KaprodiManagement',
      component: () => import('@/views/authenticated/roleManagement/DepartementHead.vue'),
      meta: {
        requiresAuth: true,
        roles: ['kadep']
      }
    },
    {
      path: '/app/role/pic',
      name: 'PicManagement',
      component: () => import('@/views/authenticated/roleManagement/PiC.vue'),
      meta: {
        requiresAuth: true,
        roles: ['kadep']
      }
    },
    {
      path: '/app/role/drafter',
      name: 'DrafterManagement',
      component: () => import('@/views/authenticated/roleManagement/Drafter.vue'),
      meta: {
        requiresAuth: true,
        roles: ['kadep', 'pj']
      }
    },
    {
      path: '/app/feedback',
      name: 'SopFeedback',
      component: () => import('@/views/authenticated/SopFeedback.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/guide',
      name: 'AppGuide',
      component: () => import('@/views/authenticated/Guide.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
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
