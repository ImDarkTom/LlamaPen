<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useConfigStore } from './stores/useConfigStore';
import { useProviderManager } from './composables/useProviderManager';

const config = useConfigStore();
const { currentProvider } = useProviderManager();

onBeforeMount(() => {
    config.loadTheme();
    config.loadTransitionSpeed();
    config.loadScrollbarSetting();
    currentProvider.value.refreshConnection();
});
</script>

<template>
    <router-view v-slot="{ Component, route }">
        <component
            :is="Component"
            :key="route.meta.layout || 'default'"
            class="absolute inset-0 w-full h-full" />
    </router-view>
    <PopupLoader />
</template>
