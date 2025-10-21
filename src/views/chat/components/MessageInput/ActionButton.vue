<script setup lang="ts">
import { BiSolidSend, BiStop, BiUpArrowAlt } from 'vue-icons-plus/bi';
import { computed } from 'vue';
import useMessagesStore from '@/stores/messagesStore';
import { emitter } from '@/lib/mitt';
import logger from '@/lib/logger';
import { useConfigStore } from '@/stores/config';

const messagesStore = useMessagesStore();
const config = useConfigStore();

defineProps<{
    canGenerate: boolean,
}>();

const emit = defineEmits(['startGeneration']);

const isChatGenerating = computed<boolean>(() => {
    const lastestMessage = messagesStore.openedChatMessages[messagesStore.openedChatMessages.length - 1];

    if (!lastestMessage || lastestMessage.type !== 'model') {
        return false;
    }

    return lastestMessage.status === 'generating' || lastestMessage.status === 'waiting';
});

const buttonIcon = computed(() => {
    if (isChatGenerating.value) {
        return BiStop;
    }

    if (config.ui.messageInput.sendButtonAltIcon) {
        return BiSolidSend;
    } else {
        return BiUpArrowAlt;
    }
});

function handleClick() {
    if (isChatGenerating.value) {
        logger.info('Action Button Component', 'Stopping chat generation...');
        emitter.emit('stopChatGeneration');
    } else {
        emit('startGeneration');
    }
}
</script>

<template>
    <component 
        :is="buttonIcon"
        class="bg-primary text-background size-10 shrink-0 box-border p-1.5 pointer-coarse:p-2 rounded-lg cursor-pointer"
        :class="{ 
            'opacity-40 !cursor-default': !canGenerate && !isChatGenerating, 
            'p-2': config.ui.messageInput.sendButtonAltIcon
        }"
        @click="handleClick" />
</template>