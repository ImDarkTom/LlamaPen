<script setup lang="ts">
import Popup from './ui/Popup.vue';
import Sidebar from './sidebar/Sidebar.vue';
</script>

<template>
    <Sidebar />
    <RouterView />
    <Popup />
</template>