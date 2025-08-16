<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useConfigStore } from './stores/config';

const config = useConfigStore();

onBeforeMount(() => {
    config.loadTheme();
    config.loadTransitionSpeed();
    config.loadScrollbarSetting();
});
</script>

<template>
    <router-view></router-view>
</template>