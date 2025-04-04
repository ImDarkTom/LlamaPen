<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ChatMessage from './ChatMessage.vue';
import { useAllChatsStore } from '@/stores/allChats';
import { useRoute } from 'vue-router';
import { emitter } from '@/mitt';
import { useUiStore } from '@/stores/uiStore';
import GreetingText from './GreetingText.vue';

const messageListRef = ref<HTMLElement | null>(null);

const route = useRoute();

const allChatStore = useAllChatsStore();
const uiStore = useUiStore();

watch(() => route.params.id, (newId, oldId) => {
    if (newId !== oldId) {
        allChatStore.setOpened(newId as string);
        uiStore.setLastOpenedChat(route.params.id as string);
    }
});

onMounted(() => {
    allChatStore.setOpened(route.params.id as string);
    uiStore.setLastOpenedChat(route.params.id as string);
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

const displayedMessages = computed<AppMessage[]>(() => {
    return allChatStore.openedChat?.messages || [];
})
</script>

<template>
    <div v-if="displayedMessages.length > 0" class="w-dvw sm:w-dvw md:w-auto flex justify-center overflow-y-auto flex-1"
        ref="messageListRef" @scroll="handleScroll">
        <div class="flex flex-col grow max-w-[48rem]">
            <ChatMessage v-for="message of (displayedMessages)" :key="message.id" :message="message" />
        </div>
    </div>
    <GreetingText v-else />
</template>
