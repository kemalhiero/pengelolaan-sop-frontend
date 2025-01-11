<script setup>
import { initCollapses, initDropdowns, initTooltips, initDrawers } from 'flowbite';
import { onMounted } from 'vue';
import { toast } from 'vue3-toastify';
import { useRouter } from 'vue-router';

import { logoutUser } from '@/api/authApi';
import { useAuthStore } from '@/stores/auth';
import getToken from '@/utils/getToken';

import NavbarNotification from './NavbarNotification.vue';
// import SidebarSetting from './SidebarSetting.vue';

// icon svg
import PageIcon from '@/assets/icons/PageIcon.vue'
import AngleDownIcon from '@/assets/icons/AngleDownIcon.vue';
import DashboardIcon from '@/assets/icons/DashboardIcon.vue';
import HelpIcon from '@/assets/icons/HelpIcon.vue';
import BuildingIcon from '../../assets/icons/BuildingIcon.vue';
import ScaleBalanced from '@/assets/icons/ScaleBalanced.vue';
import FeedbackIcon from '@/assets/icons/FeedbackIcon.vue';
import UserGearIcon from '@/assets/icons/UserGearIcon.vue';
// import SidebarNominalIndicator from '../indicator/SidebarNominalIndicator.vue';
// import StackDocumentIcon from '@/assets/icons/StackDocumentIcon.vue';
// import TaskIcon from '@/assets/icons/TaskIcon.vue';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
    await logoutUser(getToken());
    authStore.logout();
    toast("Berhasil keluar!", {
        "type": "success",
        "autoClose": 2000,
    });
    setTimeout(() => {
        router.push('/')
    }, 2000);
};

onMounted(() => {
    initCollapses();
    initDropdowns();
    initTooltips();
    initDrawers();
})

</script>

