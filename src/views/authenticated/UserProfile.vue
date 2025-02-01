<script setup>
import { ref, reactive, inject, onMounted } from 'vue';
import { toast } from 'vue3-toastify';

import { useAuthStore } from '@/stores/auth';
import { sendCode, updateEmail, updatePw, verifCode } from '@/api/authApi';
import { addProfilePhoto, deleteUserProfile, getUserProfile } from '@/api/userApi';

import EyeIcon from '@/assets/icons/EyeIcon.vue';
import EyeSlashIcon from '@/assets/icons/EyeSlashIcon.vue';
import LockedInputColumnIndicator from '@/components/indicator/LockedInputColumnIndicator.vue';

const authStore = useAuthStore();
const layoutType = inject('layoutType');
layoutType.value = 'guest';

const showEmailConfirmationModal = ref(false);
const emailConfirmationCode = ref('');
const userProfile = ref({
    name: '',
    id_number: '',
    email: '',
    photo: '',
    gender: '',
    role: '',
    org: ''
});
const originalEmail = ref('');
const passwordChange = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});
const isPhotoModalOpen = ref(false);
const selectedImage = ref('');
const showPw = ref({
    current: false,
    new: false,
    confirm_new: false
});
const toggleCurrentPassword = () => { showPw.value.current = !showPw.value.current };
const toggleNewPassword = () => { showPw.value.new = !showPw.value.new };
const toggleConfirmPassword = () => { showPw.value.confirm_new = !showPw.value.confirm_new };

