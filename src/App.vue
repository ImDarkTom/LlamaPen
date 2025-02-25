<script setup lang="ts">
import { onBeforeMount } from 'vue';
import apiClient from './utils/apiClient';

onBeforeMount(() => {
    const defaultUrl = 'http://localhost:11434';
    let apiUrl = localStorage.getItem('apiUrl');

    if (apiUrl === null) {
        localStorage.setItem('apiUrl', defaultUrl);
        apiUrl = defaultUrl;
    }

    apiClient.setBaseUrl(apiUrl);
});
</script>

<template>
    <router-view></router-view>
</template>