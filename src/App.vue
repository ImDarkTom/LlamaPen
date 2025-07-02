<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useConfigStore } from './stores/config';

const configStore = useConfigStore();

onBeforeMount(() => {
    configStore.loadTheme();
    configStore.loadTransitionSpeed();
});
</script>

<template>
    <router-view></router-view>
</template>