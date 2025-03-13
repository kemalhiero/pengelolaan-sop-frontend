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

    // Authenticated
    {
      path: '/assignment',
      name: 'Assignment',
      component: () => import('@/views/authenticated/assignment/Assignment.vue'),
      meta: {
        requiresAuth: true,
        roles: ['penyusun', 'pj', 'kadep']
      }
    },
    {
      path: '/assignment/:id',
      name: 'AssignmentDetail',
      component: () => import('@/views/authenticated/assignment/AssignmentDetail.vue'),
      meta: {
        requiresAuth: true,
        roles: ['penyusun', 'pj', 'kadep']
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
      component: () => import('@/views/authenticated/docs/SopDocs.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/docs/:id',
      name: 'SopDocDetail',
      component: () => import('@/views/authenticated/docs/SopDocsDetail.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/docs/draft/:id',
      name: 'SopDraftDetail',
      component: () => import('@/views/authenticated/docs/SopDraftDetail.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/docs/legal/:id',
      name: 'SopLegalization',
      component: () => import('@/views/authenticated/docs/SopLegalization.vue'),
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
      component: () => import('@/views/authenticated/law/SopLawBasis.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/law/type',
      name: 'SopLawType',
      component: () => import('@/views/authenticated/law/SopLawType.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/propose',
      name: 'SopPropose',
      component: () => import('@/views/authenticated/docs/SopPropose.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/propose-version/:id',
      name: 'SopProposeVersion',
      component: () => import('@/views/authenticated/docs/SopProposeVersion.vue'),
      meta: {
        requiresAuth: true,
        roles: ['pj', 'kadep']
      }
    },
    {
      path: '/app/role',
      redirect: { name: 'KaprodiManagement' }
    },
    {
      path: '/app/role/hod',
      name: 'KaprodiManagement',
      component: () => import('@/views/authenticated/role/DepartementHead.vue'),
      meta: {
        requiresAuth: true,
        roles: ['kadep']
      }
    },
    {
      path: '/app/role/pic',
      name: 'PicManagement',
      component: () => import('@/views/authenticated/role/PiC.vue'),
      meta: {
        requiresAuth: true,
        roles: ['kadep', 'pj']
      }
    },
    {
      path: '/app/role/drafter',
      name: 'DrafterManagement',
      component: () => import('@/views/authenticated/role/Drafter.vue'),
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
