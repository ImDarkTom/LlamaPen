<script setup lang="ts">
import ChatMessage from './ChatMessage.vue';

// const mockMessages = [
//     {
//         role: 'user',
//         content: 'what is 2 + 2?'
//     },
//     {
//         role: 'assistant',
//         content: 'The answer is 4.'
//     }
// ];

const props = defineProps<{
    chatMessages: OllamaMessage[];
}>();
</script>

<template>
    <div class="message-list">
        <ChatMessage v-for="message of props.chatMessages" :message="message" />
    </div>
</template>

<style scoped>
.message-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
}
</style>
