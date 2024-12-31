<script setup>
import { loginUser } from '@/api/userApi';
import DangerToast from '@/components/toast/DangerToast.vue';
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { jwtDecode } from 'jwt-decode';

const router = useRouter();
const authStore = useAuthStore();

const layoutType = inject('layoutType');
layoutType.value = null;

const form = ref({
    email: null,
    password: null
});

// TODO simpan token di local storage

const showValidation = ref(false);
const login = async () => {
    try {
        console.log(form.value)
        const dataLogin = await loginUser({
            email: form.value.email,
            password: form.value.password
        });
        console.log('data login', dataLogin);
        if (dataLogin.success) {
            localStorage.setItem('token', dataLogin.data.token)
            authStore.setToken(dataLogin.data.token)

            const decoded = jwtDecode(dataLogin.data.token);
            authStore.setUser({
                email: decoded.email,
                role: decoded.role,
            })

            switch (decoded.role) {
                case 'mahasiswa/dosen':
                case 'penyusun':
                    router.push('/')
                    break;
                case 'pj':
                case 'kaprodi':
                    router.push('/app')
                    break;
                default:
                    router.push('/unauthorized')
                    break;
            }

        } else {
            showValidation.value = true;
            // form.value.password = '';
        }

    } catch (error) {
        console.error(error);
    }
};

</script>
<template>
    <section class="bg-gray-50">
        <div class="flex flex-col items-center justify-center p-6 mx-auto md:h-screen lg:py-0">
            <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
                <img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
                    alt="logo">
                SIPP DSI
            </a>
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
                                placeholder="nama@fti.unand.ac.id" autofocus required>
                        </div>
                        <div>
                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Sandi</label>
                            <input type="password" v-model="form.password" id="password"
                                placeholder="ketikkan sandi...."
                                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                required>
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="flex items-start">
                                <div class="flex items-center h-5">
                                    <input id="remember" aria-describedby="remember" type="checkbox"
                                        class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300">
                                </div>
                                <div class="ml-3 text-sm">
                                    <label for="remember" class="text-gray-500">Ingat saya</label>
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
                        <p class="text-sm font-light text-gray-500">
                            Belum punya akun?
                            <RouterLink to="/regist">
                                <span class="font-medium text-primary-600 hover:underline">
                                    Register
                                </span>
                            </RouterLink>
                        </p>
                    </form>
                </div>
            </div>
            <p v-show="showValidation" class="mt-2 text-sm text-red-600"><span class="font-medium">Ops!</span> Email
                atau password anda salah!</p>
        </div>
    </section>
</template>
