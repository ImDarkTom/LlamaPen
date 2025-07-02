<script setup lang="ts">
import { emitter } from '@/lib/mitt';
import { onMounted, ref } from 'vue';

const lightboxOpen = ref(false);

const imageSrc = ref<string>('');

function openLightbox(image: File | Blob) {
    imageSrc.value = URL.createObjectURL(image);

    lightboxOpen.value = true;
}

function closeLightbox() {
    lightboxOpen.value = false;
}

onMounted(() => {
    emitter.on('openLightbox', (e) => {
        openLightbox(e.image);
    })
});

</script>

<template>
    <div v-if="lightboxOpen"
        class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-background-dark/45 z-100"
        @click="closeLightbox">
        <img class="max-h-screen p-2 md:p-8 lg:p-16" :src="imageSrc" alt="Lightbox image">
    </div>
</template>