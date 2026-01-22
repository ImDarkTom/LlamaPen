<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useConfigStore } from './stores/config';
import PopupLoader from './components/Popups/PopupLoader.vue';
import { useModelList } from './composables/useModelList';

const config = useConfigStore();
const { load: loadFromProvider } = useModelList();

onBeforeMount(() => {
    config.loadTheme();
    config.loadTransitionSpeed();
    config.loadScrollbarSetting();
    loadFromProvider();
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