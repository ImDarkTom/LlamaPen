<script setup lang="ts">
import { emitter } from '@/mitt';
import { computed, onMounted, ref } from 'vue';

const lightboxOpen = ref(false);

const mimeType = ref<string>('image/png');
const imageBase64 = ref<string>('');

const imageSrc = computed(() => {
    return `data:${mimeType.value};base64,${imageBase64.value}`;
})

function openLightbox(imageB64: string, imageMime = "image/png") {
    imageBase64.value = imageB64;
    mimeType.value = imageMime;

    lightboxOpen.value = true;
}

function closeLightbox() {
    lightboxOpen.value = false;
}

onMounted(() => {
    emitter.on('openLightbox', (e) => {
        openLightbox(e.imageB64, e.imageMime);
    })
});

</script>

<template>
    <div v-if="lightboxOpen"
        class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-primary-700/35 z-100"
        @click="closeLightbox">
        <img class="max-h-screen p-4" :src="imageSrc" alt="Lightbox image">
    </div>
</template>