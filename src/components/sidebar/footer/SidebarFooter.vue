<script setup lang="ts">
import { RouterLink } from 'vue-router';
import CustomUrlButton from './CustomUrlButton.vue';
import StatusText from './StatusText.vue';
</script>

<template>
    <div class="flex flex-col max-w-full">
        <StatusText />
        <div class="flex flex-row gap-2">
            <RouterLink to="/guide" class="flex-1 p-0 m-0">
                <input type="button" class="w-full border-none px-1 py-0 m-0 box-border rounded-lg h-8 bg-primary-300 cursor-pointer hover:shadow-sm shadow-black hover:bg-primary-200" value="?">
            </RouterLink>
            <CustomUrlButton class="flex-1 border-none px-1 py-0 m-0 box-border rounded-lg h-8 bg-primary-300 cursor-pointer hover:shadow-sm shadow-black hover:bg-primary-200" />
        </div>
    </div>
</template>