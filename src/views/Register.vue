<script setup>
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import { registUser } from '@/api/authApi';
import { toast } from "vue3-toastify";
import ErrorText from '@/components/validation/ErrorText.vue';
import EyeIcon from '@/assets/icons/EyeIcon.vue';
import EyeSlashIcon from '@/assets/icons/EyeSlashIcon.vue';

const router = useRouter();

const isPasswordConfirmSimilar = ref(true);
const isGenderPresent = ref(true);
const isEntryDuplicate = ref({
    id_number: false,
    email: false
});

const layoutType = inject('layoutType');
layoutType.value = null;

const form = ref({
    name: null,
    id_number: null,
    email: null,
    gender: null,
    password: null,
    confirm_password: null
});

const showPw = ref({
    password: false,
    confirm_password: false
});
const togglePassword = () => { showPw.value.password = !showPw.value.password };
const toggleConfirmPassword = () => { showPw.value.confirm_password = !showPw.value.confirm_password };

// TODO simpan token di local storage

const regist = async () => {
    try {
        if (!form.value.gender || (form.value.gender != 'pria' && form.value.gender != 'wanita')) {
            isGenderPresent.value = false;
        } else {
            isGenderPresent.value = true;
        };

        if (form.value.password !== form.value.confirm_password) {
            isPasswordConfirmSimilar.value = false;
        } else {
            isPasswordConfirmSimilar.value = true;
        };
        // console.log(form.value);

        // TODO buat validasi kalau ada duplikat
        const dataRegist = await registUser(form.value);
        // console.log(dataRegist)

        if (dataRegist.success) {
            toast("Selamat! Akun Anda berhasil dibuat", {
                "type": "success",
            })
            setTimeout(() => {
                router.push('/login')
            }, 3000);
        } else {
            if (dataRegist.status == 409) {

                if (dataRegist.error.field == "identity_number") {
                    isEntryDuplicate.value.id_number = true
                    isEntryDuplicate.value.email = false
                } else if (dataRegist.error.field == "email") {
                    isEntryDuplicate.value.email = true
                    isEntryDuplicate.value.id_number = false
                } else {
                    isEntryDuplicate.value.id_number = false
                    isEntryDuplicate.value.email = false
                }
            }
            // form.value.password = '';
        }

    } catch (error) {
        console.error(error);
        toast(`Gagal membuat akun! <br> ${error} `, {
            "type": "error",
            "autoClose": 5000,
            'dangerouslyHTMLString': true
        });
    }
};
</script>

<template>
    <div class="flex flex-col sm:flex-row items-center justify-around p-6 lg:py-0 bg-gray-200 overflow-y-auto h-screen">
        <div>
            <RouterLink to="/" class="flex items-center my-6 text-2xl sm:text-5xl font-semibold mx-9">
                <img class="w-8 sm:w-20 mr-4" src="/logo.svg" alt="logo">
                SIPP DSI
            </RouterLink>
            <h1 class="text-xl text-center leading-tight tracking-tight text-gray-900 md:text-2xl">
                Isi form untuk mendaftar!
            </h1>
        </div>
        <div class="w-full bg-white rounded-lg shadow my-6 sm:max-w-md xl:p-0">
            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <form class="space-y-4 md:space-y-6" @submit.prevent="regist">
                    <div>
                        <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Nama</label>
                        <input type="text" v-model="form.name" id="name"
                            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            placeholder="budi arie" autofocus required minlength="3">
                    </div>
                    <div>
                        <label for="idname" class="block mb-2 text-sm font-medium text-gray-900">NIM/NIP</label>
                        <input type="text" v-model="form.id_number" id="idname" minlength="10" maxlength="18"
                            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            placeholder="2011520000" autofocus required>
                        <ErrorText v-show="isEntryDuplicate.id_number === true"
                            text="NIM/NIP ini tidak dapat didaftarkan lagi!" />
                    </div>
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-900">Jenis kelamin</label>
                        <div class="flex flex-row max-w-60">
                            <div class="mr-8">
                                <input id="pria" type="radio" value="pria" v-model="form.gender"
                                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500">
                                <label for="pria" class="ms-2 text-sm font-medium text-gray-900">Pria</label>
                            </div>
                            <div>
                                <input id="wanita" type="radio" value="wanita" v-model="form.gender"
                                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500">
                                <label for="wanita" class="ms-2 text-sm font-medium text-gray-900">Wanita</label>
                            </div>
                        </div>
                        <ErrorText v-show="isGenderPresent === false" text="Pilih jenis kelamin!" />
                    </div>
                    <div>
                        <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                        <input type="email" v-model="form.email" id="email"
                            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            placeholder="nama@student.unand.ac.id" autofocus required>
                        <ErrorText v-show="isEntryDuplicate.email === true"
                            text="Email ini tidak dapat didaftarkan lagi!" />
                    </div>
                    <div>
                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Sandi</label>
                        <div class="relative">
                            <input :type="showPw.password ? 'text' : 'password'" v-model="form.password" id="password"
                                placeholder="ketikkan sandi...." minlength="5"
                                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                required>
                            <button type="button" @click="togglePassword"
                                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                <EyeIcon v-if="showPw.password" class="h-5 w-5" />
                                <EyeSlashIcon v-else class="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900">Konfirmasi Sandi</label>
                        <div class="relative">
                            <input :type="showPw.confirm_password ? 'text' : 'password'" v-model="form.confirm_password"
                                id="confirm-password" placeholder="ketikkan sandi...." minlength="5"
                                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                required>
                            <button type="button" @click="toggleConfirmPassword"
                                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                <EyeIcon v-if="showPw.confirm_password" class="h-5 w-5" />
                                <EyeSlashIcon v-else class="h-5 w-5" />
                            </button>
                        </div>
                        <ErrorText v-show="isPasswordConfirmSimilar === false" text="Sandi tidak sesuai!" />
                    </div>
                    <button type="submit"
                        class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Daftar</button>
                    <p class="text-sm font-light">
                        Sudah punya akun?
                        <RouterLink to="/login">
                            <span class="font-medium text-primary-600 hover:underline">
                                Masuk
                            </span>
                        </RouterLink>
                    </p>
                </form>
            </div>
        </div>
    </div>
</template>
