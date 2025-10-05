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
    <!-- <router-view></router-view> -->
    <router-view v-slot="{ Component, route }">
        <transition name="layout-fade">
            <component 
                :is="Component" 
                :key="route.meta.layout || 'default'"
                class="absolute inset-0 w-full h-full" />
        </transition>
    </router-view>
</template>