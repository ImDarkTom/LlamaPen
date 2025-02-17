<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAllChatsStore } from '../../../stores/allChats';
import { useRoute } from 'vue-router';
import ModelSelect from './ModelSelect.vue';
import { useConfigStore } from '../../../stores/config';
import ActionButton from './ActionButton.vue';
import ScrollToBottomButton from './ScrollToBottomButton.vue';

const route = useRoute();
const allChats = useAllChatsStore();
const config = useConfigStore();

const messageInput = ref<HTMLTextAreaElement | null>(null);
const messageInputValue = ref('');

const canGenerate = computed<boolean>(() => {
    return messageInputValue.value.trim() !== '';
});

function inputKeyUp(e: KeyboardEvent) {
    updateTextAreaHeight();

    if (!canGenerate) {
        return;
    }

    if (e.key !== 'Enter') {
        return;
    }

    if (e.shiftKey) {
        return;
    }

    startGeneration();
}

function startGeneration() {
    const message = messageInputValue.value.trim();

    messageInputValue.value = "";
    updateTextAreaHeight();

    const selectedModel = localStorage.getItem('selectedModel');

    if (!selectedModel) {
        throw new Error('No selected model found in localStorage.')
    }

    allChats.sendMessage(message, {
        chatId: route.params.id as string,
        requestUrl: config.apiUrl('/api/chat'),
        selectedModel: selectedModel,
    });
}

function updateTextAreaHeight() {
    messageInput.value!.style.height = "auto";
    messageInput.value!.style.height = (1 + messageInput.value!.scrollHeight) + "px";
}
</script>

<template>
    <div class="mx-auto">
        <div
            class="mx-4 mb-2 p-2 box-border flex flex-col items-center max-h-[48rem] relative bg-primary-400 rounded-xl border border-solid border-txt-1">
            <ScrollToBottomButton />
            <textarea ref="messageInput" v-model="messageInputValue" @keyup="inputKeyUp"
                placeholder="Enter a message..."
                class="w-[48rem] box-border text-base p-2 border-none outline-none resize-none overflow-y-auto break-words"></textarea>
            <div class="flex flex-row justify-between w-full">
                <ModelSelect />
                <ActionButton :canGenerate="canGenerate" @startGeneration="startGeneration" />
            </div>
        </div>
    </div>
</template>