<script setup lang="ts">
import { ImCancelCircle } from 'vue-icons-plus/im';
import { BiSolidSend } from 'vue-icons-plus/bi';
import { computed } from 'vue';
import useMessagesStore from '@/stores/messagesStore';
import { emitter } from '@/lib/mitt';
import logger from '@/lib/logger';

const messagesStore = useMessagesStore();

const isChatGenerating = computed<boolean>(() => {
    const lastestMessage = messagesStore.openedChatMessages[messagesStore.openedChatMessages.length - 1];

    if (!lastestMessage || lastestMessage.type !== 'model') {
        return false;
    }

    return lastestMessage.status === 'generating' || lastestMessage.status === 'waiting';
});

const emit = defineEmits(['startGeneration']);

const props = defineProps<{
    canGenerate: boolean,
}>();

function handleClick() {
    if (isChatGenerating.value) {
        logger.info('Action Button Component', 'Stopping chat generation...');
        emitter.emit('stopChatGeneration');
    } else {
        if (!props.canGenerate) {
            return;
        }

        emit('startGeneration');
    }
}

</script>

<template>
    <component :is="isChatGenerating ? ImCancelCircle : BiSolidSend"
        class="bg-primary text-background size-10 pointer-coarse:size-12 box-border p-2 pointer-coarse:p-3 rounded-lg cursor-pointer"
        :class="{ 'opacity-40 !cursor-default': !canGenerate && !isChatGenerating }" @click="handleClick" />
</template>