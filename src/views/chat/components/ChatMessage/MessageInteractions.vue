<script setup lang="ts">
import { computed, ref } from 'vue';
import logger from '@/lib/logger';
import MessageInteractionButton from './MessageInteractionButton.vue';
import { BiBarChartAlt, BiCopy, BiInfoCircle, BiPencil, BiTrash } from 'vue-icons-plus/bi';
import useMessagesStore from '@/stores/messagesStore';
import { useConfigStore } from '@/stores/config';

const props = defineProps<{
    message: ChatMessage;
    done: boolean;
}>();

const config = useConfigStore();

const emit = defineEmits(['editMessage']);

const copyTooltipText = ref<string>("Copy text");
function copyMessage() {
    const tempElem = document.createElement('input');
    tempElem.value = props.message.content;

    tempElem.select();
    tempElem.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(tempElem.value);

    copyTooltipText.value = "Copied!";
    setTimeout(() => {
        copyTooltipText.value = "Copy text";
    }, 1000);
}


function editMessage() {
    logger.info('Message Options Component', 'Edit message clicked.');

    emit('editMessage');
}

function deleteMessage() {
    if (!confirm('Are you sure you want to delete this message?')) return;

    useMessagesStore().deleteMessage(props.message.id);
}

function openInfo() {
    alert(JSON.stringify(props.message, null, 2));
}

const messageStats = computed(() => (props.message as ModelChatMessage).stats);

function showGenStats() {
    const formatTime = (time: number) => (time/1_000_000_000).toFixed(2);
    const messageStatsExisiting = messageStats.value!;
    let popupText = 'Generation Stats:';
    
    // Load
    if (messageStatsExisiting.loadDuration) {
        popupText += `\nLoad duration: ${formatTime(messageStatsExisiting.loadDuration)}s\n`;
    }

    // Prompt
    if (messageStatsExisiting.promptEvalCount) {
        popupText += `\nPrompt tokens: ${messageStatsExisiting.promptEvalCount}`;
    }

    if (messageStatsExisiting.promptEvalDuration) {
        popupText += `\nPrompt processing: ${formatTime(messageStatsExisiting.promptEvalDuration)}s\n`;
    }

    // Eval/generation
    if (messageStatsExisiting.evalCount) {
        popupText += `\nResponse tokens: ${messageStatsExisiting.evalCount}`;
    }

    if (messageStatsExisiting.evalDuration) {
        popupText += `\nResponse generation: ${formatTime(messageStatsExisiting.evalDuration)}s`;
    }

    if (messageStatsExisiting.evalCount && messageStatsExisiting.evalDuration) {
        popupText += `\nGeneration speed: ${(messageStatsExisiting.evalCount/(messageStatsExisiting.evalDuration/1_000_000_000)).toFixed(2)}tok/s`;
    }

    // Total
    if (messageStatsExisiting.totalDuration) {
        popupText += `\n\nTotal time: ${formatTime(messageStatsExisiting.totalDuration)}s`;
    }

    alert(popupText);
}
</script>

<template>
    <div class="flex flex-row gap-1.5 mt-0.5"
        :class="{ 'justify-end': message.type === 'user', 'justify-start': message.type !== 'user' }">
        <MessageInteractionButton v-if="done || message.type === 'user'" :text="copyTooltipText">
            <BiCopy class="size-full" title="Copy Text" @click="copyMessage" />
        </MessageInteractionButton>
        <MessageInteractionButton v-if="done || message.type === 'user'" text="Edit">
            <BiPencil class="size-full" title="Edit" @click="editMessage" />
        </MessageInteractionButton>
        <MessageInteractionButton v-if="done || message.type === 'user'" text="Delete">
            <BiTrash class="size-full" title="Delete" @click="deleteMessage" />
        </MessageInteractionButton>
        <MessageInteractionButton v-if="done && (message as ModelChatMessage).stats" text="Generation Stats">
            <BiBarChartAlt class="size-full" title="Generation Stats" @click="showGenStats" />
        </MessageInteractionButton>
        <MessageInteractionButton v-if="done" text="Raw Info">
            <BiInfoCircle class="size-full" title="Raw Info" @click="openInfo" />
        </MessageInteractionButton>
        <div v-if="done && messageStats?.evalCount && messageStats?.evalDuration && !config.chat.hideTPSInfoText" class="h-full flex items-center ml-1 text-text-muted/65 text-sm font-medium">
            {{ ((messageStats?.evalCount/(messageStats.evalDuration/1_000_000_000)).toFixed(2)) }}tok/s
        </div>
    </div>
</template>