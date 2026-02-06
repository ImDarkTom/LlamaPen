<script setup lang="ts">
import setPageTitle from '@/utils/core/setPageTitle';
import { onMounted } from 'vue';

onMounted(() => setPageTitle('Page not found'))
</script>

<template>
    <div class="flex w-full min-h-svh items-center justify-center">
        <div class="mx-auto flex flex-col gap-4 items-center">
            <h2 class="text-4xl font-black text-text">Page not found</h2>
            <h3 >The page you are looking for does not exist or cannot be found.</h3>
            <ButtonPrimary
                type="link"
                to="/"
                text="Return home"
                class="py-2! px-3!" />
        </div>
    </div>
</template>