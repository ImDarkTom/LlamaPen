<script setup lang="ts">
import { BiPencil } from 'vue-icons-plus/bi';
import MessageInput from './components/MessageInput/MessageInput.vue';
import MessageList from './components/MessageList.vue';
import useChatsStore from '@/stores/chatsStore';
import { onMounted, ref, watch } from 'vue';
import useMessagesStore from '@/stores/messagesStore';

const chatsStore = useChatsStore();
const messagesStore = useMessagesStore();
const chatTitle = ref<string | null>(null);

async function updateChatTitle() {
    const chatId = messagesStore.openedChatId;
    if (chatId) {
        chatTitle.value = await chatsStore.getChatTitle(Number(chatId));
    } else {
        chatTitle.value = null;
    }
}

onMounted(updateChatTitle);
watch(() => messagesStore.openedChatId, updateChatTitle);
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <div v-if="chatTitle" class="flex md:hidden flex-row h-15 shrink-0 p-1 items-center justify-center">
            <span class="max-w-[calc(100%-6rem)] line-clamp-1">{{ chatTitle }}</span>

            <!-- New Chat icon -->
            <RouterLink to="/chat">
                <div class="absolute top-0 right-2 h-12 w-12 p-2">
                    <div class="size-10 p-1.5 cursor-pointer rounded-lg text-text hover:bg-surface hover:shadow-md shadow-background-dark transition-all duration-dynamic"
                        aria-label="New Chat">
                        <BiPencil class="size-full" />
                    </div>
                </div>
            </RouterLink>
        </div>
        <div class="w-full h-[calc(100%-3.75rem)] md:h-full flex flex-col"
            :class="{'h-full': !chatTitle}">
            <MessageList />
            <MessageInput />
        </div>
    </div>
</template>
