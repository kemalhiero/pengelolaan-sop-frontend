// stores/auth.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(true);
  const role = ref('admin'); // Default role sebagai guest, [admin, guest]

  function login() {
    isLoggedIn.value = true;
  }

  function logout() {
    isLoggedIn.value = false;
  }

  return { isLoggedIn, role, login, logout };
});
