<script setup lang="ts">
import MessageInput from './chat/messageInput/MessageInput.vue';
import MessageList from './chat/MessageList.vue';
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <MessageList />
        <MessageInput />
    </div>
</template>
