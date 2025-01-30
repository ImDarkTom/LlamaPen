<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '../stores/chat';
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

const messageListRef = ref<HTMLElement | null>(null);

const chatStore = useChatStore();

chatStore.$subscribe((_, _state) => {
    if (!messageListRef.value) {
        return;
    }

    if (chatStore.scrollingDown) {
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
});

function handleScroll(_e: Event) {
    if (!messageListRef.value) {
        return;
    }

    const messageListElem = messageListRef.value;

    const elementHeight = messageListElem.scrollHeight;
    const userScrolled = messageListElem.scrollTop + messageListElem.clientHeight;

    if (elementHeight < userScrolled + 25) { // 25 pixel padding
        chatStore.setScrollingDown(true);
    } else {
        chatStore.setScrollingDown(false)
    }
}
</script>

<template>
    <div class="message-list" ref="messageListRef" @scroll="handleScroll">
        <ChatMessage v-for="message of chatStore.getOllamaMessageList" :message="message" />
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
