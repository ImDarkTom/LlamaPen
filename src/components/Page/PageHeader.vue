<script setup lang="ts">
import router from '@/lib/router';
import { AiOutlineClose } from 'vue-icons-plus/ai';

defineProps<{
    text: string;
}>();

</script>

<template>
    <div class="w-full flex items-center text-text">
        <h1 class="text-4xl font-extrabold pr-3">{{ text }}</h1>
        <div class="grow h-0.5 bg-text"></div>
        <div class="bg-background pl-2 box-border">
            <AiOutlineClose
                class="size-10 hover:bg-background-light hover:text-text-muted cursor-pointer rounded-full p-1 transition-colors duration-dynamic hover:duration-0"
                @click="router.back()" />
        </div>
    </div>
</template>