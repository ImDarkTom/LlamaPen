<script setup lang="ts">
import MessageInput from './chat/messageInput/MessageInput.vue';
import MessageList from './chat/MessageList.vue';
</script>

<template>
    <div class="chat-window">
        <MessageList />
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
