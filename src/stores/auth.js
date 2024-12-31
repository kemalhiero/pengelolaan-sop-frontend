import { jwtDecode } from 'jwt-decode';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(null);
  const user = ref({
    email: '',
    role: ''
  });

  // Mengambil data dari localStorage saat inisialisasi
  const initializeAuth = () => {
    const savedToken = localStorage.getItem('token');
    
    if (savedToken) {
      try {
        token.value = savedToken;
        const decoded = jwtDecode(savedToken);
        console.log(decoded)
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

    localStorage.removeItem('token');
  };

  // Inisialisasi auth state
  initializeAuth();

  return {
    isAuthenticated,
    userRole,
    userEmail,
    hasRole,
    setUser,
    setToken,
    logout
  };
});
