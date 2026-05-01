<script setup lang="ts">
defineProps<{
    text: string;
}>();
</script>

<template>
    <div class="w-full flex items-center text-base-100">
        <h1 class="text-4xl font-extrabold pr-3">{{ text }}</h1>
        <div class="grow h-0.5 bg-base-100"></div>
    </div>
</template>