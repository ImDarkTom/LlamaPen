<script setup lang="ts">
import Sidebar from '@/components/Sidebar/index.vue';
import NotConnectedPopup from '@/components/Popups/NotConnectedPopup.vue';
</script>

<template>
    <Sidebar />
    <RouterView />
    <!-- todo: have it load all custom popups with one component -->
    <NotConnectedPopup />
</template>