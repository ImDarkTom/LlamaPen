<script setup lang="ts">
import CustomUrlButton from './components/CustomUrlButton.vue';

</script>

<template>
    <div class="w-full h-full flex flex-col py-4 px-12 box-border">
        <h1 class="text-4xl font-extrabold">Settings</h1>
        <h2 class="text-2xl font-bold mb-2">Ollama</h2>
        <h3 class="text-xl font-semibold">Ollama URL</h3>
        <CustomUrlButton />
    </div>
</template>
