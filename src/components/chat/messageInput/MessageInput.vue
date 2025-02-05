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
    <div>
        <div class="message-input-container">
            <ScrollToBottomButton />
            <textarea ref="messageInput" v-model="messageInputValue" @keyup="inputKeyUp" placeholder="Enter a message..."></textarea>
            <div class="footer">
                <ModelSelect />
                <ActionButton :canGenerate="canGenerate" @startGeneration="startGeneration"/>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
div {
    margin: auto;

    .message-input-container {
        margin: 1rem;
        padding: 0.5rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-height: 24rem;
        position: relative;

        background-color: var(--bg-2);
        border-radius: 1rem;
        border: 1px solid var(--txt-1);

        textarea {
            width: 48rem;
            box-sizing: border-box;
            font-size: 1rem;
            padding: 0.5rem;
            background-color: transparent;
            border: none;
            outline: none;
            resize: none;
            overflow-y: auto;
            word-wrap: break-word;
        }

        .footer {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
        }
    }
}
</style>
