<script setup>
import { inject, ref } from 'vue';
import { forgetPw } from '@/api/authApi';
import useToastPromise from '@/utils/toastPromiseHandler';

const layoutType = inject('layoutType');
layoutType.value = null;

const form = ref({
    idnumber: ''
});

const submitForgetPw = () => {
    try {
        useToastPromise(
            new Promise((resolve, reject) => {
                forgetPw(form.value)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        resolve();
                    })
                    .catch(error => reject(error));
            }),
            {
                messages: {
                    success: 'Tautan sudah dikirimkan. Silahkan periksa email Anda!',
                },
            }
        );
    } catch (error) {
        console.error('Fetch error:', error);
    }
};
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
                <p class="font-light text-gray-500 dark:text-gray-400">
                    Jangan khawatir. Ketikkan NIM/NIP anda dan kami akan mengirimkan tautan ke email Anda!
                </p>
                <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5" @submit.prevent="submitForgetPw">
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-900">NIM/NIP anda</label>
                        <input type="text" v-model="form.idnumber"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            placeholder="2011520000" required autofocus>
                    </div>
                    <button type="submit"
                        class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Kirim tautan
                    </button>
                </form>
            </div>
        </div>
    </section>
</template>
