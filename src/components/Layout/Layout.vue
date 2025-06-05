<script setup lang="ts">
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import PopupLoader from '../Popups/PopupLoader.vue';
</script>

<template>
    <Sidebar />
    <RouterView v-slot="{ Component }">
        <Transition name="page-switch" mode="out-in">
            <component :is="Component" />
        </Transition>
    </RouterView>
    <PopupLoader />
</template>