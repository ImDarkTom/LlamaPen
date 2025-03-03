<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAllChatsStore } from '@/stores/allChats';
import { useRoute } from 'vue-router';
import ModelSelect from '@/components/ModelSelect/ModelSelect.vue';
import { useConfigStore } from '@/stores/config';
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
    <div class="w-full flex flex-row justify-center">
        <div
            class="w-full sm:w-full lg:w-3xl mx-1 mb-1 sm:mx-1 sm:mb-1 md:mx-4 md:mb-2 p-2 box-border flex flex-col items-center max-h-[48rem] relative bg-primary-400 rounded-xl border border-solid border-txt-1/50">
            <ScrollToBottomButton />
            <textarea ref="messageInput" v-model="messageInputValue" @keyup="inputKeyUp"
                placeholder="Enter a message..."
                class="w-full box-border text-base p-2 border-none outline-none resize-none overflow-y-auto break-words"></textarea>
            <div class="relative flex flex-row justify-between w-full">
                <ModelSelect direction="up" />
                <ActionButton :canGenerate="canGenerate" @startGeneration="startGeneration" />
            </div>
        </div>
    </div>
</template>