const fetchProfile = async () => {
    try {
        const result = await getUserProfile();
        userProfile.value = result.data;
        originalEmail.value = result.data.email;
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const openPhotoModal = () => {
    isPhotoModalOpen.value = true
};

const closePhotoModal = () => {
    isPhotoModalOpen.value = false
    selectedImage.value = null
};

const onFileSelected = (event) => {
    const file = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            selectedImage.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
};

const uploadPhoto = () => {
    try {
        toast.promise(
            new Promise((resolve, reject) => {
                addProfilePhoto(selectedImage.value)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        resolve(response);
                        closePhotoModal();
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
                        return 'Sandi anda berhasil diubah!'
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

    } catch (error) {
        console.error('Fetch error:', error);
        toast(`Data gagal ditambahkan! <br> ${error} `, {
            type: "error",
            autoClose: 5000,
            dangerouslyHTMLString: true
        });
    }
};

const removePhoto = async () => {
    try {
        await deleteUserProfile()
        userProfile.value.photo = null;
        selectedImage.value = null;
        closePhotoModal();
        authStore.setPhoto('');
    } catch (error) {
        console.error('Fetch error:', error);
        toast(`Data gagal ditambahkan! <br> ${error} `, {
            type: "error",
            autoClose: 5000,
            dangerouslyHTMLString: true
        });
    }
}

const changePassword = () => {
    try {
        if (passwordChange.newPassword !== passwordChange.confirmPassword) {
            alert('Konfirmasi password tidak sesuai')
            return
        }

        toast.promise(
            new Promise((resolve, reject) => {
                updatePw(passwordChange)
                    .then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        passwordChange.currentPassword = '';
                        passwordChange.newPassword = '';
                        passwordChange.confirmPassword = '';
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
                        return 'Sandi anda berhasil diubah!'
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

    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const checkDataUpdate = () => {
    try {
        if (userProfile.value.email !== originalEmail.value) {
            // Send verification code to the new email
            toast.promise(
                new Promise((resolve, reject) => {
                    sendCode({
                        newEmail: userProfile.value.email
                    }).then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        resolve(response);
                        showEmailConfirmationModal.value = true;
                    })
                        .catch(error => reject(error));
                }),
                {
                    pending: {
                        render() {
                            return 'Sedang mengirim kode..'
                        },
                        icon: '🔄'
                    },
                    success: {
                        render() {
                            return 'Kode berhasil dikirim! Silahkan cek email baru anda!'
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

        } else {
            console.log('email tidak berubah!')
            // Update profile without verification
            // await updateUserProfile(userProfile.value);
        }
    } catch (error) {
        console.error('Error sending confirmation code:', error);
    }
};

const verifyCode = async () => {        //verifikasi kode dan perbarui email
    try {
        const isValid = await verifCode({ code: emailConfirmationCode.value });
        if (isValid.success) {
            // if (userProfile.value.role !== 'kadep') {
            toast.promise(
                new Promise((resolve, reject) => {
                    updateEmail({
                        oldEmail: originalEmail.value,
                        newEmail: userProfile.value.email
                    }).then(response => {
                        if (!response.success) {
                            throw response;
                        }
                        resolve(response);
                        showEmailConfirmationModal.value = false;
                    })
                        .catch(error => reject(error));
                }),
                {
                    pending: {
                        render() {
                            return 'Sedang diproses...'
                        },
                        icon: '🔄'
                    },
                    success: {
                        render() {
                            return 'Email berhasil diperbarui!'
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
            // }
        } else {
            toast(`Kode verifikasi tidak valid!<br> ${isValid.error}`, {
                type: 'error',
                autoClose: 5000,
                dangerouslyHTMLString: true
            });
        }
    } catch (error) {
        console.error('Error verifying code:', error);
    }
};

onMounted(() => {
    fetchProfile();
});
</script>

<template>

    <div class="container mx-auto p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Foto Profil -->
            <div class="lg:col-span-1 flex flex-col items-center my-auto">
                <div class="relative mb-4">
                    <img :src="userProfile.photo || '/user-avatar.jpg'" alt="Foto Profil"
                        class="w-48 lg:w-60 rounded-full object-cover border-4 border-gray-300 shadow-lg" />
                    <button @click="openPhotoModal"
                        class="absolute bottom-0 lg:bottom-2 right-0 lg:right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Informasi Pribadi -->
            <div class="lg:col-span-2 p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Informasi Pribadi</h2>
                <form @submit.prevent="checkDataUpdate">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Nama</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled v-model="userProfile.name"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">NIM/NIP</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled v-model="userProfile.id_number"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" v-model="userProfile.email" required
                                class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Gender</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled v-model="userProfile.gender"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Role</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled v-model="userProfile.role"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Organisasi</label>
                            <div class="flex items-center border border-gray-300 rounded-lg shadow-sm">
                                <input type="text" disabled v-model="userProfile.org"
                                    class="w-full pl-3 py-2 border-none bg-transparent" />
                                <LockedInputColumnIndicator />
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button type="submit" :disabled="userProfile.email == originalEmail"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-opacity-60">
                            Perbarui Data
                        </button>
                    </div>
                </form>
            </div>

            <div></div>

            <!-- Ubah Password -->
            <div class="lg:col-span-2 p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Ubah Password</h2>
                <form @submit.prevent="changePassword">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Password Saat Ini</label>
                            <div class="relative">
                                <input :type="showPw.current ? 'text' : 'password'"
                                    v-model="passwordChange.currentPassword" required minlength="5"
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                <button type="button" @click="toggleCurrentPassword"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <EyeIcon v-if="showPw.current" class="h-5 w-5" />
                                    <EyeSlashIcon v-else class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Password Baru</label>
                            <div class="relative">
                                <input :type="showPw.new ? 'text' : 'password'" v-model="passwordChange.newPassword"
                                    required minlength="5"
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                <button type="button" @click="toggleNewPassword"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <EyeIcon v-if="showPw.new" class="h-5 w-5" />
                                    <EyeSlashIcon v-else class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                            <div class="relative">
                                <input :type="showPw.confirm_new ? 'text' : 'password'" minlength="5"
                                    v-model="passwordChange.confirmPassword" required
                                    class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                <button type="button" @click="toggleConfirmPassword"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                                    <EyeIcon v-if="showPw.confirm_new" class="h-5 w-5" />
                                    <EyeSlashIcon v-else class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end">
                        <button type="submit"
                            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Ubah Password
                        </button>
                    </div>
                </form>
            </div>

        </div>

        <!-- Modal Foto Profil -->
        <div v-if="isPhotoModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Kelola Foto Profil</h3>
                <div class="mb-4">
                    <input type="file" @change="onFileSelected" accept="image/png, image/jpeg, image/webp"
                        class="hidden" ref="fileInput" />
                    <button @click="$refs.fileInput.click()"
                        class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Pilih Foto
                    </button>
                </div>
                <div v-if="selectedImage" class="mb-4 flex justify-center">
                    <img :src="selectedImage" alt="Pratinjau Foto" class="max-w-full max-h-64 rounded-lg" />
                </div>
                <div class="flex space-x-2">
                    <button @click="uploadPhoto" :disabled="!selectedImage"
                        class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Unggah
                    </button>
                    <button @click="removePhoto"
                        class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Hapus
                    </button>
                    <button @click="closePhotoModal"
                        class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        Batal
                    </button>
                </div>
            </div>
        </div>

    </div>

    <!-- modal konfirmasi email -->
    <div v-show="showEmailConfirmationModal" class="fixed inset-0 z-50 flex items-center justify-center w-full h-full">

        <div class="fixed inset-0 bg-gray-800 bg-opacity-30"></div>

        <div class="relative w-full max-w-2xl max-h-full">
            <div class="relative bg-white rounded-lg shadow">

                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                    <h3 class="text-xl font-medium text-gray-900">
                        Masukkan kode yang telah dikirimkan ke email!
                    </h3>
                </div>

                <!-- Modal body -->
                <form @submit.prevent="verifyCode">
                    <div class="p-4 md:p-5 space-y-4 max-h-[620px] overflow-y-auto">
                        <input type="text" maxlength="6"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            v-model="emailConfirmationCode" required>
                    </div>

                    <!-- Modal footer -->
                    <div
                        class="flex items-center p-4 md:p-5 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b">
                        <button type="submit" :disabled="emailConfirmationCode.length != 6"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:cursor-not-allowed disabled:bg-opacity-40">
                            Konfirmasi
                        </button>
                    </div>
                </form>

            </div>
        </div>

    </div>

</template>
