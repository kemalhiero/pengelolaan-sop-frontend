<script setup>
import { initDrawers } from 'flowbite';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { logoutUser } from '@/api/userApi';
import { toast } from 'vue3-toastify';

const authStore = useAuthStore();

const handleLogout = async () => {
  await logoutUser(localStorage.getItem('token'))
  authStore.logout();
  toast("Berhasil keluar!", {
    "type": "success",
    "autoClose": 3000,
  });
};

onMounted(() => {
  initDrawers();
})
</script>

<template>
  <nav class="bg-white border-gray-200">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <RouterLink to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <img src="https://flowbite.com/docs/images/logo.svg" class="h-8" alt="Flowbite Logo" />
        <span class="self-center text-2xl font-semibold whitespace-nowrap">SIPP DSI</span>
      </RouterLink>

      <!-- <p class="text-black">{{ authStore }}</p> -->
      <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">

        <!-- menu user apabila sudah login -->
        <div v-if="authStore.isAuthenticated"
          class="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button type="button" class="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300"
            id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown"
            data-dropdown-placement="bottom">
            <span class="sr-only">Open user menu</span>
            <img class="w-8 h-8 rounded-full" src="/logo_unand_kecil.png" alt="user photo">
          </button>
          <!-- Dropdown menu -->
          <div class="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow"
            id="user-dropdown">
            <div class="px-4 py-3">
              <span class="block text-sm  text-gray-900 truncate">{{ authStore.userEmail }}</span>
              <span class="block text-sm text-gray-500">{{ authStore.userRole }}</span>
            </div>
            <ul class="py-2" aria-labelledby="user-menu-button">
              <li>
                <p @click="handleLogout"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:cursor-pointer">Keluar</p>
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
      <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
        <ul
          class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-white">

          <li>
            <RouterLink to="/" activeClass="text-blue-500"
              class="block py-2 px-3 md:p-0 rounded hover:bg-gray-100 md:hover:bg-transparent hover:text-blue-500">
              Beranda
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/sop" activeClass="text-blue-500"
              class="block py-2 px-3 md:p-0 rounded hover:bg-gray-100 md:hover:bg-transparent hover:text-blue-500">
              SOP
            </RouterLink>
          </li>

          <li>
            <RouterLink to="/faq" activeClass="text-blue-500"
              class="block py-2 px-3 md:p-0 rounded hover:bg-gray-100 md:hover:bg-transparent hover:text-blue-500">
              FAQ
            </RouterLink>
          </li>

          <li class="relative">
            <RouterLink to="/assignment" activeClass="text-blue-500"
              v-if="authStore.isAuthenticated && authStore.userRole == 'penyusun'"
              class="block py-2 px-3 md:p-0 rounded hover:bg-gray-100 md:hover:bg-transparent hover:text-blue-500">
              Penugasan
              <!-- Notifikasi -->
              <span
                class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-2">
                9
              </span>
            </RouterLink>


          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>
