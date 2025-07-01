<script setup lang="ts">
import router from '@/lib/router';
import { AiOutlineClose } from 'vue-icons-plus/ai';

defineProps<{
    text: string;
}>();

</script>

<template>
    <div class="relative w-full flex flex-row justify-between items-center">
            <h1 class="text-4xl font-extrabold mt-2 pr-3 bg-background text-text">{{ text }}</h1>
            <div class="w-full h-0.5 bg-text absolute top-1/2 translate-y-1/2 -z-1 rounded-full"></div>
            <div class="bg-background pl-2 box-border">
                <AiOutlineClose
                    class="size-10 hover:bg-background-light text-text hover:text-text-muted cursor-pointer rounded-full p-1 transition-colors duration-100"
                    @click="router.back()" />
            </div>
        </div>
</template>