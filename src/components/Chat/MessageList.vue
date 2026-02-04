<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { emitter } from '@/lib/mitt';
import useUIStore from '@/stores/uiStore';
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

const { chatIsScrollingDown } = storeToRefs(useUIStore());

function openChat(newId: string | string[] | undefined, oldId?: string | string[] | undefined) {
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

    emitter.on('scrollToBottom', (args) => scrollToBottom(args));
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
    if (chatIsScrollingDown.value) {
        await nextTick();

        scrollToBottom({ force: true });
    }
});

function scrollToBottom(event: { force?: boolean } | undefined) {
    if (!messageListRef.value) {
        return;
    }

    if ((event && event.force) || chatIsScrollingDown.value) {
        const scrollPosition = messageListRef.value.scrollHeight;
        const scrollHeight = messageListRef.value.scrollHeight;

        // if (scrollPosition === scrollHeight) {
        //     return;
        // }
        // ^ this breaks scrolling

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
    chatIsScrollingDown.value = elementHeight < userScrolled + 25; // 25px padding
}

</script>

<template>
    <div v-if="openedChatMessages.length > 0"
        class="w-dvw sm:w-dvw md:w-auto flex justify-center overflow-y-auto overflow-x-hidden flex-1" ref="messageListRef"
        @scroll="handleScroll">
        <div 
            class="flex flex-col grow max-w-3xl" 
            :class="{ 'mt-14 md:mt-0': messagesStore.openedChatId !== null }">
            <ChatMessage
                v-for="message of openedChatMessages"
                class="last:pb-32"
                :message
                :key="message.id" />
        </div>
    </div>
    <ChatGreetingText v-else />
</template>
