<script setup>
import { initCollapses, initDropdowns, initTooltips } from 'flowbite';
import { onMounted } from 'vue';

import NavbarNotification from './NavbarNotification.vue';
import NavbarApp from './NavbarApp.vue';
import NavbarUser from './NavbarUser.vue';
import SidebarSetting from './SidebarSetting.vue';

const routes = []

// icon svg
import PageIcon from '@/assets/icons/PageIcon.vue'
import AngleDownIcon from '@/assets/icons/AngleDownIcon.vue';
import DashboardIcon from '@/assets/icons/DashboardIcon.vue';
import SidebarNominalIndicator from '../indicator/SidebarNominalIndicator.vue';
import StackDocumentIcon from '@/assets/icons/StackDocumentIcon.vue';
import GuideIcon from '@/assets/icons/GuideIcon.vue';

onMounted(() => {
    initCollapses();
    initDropdowns();
    initTooltips();
})

</script>

<template>

    <!-- Navbar -->
    <nav
        class="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50">
        <div class="flex flex-wrap justify-between items-center">
            <div class="flex justify-start items-center">
                <button data-drawer-target="drawer-navigation" data-drawer-toggle="drawer-navigation"
                    aria-controls="drawer-navigation"
                    class="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer md:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
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
                    <img src="https://flowbite.s3.amazonaws.com/logo.svg" class="mr-3 h-8" alt="Flowbite Logo" />
                    <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">SIPP DSI</span>
                </RouterLink>

            </div>
            <div class="flex items-center lg:order-2">

                <!-- Notifications -->
                <NavbarNotification />
                <!-- Apps -->
                <NavbarApp />
                <!-- User -->
                <NavbarUser />

            </div>
        </div>
    </nav>

    <!-- Sidebar -->
    <aside
        class="fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
        aria-label="Sidenav" id="drawer-navigation">
        <div class="overflow-y-auto py-5 px-3 h-full bg-white dark:bg-gray-800">

            <ul class="space-y-2">
                <li>
                    <RouterLink :to="{ name: 'AuthenticatedDashboard' }" title="Ringkasan data SOP yang dikelola oleh penanggung jawab"
                        class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <DashboardIcon/>
                        <span class="ml-3">Dashboard</span>
                    </RouterLink>
                </li>
                <li>
                    <RouterLink :to="{ name: 'SopDocs' }" title="List Dokumen SOP yang dikelola oleh penanggung jawab"
                        class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <PageIcon/>
                        <span class="flex-1 ml-3 whitespace-nowrap">Dokumen</span>
                    </RouterLink>
                </li>
                <li>
                    <button type="button" title="Pengelolaan dokumen SOP, dimulai dari pengusulan hingga publikasi"
                    class="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    aria-controls="dropdown-pages" data-collapse-toggle="dropdown-pages">
                        <StackDocumentIcon/> 
                        <span class="flex-1 ml-3 text-left whitespace-nowrap">Pengelolaan</span>
                        <AngleDownIcon/>
                    </button>
                    <ul id="dropdown-pages" class="py-2 space-y-2">
                        <li>
                            <RouterLink :to="{ name: 'SopPropose' }" title="Usulkan SOP baru atau revisi yang sudah ada"
                                class="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                                <span class="flex-1">Pengusulan</span>
                                <SidebarNominalIndicator :message-count="2" />
                            </RouterLink>
                            
                        </li>
                        <li>
                            <RouterLink :to="{ name: 'SopReview' }" title="Tinjau progres pembuatan SOP"
                                class="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                                <span class="flex-1">Peninjauan</span>
                                <SidebarNominalIndicator :message-count="3" />
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{ name: 'SopAgreement' }" title="Persetujuan dan publikasi SOP"
                                class="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                                <span class="flex-1">Persetujuan</span>
                                <SidebarNominalIndicator :message-count="1" />
                            </RouterLink>
                        </li>
                    </ul>
                </li>
                <li>
                    <RouterLink :to="{ name: 'SopFeedback' }" title="Komentar dan saran dari pengunjung terkait SOP"
                        class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                        <svg aria-hidden="true"
                            class="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                            fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z">
                            </path>
                            <path
                                d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z">
                            </path>
                        </svg>
                        <span class="flex-1 ml-3 whitespace-nowrap">Umpan Balik</span>
                        <!-- <SidebarNominalIndicator :message-count="5" /> -->
                    </RouterLink>
                </li>
            </ul>
            <ul class="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
                <li>
                    <RouterLink :to="{ name: 'AppGuide' }"
                        class="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group">
                        <GuideIcon/>
                        <span class="ml-3">Panduan</span>
                    </RouterLink>
                </li>
            </ul>
        </div>

        <!-- <SidebarSetting/> -->

    </aside>

</template>
