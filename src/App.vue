<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useApiStore } from './utils/apiClient';

const apiStore = useApiStore();

onBeforeMount(() => {
    const defaultUrl = 'http://localhost:11434';
    let apiUrl = localStorage.getItem('apiUrl');

    if (apiUrl === null) {
        localStorage.setItem('apiUrl', defaultUrl);
        apiUrl = defaultUrl;
    }

    apiStore.setBaseUrl(apiUrl);
});
</script>

<template>
    <router-view></router-view>
</template>