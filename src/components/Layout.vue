<script setup lang="ts">
import Sidebar from './sidebar/Sidebar.vue';
import NotConnectedPopup from './ui/popups/NotConnectedPopup.vue';
</script>

<template>
    <Sidebar />
    <RouterView />
    <!-- todo: have it load all custom popups with one component -->
    <NotConnectedPopup />
</template>