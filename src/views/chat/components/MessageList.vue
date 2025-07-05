<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import ChatMessage from './ChatMessage.vue';
import { useRoute } from 'vue-router';
import { emitter } from '@/lib/mitt';
import { useUiStore } from '@/stores/uiStore';
import GreetingText from './GreetingText.vue';
import useMessagesStore from '@/stores/messagesStore';
import { storeToRefs } from 'pinia';
import logger from '@/lib/logger';
import setPageTitle from '@/utils/core/setPageTitle';
import useChatsStore from '@/stores/chatsStore';
import parseNumOrNull from '@/utils/core/parseNumOrNull';

const messageListRef = ref<HTMLElement | null>(null);

const route = useRoute();

const messagesStore = useMessagesStore();
const chatsStore = useChatsStore();

const { openedChatMessages } = storeToRefs(messagesStore);

const uiStore = useUiStore();

function openChat(newId: string | string[], oldId?: string | string[]) {
    if (newId !== oldId) {
        messagesStore.openChat(parseNumOrNull(newId));
    }

    if (!newId) {
        setPageTitle('Chat');
    } else {
        chatsStore.getChatTitle(parseInt(newId as string))
            .then(title => setPageTitle(`${title} | Chat`));
    }
}

watch(() => route.params.id, (newId, oldId) => openChat(newId, oldId));

onMounted(() => {
    logger.info('Message List Component', 'Mounted message list component');

    messagesStore.openChat(parseNumOrNull(route.params.id));

    if (!route.params.id) {
        setPageTitle('Chat');
    } else {
        chatsStore.getChatTitle(parseInt(route.params.id as string))
            .then(title => setPageTitle(`${title} | Chat`));
    }

    emitter.on('scrollToBottom', scrollToBottom);
    emitter.on('openChat', (id) => openChat(id))

    nextTick(() => {
        scrollToBottom({ force: true });
    });
});

onUnmounted(() => {
    emitter.off('scrollToBottom');
    emitter.off('openChat');
});

watch(() => openedChatMessages.value, async () => {
    if (uiStore.chat.isScrollingDown) {
        await nextTick();

        scrollToBottom({ force: true });
    }
});

function scrollToBottom(event: { force?: boolean } | undefined) {
    if (!messageListRef.value) {
        return;
    }

    if (event?.force || uiStore.chat.isScrollingDown) {
        const scrollPosition = messageListRef.value.scrollHeight;
        const scrollHeight = messageListRef.value.scrollHeight;

        if (scrollPosition === scrollHeight) {
            return;
        }

        logger.info('Message List Component', 'Scrolling to bottom', scrollPosition, scrollHeight);

        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
}

function handleScroll(_e: Event) {
    if (!messageListRef.value) {
        return;
    }

    const messageListElem = messageListRef.value;

    const elementHeight = messageListElem.scrollHeight;
    const userScrolled = messageListElem.scrollTop + messageListElem.clientHeight;

    // If scrolled more than 25px up.
    uiStore.chat.isScrollingDown = elementHeight < userScrolled + 25; // 25px padding
}

</script>

<template>
    <div v-if="openedChatMessages.length > 0"
        class="w-dvw sm:w-dvw md:w-auto flex justify-center overflow-y-auto flex-1" ref="messageListRef"
        @scroll="handleScroll">
        <div class="flex flex-col grow max-w-[48rem]">
            <ChatMessage v-for="message of openedChatMessages" :key="message.id" :message="message" />
        </div>
    </div>
    <GreetingText v-else />
</template>
