import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import getToken from '@/utils/getToken';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(null);
  const user = ref({
    email: '',
    role: ''
  });

  const rememberMe = ref(false);
  const initializeRememberMe = () => {
    // Mengambil nilai dari localStorage, defaultnya false
    rememberMe.value = localStorage.getItem('rememberMe') === 'true'
  };

  // Mengambil data dari localStorage saat inisialisasi
  const initializeAuth = () => {
    const savedToken = getToken();
    if (savedToken) {
      try {
        token.value = savedToken;
        const decoded = jwtDecode(savedToken);

        user.value.email = decoded.email;
        user.value.role = decoded.role;
      } catch (error) {
        console.error('error saat inisialisasi sesi', error);
      }
    } else {
      console.log('token kosong');
    }
  };

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role);
  const userEmail = computed(() => user.value?.email);
  const hasRole = (roles) => computed(() => roles.includes(user.value?.role));

  // Actions
  const setUser = (newUser) => {
    user.value = newUser;
  };

  const setToken = (newToken) => {
    token.value = newToken;
  };

  const logout = () => {
    user.value.email = null;
    user.value.role = null;
    token.value = null;

    if (rememberMe.value) {
      localStorage.removeItem('token');
    } else {
      sessionStorage.removeItem('token');
    }
  };

  // Action untuk mengubah status rememberMe
  const setRememberMe = (value) => {
    rememberMe.value = value
    localStorage.setItem('rememberMe', value.toString())
  };

  return {
    isAuthenticated,
    userRole,
    userEmail,
    rememberMe,
    hasRole,
    setUser,
    setToken,
    logout,
    setRememberMe,
    initializeRememberMe,
    initializeAuth
  };
});
