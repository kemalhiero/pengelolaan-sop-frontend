import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import getToken from '@/utils/getToken';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(null);
  const user = ref({
    idnumber: '',
    role: '',
    photo: ''
  });

  const rememberMe = ref(false);
  const initializeRememberMe = () => {
    // Mengambil nilai dari localStorage, defaultnya false
    rememberMe.value = localStorage.getItem('sipp-dsi-remember-me') === 'true'
  };

  // Mengambil data dari localStorage saat inisialisasi
  const initializeAuth = () => {
    const savedToken = getToken();
    if (savedToken) {
      try {
        token.value = savedToken;
        const decoded = jwtDecode(savedToken);

        user.value.idnumber = decoded.idnumber;
        user.value.role = decoded.role;
        user.value.photo = decoded.photo;
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
  const userIdNumber = computed(() => user.value?.idnumber);
  const userPhoto = computed(() => user.value?.photo);
  const hasRole = (roles) => roles.includes(user.value?.role);

  // Actions
  const setUser = (newUser) => {
    user.value = newUser;
  };

  const setToken = (newToken) => {
    token.value = newToken;
  };

  const setPhoto = (photoUrl) => {
    user.value.photo = photoUrl;
  };

  const logout = () => {
    user.value.idnumber = null;
    user.value.role = null;
    user.value.photo = null;
    token.value = null;

    if (rememberMe.value) {
      localStorage.removeItem('sipp-dsi-token');
    } else {
      sessionStorage.removeItem('sipp-dsi-token');
    }
  };

  // Action untuk mengubah status rememberMe
  const setRememberMe = (value) => {
    rememberMe.value = value
    localStorage.setItem('sipp-dsi-remember-me', value.toString())
  };

  return {
    isAuthenticated,
    userRole,
    userIdNumber,
    userPhoto,
    rememberMe,
    hasRole,
    setUser,
    setToken,
    setPhoto,
    logout,
    setRememberMe,
    initializeRememberMe,
    initializeAuth
  };
});
