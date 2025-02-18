import { useAuthStore } from '@/stores/auth';

/**
 * Retrieves the authentication token from either localStorage or sessionStorage
 * based on the user's preference.
 *
 * @returns {string|null} The authentication token if it exists, otherwise null.
 */
export default function getToken() {
    const authStore = useAuthStore();
    return authStore.rememberMe 
        ? localStorage.getItem('sipp-dsi-token')
        : sessionStorage.getItem('sipp-dsi-token');
};
