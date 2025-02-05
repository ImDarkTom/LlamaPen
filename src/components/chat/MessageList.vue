<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import ChatMessage from './ChatMessage.vue';
import { useAllChatsStore } from '../../stores/allChats';
import { useRoute } from 'vue-router';
import { emitter } from '../../mitt';
import { useUiStore } from '../../stores/uiStore';

const messageListRef = ref<HTMLElement | null>(null);

const route = useRoute();

const allChatStore = useAllChatsStore();
const uiStore = useUiStore();

watch(() => route.params.id, (newId, oldId) => {
    if (newId !== oldId) {
        allChatStore.setOpened(newId as string);
    }
});

onMounted(() => {
    allChatStore.setOpened(route.params.id as string);
    emitter.on('scrollToBottom', scrollToBottom);
});

onUnmounted(() => {
    emitter.off('scrollToBottom');
})

function scrollToBottom() {
    if (!messageListRef.value) {
        return;
    }

    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
}

allChatStore.$subscribe((_, _state) => {
    if (uiStore.chatList.isScrollingDown) {
        scrollToBottom();
    }
});

function handleScroll(_e: Event) {
    if (!messageListRef.value) {
        return;
    }
    
    const messageListElem = messageListRef.value;

    const elementHeight = messageListElem.scrollHeight;
    const userScrolled = messageListElem.scrollTop + messageListElem.clientHeight;

    uiStore.setScrollingDown(elementHeight < userScrolled + 25) // 25px padding
}
</script>

<template>
    <div class="message-list" ref="messageListRef" @scroll="handleScroll">
        <ChatMessage v-for="message of (allChatStore.openedChat?.messages || [])" :key="message.id" :message="message" />
    </div>
</template>

<style scoped>
.message-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    flex: 1;
    max-width: 48rem;
    width: 100%;
    margin: 0 auto;
}
</style>
