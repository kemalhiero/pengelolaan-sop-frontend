import { useAuthStore } from '@/stores/auth';

export default function getToken() {
    const authStore = useAuthStore();
    return authStore.rememberMe 
        ? localStorage.getItem('sipp-dsi-token')
        : sessionStorage.getItem('sipp-dsi-token');
};
