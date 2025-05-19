<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useUiStore } from './stores/uiStore';
import { useConfigStore } from './stores/config';

const uiStore = useUiStore();
const configStore = useConfigStore();

onBeforeMount(() => {
    configStore.loadTransitionSpeed();
    
    const mode = localStorage.getItem('mode');

    if (mode === null || (mode !== 'chat' && mode !== 'note')) {
        uiStore.setMode('chat');
        return;
    }

    uiStore.setMode(mode);
});
</script>

<template>
    <router-view></router-view>
</template>