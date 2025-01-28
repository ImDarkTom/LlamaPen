<script setup lang="ts">
import ChatWindow from './components/ChatWindow.vue';

if (!localStorage.getItem('customUrl')) {
    localStorage.setItem('customUrl', 'http://localhost:11434');
    console.log("Set custom URL to default on first load.");
}

// TODO:
// Scroll down while message being generated
// Generated message options:
//   - Regenerate
//   - Copy text
//   - Cancel generation (while generating)
//   - Like/dislike button, perhaps by using the system role and sending a message saying the user liked/disliked the output(?)
// Fix parsing LaTeX and blocks from deepseek-r1 models
// Learn how to organise component files
// Settings UI (far, far later)

</script>

<template>
    <ChatWindow />
</template>

<style scoped></style>
