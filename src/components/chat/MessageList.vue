<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import ChatMessage from './ChatMessage.vue';
import { useAllChatsStore } from '../../stores/allChats';
import { useRoute } from 'vue-router';

const messageListRef = ref<HTMLElement | null>(null);
const scrollingDown = ref<Boolean>(false);

const route = useRoute();

const allChatStore = useAllChatsStore();

watch(() => route.params.id, (newId, oldId) => {
    if (newId !== oldId) {
        allChatStore.setOpened(newId as string);
    }
});

onMounted(() => {
    allChatStore.setOpened(route.params.id as string);
});

allChatStore.$subscribe((_, _state) => {
    if (!messageListRef.value) {
        return;
    }

    if (scrollingDown) {
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
        scrollingDown.value = true;
    } else {
        scrollingDown.value = false;
    }
}
</script>

<template>
    <div class="message-list" ref="messageListRef" @scroll="handleScroll">
        <ChatMessage v-for="message of allChatStore.openedAsOllama" :message="message" />
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
