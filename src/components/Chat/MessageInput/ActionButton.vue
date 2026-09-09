<script setup lang="ts">
import { BiSolidSend, BiStop, BiUpArrowAlt } from 'vue-icons-plus/bi';
import { computed } from 'vue';
import useMessagesStore from '@/stores/messagesStore';
import { emitter } from '@/lib/mitt';
import logger from '@/lib/logger';
import { useConfigStore } from '@/stores/useConfigStore';

const messagesStore = useMessagesStore();
const config = useConfigStore();

defineProps<{
    canGenerate: boolean;
}>();

const emit = defineEmits(['startGeneration']);

const isChatGenerating = computed<boolean>(() => {
    const lastestMessage = messagesStore.openedChatMessages[messagesStore.openedChatMessages.length - 1];

    if (!lastestMessage || lastestMessage.type !== 'model') {
        return false;
    }

    return messagesStore.isMessageGenerating(lastestMessage).generating;
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
    <button
        class="bg-primary rounded-lg not-disabled:cursor-pointer disabled:opacity-40 not-disabled:active:scale-98 not-disabled:hover:brightness-105"
        :disabled="!canGenerate && !isChatGenerating">
        <component
            :is="buttonIcon"
            class="size-10 shrink-0 box-border p-2 text-base-800"
            :class="{
                'p-2.5': config.ui.messageInput.sendButtonAltIcon,
            }"
            @click="handleClick" />
    </button>
</template>
