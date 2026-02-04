<script setup lang="ts">
import { BiEdit } from 'vue-icons-plus/bi';
import { computed, onMounted, watch } from 'vue';
import useMessagesStore from '@/stores/messagesStore';
import { emitter } from '@/lib/mitt';

const messagesStore = useMessagesStore();

onMounted(() => {
    emitter.emit('focusInputBar');
});

const shouldShowNewChatButton = computed(() => messagesStore.openedChatId !== null);

watch(() => messagesStore.openedChatId, 
    () => emitter.emit('focusInputBar')
);
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <div>
            <RouterLink to="chat" v-if="shouldShowNewChatButton">
                <div class="absolute top-0 right-2 h-12 w-12 p-2 z-25 md:hidden">
                    <div 
                        class="size-10 p-1.5 cursor-pointer rounded-lg text-text bg-background-light hover:bg-surface hover:shadow-md shadow-background-dark transition-all duration-dynamic" 
                        aria-label="New Chat">
                        <BiEdit class="size-full" />
                    </div>
                </div>
            </RouterLink>
        </div>
        <div class="w-full h-full md:h-full flex flex-col">
            <ChatMessageList />
            <ChatMessageInput />
        </div>
    </div>
</template>
