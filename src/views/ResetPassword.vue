<script setup>
import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resetPw } from '@/api/authApi';
import { toast } from 'vue3-toastify';

import EyeIcon from '@/assets/icons/EyeIcon.vue';
import EyeSlashIcon from '@/assets/icons/EyeSlashIcon.vue';

const layoutType = inject('layoutType');
layoutType.value = null;

const showPw = ref({
    password: false,
    confirm_password: false
});
const togglePassword = () => { showPw.value.password = !showPw.value.password };
const toggleConfirmPassword = () => { showPw.value.confirm_password = !showPw.value.confirm_password };
const route = useRoute();
const router = useRouter();

if (!route.query.token) {
    router.replace('/login')
};

const form = ref({
    token: route.query.token,
    password: '',
    confirm_password: ''
});

const submitResetPw = () => {
    toast.promise(
        new Promise((resolve, reject) => {
            resetPw(form.value)
                .then(response => {
                    if (!response.success) {
                        // Jika success false, throw error dengan data dari response
                        throw response;
                    }
                    resolve(response);
                })
                .catch(error => reject(error));
        }),
        {
            pending: {
                render() {
                    return 'Sedang memproses data...'
                },
                icon: '🔄'
            },
            success: {
                render() {
                    setTimeout(() => {
                        router.push('/login');
                    }, 5000);
                    return 'Sandi berhasil diperbarui! Anda akan diarahkan ke halaman login dalam 5 detik'
                },
                icon: '✅'
            },
            error: {
                render({ data }) {
                    return `Gagal: ${data.error?.message || 'Terjadi kesalahan'}`
                },
                icon: '❌'
            }
        },
        {
            closeButton: true,
        }
    );
};
</script>

<template>
    <section class="bg-gray-200 h-screen">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <RouterLink class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
                <img class="w-8 h-8 mr-2" src="/logo.svg" alt="logo">
                SIPP DSI
            </RouterLink>
            <div class="w-full p-6 bg-white rounded-lg shadow md:mt-0 sm:max-w-md sm:p-8">
                <h2 class="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                    Ganti sandi
                </h2>
                <form class="mt-4 space-y-4 lg:mt-5 md:space-y-5" @submit.prevent="submitResetPw">
                    <div>
                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Sandi baru</label>
                        <div class="relative">
                            <input :type="showPw.password ? 'text' : 'password'" id="password"
                                placeholder="ketikkan sandi" v-model="form.password"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                required minlength="5">
                            <button type="button" @click="togglePassword"
                                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                <EyeIcon v-if="showPw.password" class="h-5 w-5" />
                                <EyeSlashIcon v-else class="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900">Konfirmasi
                            sandi</label>
                        <div class="relative">
                            <input :type="showPw.confirm_password ? 'text' : 'password'" id="confirm-password"
                                placeholder="ketikkan sandi" v-model="form.confirm_password"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                required minlength="5">
                            <button type="button" @click="toggleConfirmPassword"
                                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                <EyeIcon v-if="showPw.confirm_password" class="h-5 w-5" />
                                <EyeSlashIcon v-else class="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <button type="submit"
                        class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Atur ulang sandi
                    </button>
                </form>
            </div>
        </div>
    </section>
</template>
