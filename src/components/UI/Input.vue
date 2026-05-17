<script setup lang="ts">
defineProps<{
    placeholder?: string;
    required?: HTMLInputElement['required'];
    list?: string;
}>();

const value = defineModel();
</script>

<template>
    <input 
        type="text" 
        :placeholder
        class="w-full bg-base-800 px-6 py-4 rounded-md outline-none ring-1 ring-inset ring-base-600 focus:ring-base-300"
        v-model="value"
        :required
        :list />
</template>