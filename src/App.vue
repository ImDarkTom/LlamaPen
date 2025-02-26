<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useUiStore } from './stores/uiStore';

const uiStore = useUiStore();

onBeforeMount(() => {
    const mode = localStorage.getItem('mode');

    if (mode === null || (mode !== 'chat' && mode !== 'textpad')) {
        uiStore.setMode('chat');
        return;
    }

    uiStore.setMode(mode);
});
</script>

<template>
    <router-view></router-view>
</template>