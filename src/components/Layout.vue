<script setup lang="ts">
import Popup from './Popup.vue';
import Sidebar from './sidebar/Sidebar.vue';
</script>

<template>
    <Sidebar />
    <RouterView />
    <Popup />
</template>