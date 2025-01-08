<script setup>
import { inject, ref } from 'vue';
import { toast } from 'vue3-toastify';
import { jwtDecode } from 'jwt-decode';
import { RouterLink, useRouter } from 'vue-router';

import { loginUser } from '@/api/userApi';
import { useAuthStore } from '@/stores/auth';

import EyeIcon from '@/assets/icons/EyeIcon.vue';
import EyeSlashIcon from '@/assets/icons/EyeSlashIcon.vue';

const router = useRouter();
const authStore = useAuthStore();

const layoutType = inject('layoutType');
layoutType.value = null;

const form = ref({
    email: null,
    password: null
});
let rememberMe = ref(false);
rememberMe.value = authStore.rememberMe;

const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value
};

const login = async () => {
    try {
        const dataLogin = await loginUser({
            email: form.value.email,
            password: form.value.password
        });

        if (dataLogin.success) {

            authStore.setRememberMe(rememberMe.value);

            if (authStore.rememberMe) {
                localStorage.setItem('sipp-dsi-token', dataLogin.data.token);
            } else {
                sessionStorage.setItem('sipp-dsi-token', dataLogin.data.token);
            }
            authStore.setToken(dataLogin.data.token)

            const decoded = jwtDecode(dataLogin.data.token);
            authStore.setUser({
                email: decoded.email,
                role: decoded.role,
            });

            toast("Berhasil masuk!", {
                "type": "success",
                "autoClose": 2000,
            });

            switch (decoded.role) {
                case 'sivitas-akademika':
                case 'penyusun':
                    setTimeout(() => {
                        router.push('/')
                    }, 2000);
                    break;
                case 'pj':
                case 'kaprodi':
                    setTimeout(() => {
                        router.push('/app')
                    }, 2000);
                    break;
                default:
                    router.push('/unauthorized')
                    break;
            }

        } else {
            toast("Email atau password anda salah!", {
                "type": "error",
                "autoClose": 5000,
            });
            // form.value.password = '';
        }

    } catch (error) {
        console.error(error);
    }
};

</script>
<template>
    <section class="bg-gray-200">
        <div class="flex flex-col items-center justify-center p-6 mx-auto md:h-screen lg:py-0">
            <RouterLink to="/" class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
                <img class="w-8 h-8 mr-2" src="/logo.svg"
                    alt="logo">
                SIPP DSI
            </RouterLink>
            <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 class="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                        Silahkan masuk ke akun anda!
                    </h1>
                    <form class="space-y-4 md:space-y-6" @submit.prevent="login">
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                            <input type="email" v-model="form.email" id="email"
                                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                placeholder="contoh: nama@student.unand.ac.id" autofocus required>
                        </div>
                        <div>
                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Sandi</label>
                            <div class="relative">
                                <input
                                    :type="showPassword ? 'text' : 'password'"
                                    v-model="form.password"
                                    id="password"
                                    placeholder="ketikkan sandi...."
                                    minlength="5"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                    required
                                >
                                <button
                                    type="button"
                                    @click="togglePassword"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    <EyeIcon v-if="showPassword" class="h-5 w-5" />
                                    <EyeSlashIcon v-else class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-start">
                                <div class="flex items-center h-5">
                                    <input id="remember" aria-describedby="remember" type="checkbox"
                                        v-model="rememberMe"
                                        class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300">
                                </div>
                                <div class="ml-3 text-sm" title="Anda akan tetap login 30 hari ke depan">
                                    <label for="remember">Ingat saya</label>
                                </div>
                            </div>
                            <RouterLink to="/forget-pw">
                                <span class="text-sm font-medium text-primary-600 hover:underline">
                                    Lupa Sandi?
                                </span>
                            </RouterLink>
                        </div>
                        <button type="submit"
                            class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Masuk</button>
                        <p class="text-sm font-light">
                            Belum punya akun?
                            <RouterLink to="/regist">
                                <span class="font-medium text-primary-600 hover:underline">
                                    Daftar
                                </span>
                            </RouterLink>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>
