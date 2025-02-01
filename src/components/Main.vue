<script setup lang="ts">
import ChatWindow from './ChatWindow.vue';
import Sidebar from './sidebar/Sidebar.vue';

if (!localStorage.getItem('customUrl')) {
    localStorage.setItem('customUrl', 'http://localhost:11434');
    console.log("Set custom URL to default on first load.");
}

// TODO:
// Thinking timer
// Generated message options:
//   - Regenerate
//   - Cancel generation (while generating)
//   - Like/dislike button, perhaps by using the system role and sending a message saying the user liked/disliked the output(?)
// Fix parsing LaTeX and blocks from deepseek-r1 models
// Learn how to organise component files
// Settings UI (far, far later)

</script>

<template>
    <Sidebar />
    <ChatWindow />
</template>

<style>
</style>
