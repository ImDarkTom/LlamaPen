<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useConfigStore } from './stores/config';
import PopupLoader from './components/Popups/PopupLoader.vue';
import { useProviderManager } from './composables/useProviderManager';

const config = useConfigStore();
const { refreshConnection } = useProviderManager();

onBeforeMount(() => {
    config.loadTheme();
    config.loadTransitionSpeed();
    config.loadScrollbarSetting();
    refreshConnection();
});
</script>

<template>
    <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.layer === 'utility' ? 'layout-to-utility' : 'layout-to-chat'">
            <component 
                :is="Component"
                :key="route.meta.layout || 'default'"
                class="absolute inset-0 w-full h-full" />
        </transition>
    </router-view>
    <PopupLoader />
</template>