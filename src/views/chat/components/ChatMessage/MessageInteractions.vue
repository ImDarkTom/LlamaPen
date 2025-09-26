<script setup lang="ts">
import { ref } from 'vue';
import logger from '@/lib/logger';
import MessageInteractionButton from './MessageInteractionButton.vue';
import { BiBarChartAlt, BiCopy, BiInfoCircle, BiPencil, BiTrash } from 'vue-icons-plus/bi';
import useMessagesStore from '@/stores/messagesStore';

const props = defineProps<{
    message: ChatMessage;
    done: boolean;
}>();

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

function showGenStats() {
    const formatTime = (time: number) => (time/1_000_000_000).toFixed(2);
    const messageStats = (props.message as ModelChatMessage).stats!;
    let popupText = 'Generation Stats:';
    
    // Load
    if (messageStats.loadDuration) {
        popupText += `\nLoad duration: ${formatTime(messageStats.loadDuration)}s\n`;
    }

    // Prompt
    if (messageStats.promptEvalCount) {
        popupText += `\nPrompt tokens: ${messageStats.promptEvalCount}`;
    }

    if (messageStats.promptEvalDuration) {
        popupText += `\nPrompt processing: ${formatTime(messageStats.promptEvalDuration)}s\n`;
    }

    // Eval/generation
    if (messageStats.evalCount) {
        popupText += `\nResponse tokens: ${messageStats.evalCount}`;
    }

    if (messageStats.evalDuration) {
        popupText += `\nResponse generation: ${formatTime(messageStats.evalDuration)}s`;
    }

    if (messageStats.evalCount && messageStats.evalDuration) {
        popupText += `\nGeneration speed: ${(messageStats.evalCount/(messageStats.evalDuration/1_000_000_000)).toFixed(2)}tok/s`;
    }

    // Total
    if (messageStats.totalDuration) {
        popupText += `\n\nTotal time: ${formatTime(messageStats.totalDuration)}s`;
    }

    alert(popupText);
}
</script>

<template>
    <div class="flex flex-row gap-1.5"
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
    </div>
</template>