<script setup>
import { initDrawers } from 'flowbite';
import { onMounted, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { RouterLink, useRouter } from 'vue-router';

import getToken from '@/utils/getToken';
import { useAuthStore } from '@/stores/auth';
import { logoutUser } from '@/api/authApi';
import { getAssignment } from '@/api/sopApi';

const authStore = useAuthStore();
const router = useRouter();
const showDropdown = ref(false);

const handleLogout = async () => {
  await logoutUser(getToken());
  authStore.logout();

  toast("Berhasil keluar!", {
    type: "success",
    autoClose: 3000,
  });

  setTimeout(() => {
    router.replace('/');
  }, 3000);
};

const assignmentNumber = ref(0)
const fetchData = async () => {
  try {
    const result = await getAssignment();
    assignmentNumber.value = result.data.length;
  } catch (error) {
    assignmentNumber.value = null;
    console.error(error);
  }
};

onMounted(() => {
  initDrawers();
  fetchData();
})
</script>

<template>
  <nav class="bg-white border-gray-200">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <RouterLink to="/" class="flex items-center space-x-3">
        <img src="/logo.svg" class="h-8" alt="Flowbite Logo" />
        <span class="self-center text-2xl font-semibold whitespace-nowrap">SIPP DSI</span>
      </RouterLink>

      <div class="flex md:order-2 space-x-3 md:space-x-0">

        <!-- menu user apabila sudah login -->
        <div v-if="authStore.isAuthenticated" class="relative flex items-center md:order-2 space-x-3 md:space-x-0">
          <button type="button"
            class="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 relative"
            @click="showDropdown = !showDropdown">
            <span class="sr-only">Open user menu</span>
            <img class="w-8 h-8 rounded-full" :src="authStore.userPhoto || '/user-avatar.jpg'" alt="user photo">
            <span v-show="assignmentNumber > 0" :title="`Ada ${assignmentNumber} tugas!`"
              class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-2">
              {{ assignmentNumber }}
            </span>
          </button>

          <!-- Overlay transparan untuk menangkap klik luar -->
          <div v-show="showDropdown" class="fixed inset-0" @click="showDropdown = false"></div>

          <!-- Dropdown menu -->
          <div v-show="showDropdown"
            class="absolute right-0 top-6 z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg border-2">
            <div class="px-4 py-3">
              <span class="block text-sm text-gray-900 truncate">{{ authStore.userIdNumber }}</span>
              <span class="block text-sm text-gray-500">{{ authStore.userRole }}</span>
            </div>
            <ul class="py-2">
              <li v-if="authStore.userRole == 'penyusun'" class="flex hover:bg-gray-100 hover:cursor-pointer">
                <RouterLink to="/assignment" class="block py-2 px-4 text-sm"
                  @click="showDropdown = false">Penugasan</RouterLink>
                <!-- <span v-show="assignmentNumber > 0" :title="`Ada ${assignmentNumber} tugas!`"
                  class="inline-flex items-center justify-center mr-2 text-sm font-bold leading-none text-red-600">
                  {{ assignmentNumber }}
                </span> -->
              </li>
              <li class="hover:bg-gray-100 hover:cursor-pointer">
                <RouterLink to="/profile" class="block py-2 px-4 text-sm "
                  @click="showDropdown = false">Profil</RouterLink>
              </li>
              <li v-if="authStore.userRole == 'kadep' || authStore.userRole == 'pj'">
                <RouterLink to="/app"
                  class="block px-4 py-2 text-sm">App</RouterLink>
              </li>
              <li class="hover:bg-gray-100 hover:cursor-pointer">
                <p @click="handleLogout"
                  class="block px-4 py-2 text-sm">Keluar</p>
              </li>
            </ul>
          </div>
        </div>

        <!-- menu apa bila belum login -->
        <RouterLink v-else to="/login">
          <button type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center">
            Login
          </button>
        </RouterLink>

        <button data-collapse-toggle="navbar-cta" type="button"
          class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-controls="navbar-cta" aria-expanded="false">
          <span class="sr-only">Open main menu</span>
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>

      </div>
    </div>
  </nav>
</template>
