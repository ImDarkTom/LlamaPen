<script setup lang="ts">
import MessageInput from './MessageInput.vue';
import ChatMessages from './ChatMessages.vue';
</script>

<template>
    <div class="chat-window">
        <ChatMessages />
        <MessageInput />
    </div>
</template>

<style scoped>
.chat-window {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
</style>
