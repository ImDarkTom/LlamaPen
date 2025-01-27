<script setup lang="ts">
import ChatWindow from './components/ChatWindow.vue';

if (!localStorage.getItem('customUrl')) {
    localStorage.setItem('customUrl', 'http://localhost:11434');
    console.log("Set custom URL to default on first load.");
}

</script>

<template>
    <ChatWindow />
</template>

<style scoped></style>
