<script setup>
import { inject } from 'vue';

const layoutType = inject('layoutType');
layoutType.value = null;
</script>

<template>
    <section class="bg-gray-200 h-screen">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <RouterLink to="/" class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
                <img class="w-8 h-8 mr-2" src="/logo.svg" alt="logo">
                SIPP DSI
            </RouterLink>
            <div
                class="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
                <h1 class="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                    Lupa sandi?
                </h1>
                <p class="font-light text-gray-500 dark:text-gray-400">Jangan khawatir! Cukup ketik email Anda dan kami
                    akan mengirimkan tautan untuk mereset kata sandi Anda!</p>
                <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5" @submit.prevent="">
                    <div>
                        <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email anda</label>
                        <input type="email" id="email"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            placeholder="nama@student.unand.ac.id" required autofocus>
                    </div>
                    <!-- <div class="flex items-start">
                        <div class="flex items-center h-5">
                            <input id="terms" aria-describedby="terms" type="checkbox"
                                class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
                                required="">
                        </div>
                        <div class="ml-3 text-sm">
                            <label for="terms" class="font-light text-gray-500">I accept the <a
                                    class="font-medium text-primary-600 hover:underline" href="#">Terms and
                                    Conditions</a></label>
                        </div>
                    </div> -->
                    <button type="submit"
                        class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Kirim tautan
                    </button>
                </form>
            </div>
        </div>
    </section>
</template>
