<script setup>
import DangerToast from './DangerToast.vue';
import SuccessToast from './SuccessToast.vue';

const props = defineProps({
    isSucces: {
        type: String,
        required: true
    },
    operation: {
        type: String,
        required: true
    },
});
</script>

<template>
    <SuccessToast v-if="props.isSucces == 'yes' && props.operation == 'post'" teks="Data Berhasil Ditambahkan!" />
    <SuccessToast v-else-if="props.isSucces == 'yes' && props.operation == 'update'" teks="Data Berhasil Diperbarui!" />
    <SuccessToast v-else-if="props.isSucces == 'yes' && props.operation == 'delete'" teks="Data Berhasil Dihapus!" />
    <DangerToast v-else-if="props.isSucces == 'no' && props.operation == 'post'" teks="Data Gagal Ditambahkan" />
    <DangerToast v-else-if="props.isSucces == 'no' && props.operation == 'update'" teks="Data Gagal Diperbarui" />
    <DangerToast v-else-if="props.isSucces == 'no' && props.operation == 'delete'" teks="Data Gagal Dihapus" />
</template>