<template>

    <!-- Navbar -->
    <nav class="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
        <div class="flex flex-wrap justify-between items-center">
            <div class="flex justify-start items-center">
                <button data-drawer-target="drawer-navigation" data-drawer-toggle="drawer-navigation"
                    aria-controls="drawer-navigation"
                    class="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer md:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100">
                    <svg aria-hidden="true" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clip-rule="evenodd"></path>
                    </svg>
                    <svg aria-hidden="true" class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"></path>
                    </svg>
                    <span class="sr-only">Toggle sidebar</span>
                </button>
                <RouterLink to="/app" class="flex items-center justify-between mr-4">
                    <img src="/logo.svg" class="mr-3 h-8" alt="Flowbite Logo" />
                    <span class="self-center text-2xl font-semibold whitespace-nowrap">SIPP DSI</span>
                </RouterLink>

            </div>
            <div class="flex items-center lg:order-2">

                <!-- Notifications -->
                <NavbarNotification />

                <!-- User -->
                <button type="button"
                    class="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300"
                    id="user-menu-button" aria-expanded="false" data-dropdown-toggle="dropdown">
                    <span class="sr-only">Open user menu</span>
                    <img class="w-8 h-8 rounded-full" src="/logo_unand_kecil.png" alt="user photo" />
                </button>
                <!-- Dropdown menu -->
                <div class="hidden z-50 my-4 w-56 text-base list-none bg-white divide-y divide-gray-100 shadow border border-gray-300 rounded-xl"
                    id="dropdown">
                    <div class="py-3 px-4">
                        <span class="block text-sm font-semibold text-gray-900">Nama user</span>
                        <span class="block text-sm text-gray-900 truncate">{{ authStore.userEmail }}</span>
                    </div>
                    <ul class="py-1" aria-labelledby="dropdown">
                        <li>
                            <a href="#" class="block py-2 px-4 text-sm hover:bg-gray-100">Profil Saya</a>
                        </li>
                        <li>
                            <RouterLink to="/" class="block py-2 px-4 text-sm hover:bg-gray-100">Landing Page</RouterLink>
                        </li>
                    </ul>
                    <ul class="py-1" aria-labelledby="dropdown">
                        <li @click="handleLogout" class="hover:cursor-pointer">
                            <p class="block py-2 px-4 text-sm hover:bg-gray-100">Keluar</p>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    </nav>

    <!-- Sidebar -->
    <aside
        class="fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0"
        aria-label="Sidenav" id="drawer-navigation">
        <div class="overflow-y-auto py-5 px-3 h-full bg-white">

            <ul class="space-y-2">
                <li>
                    <RouterLink :to="{ name: 'AuthenticatedDashboard' }"
                        title="Ringkasan data SOP yang dikelola oleh penanggung jawab"
                        class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-200 group"
                        active-class="bg-gray-200">
                        <DashboardIcon
                            class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 fill-current" />
                        <span class="ml-3">Dashboard</span>
                    </RouterLink>
                </li>
                <li>
                    <RouterLink :to="{ name: 'SopDocs' }" title="List Dokumen SOP yang dikelola oleh penanggung jawab"
                        class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-200 group"
                        active-class="bg-gray-200">
                        <PageIcon
                            class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 fill-current" />
                        <span class="flex-1 ml-3 whitespace-nowrap">Dokumen SOP</span>
                    </RouterLink>
                </li>
                <li>
                    <button type="button"
                        class="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200"
                        aria-controls="dropdown-roles" data-collapse-toggle="dropdown-roles">
                        <UserGearIcon
                            class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 fill-current" />
                        <span class="flex-1 ml-3 text-left whitespace-nowrap">Role User</span>
                        <AngleDownIcon />
                    </button>
                    <ul id="dropdown-roles" class="hidden py-2 space-y-2">
                        <li v-if="authStore.userRole === 'kaprodi'">
                            <RouterLink :to="{ name: 'KaprodiManagement' }" active-class="bg-gray-200"
                                class="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200">
                                Kepala Departemen
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{ name: 'PicManagement' }" active-class="bg-gray-200"
                                class="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200">
                                Penanggung Jawab
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{ name: 'DrafterManagement' }" active-class="bg-gray-200"
                                class="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200">
                                Penyusun
                            </RouterLink>
                        </li>
                    </ul>
                </li>
                <li v-if="authStore.userRole === 'kaprodi'">
                    <RouterLink :to="{ name: 'SopOrg' }" title="List Organisasi"
                        class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-200 group"
                        active-class="bg-gray-200">
                        <BuildingIcon
                            class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 fill-current" />
                        <span class="flex-1 ml-3 whitespace-nowrap">Organisasi</span>
                    </RouterLink>
                </li>
                <li>
                    <button type="button"
                        class="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200"
                        aria-controls="dropdown-law" data-collapse-toggle="dropdown-law">
                        <ScaleBalanced
                            class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 fill-current" />
                        <span class="flex-1 ml-3 text-left whitespace-nowrap">Hukum</span>
                        <AngleDownIcon />
                    </button>
                    <ul id="dropdown-law" class="hidden py-2 space-y-2">
                        <li>
                            <RouterLink :to="{ name: 'SopLawBasis' }" active-class="bg-gray-200"
                                class="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200">
                                Dasar Hukum
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{ name: 'SopLawType' }" active-class="bg-gray-200"
                                class="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-200">
                                Jenis Peraturan
                            </RouterLink>
                        </li>
                    </ul>
                </li>

                <li>
                    <RouterLink :to="{ name: 'SopFeedback' }" title="Komentar dan saran dari pengunjung terkait SOP"
                        class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-200 group"
                        active-class="bg-gray-200">
                        <FeedbackIcon
                            class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 fill-current" />
                        <span class="flex-1 ml-3 whitespace-nowrap">Umpan Balik</span>
                        <!-- <SidebarNominalIndicator :message-count="5" /> -->
                    </RouterLink>
                </li>
            </ul>
            <ul class="pt-5 mt-5 space-y-2 border-t border-gray-200">
                <li>
                    <RouterLink :to="{ name: 'AppGuide' }"
                        class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-gray-200 group"
                        active-class="bg-gray-200">
                        <HelpIcon
                            class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 fill-current" />
                        <span class="ml-3">Panduan</span>
                    </RouterLink>
                </li>
            </ul>
        </div>

        <!-- <SidebarSetting/> -->

    </aside>

</template>
