<script setup lang="ts">
import { ref } from 'vue';
import { useAllChatsStore } from '../stores/allChats';
import { useRoute } from 'vue-router';
import ModelSelect from './sidebar/ModelSelect.vue';
import { useConfigStore } from '../stores/config';

const route = useRoute();
const allChats = useAllChatsStore();
const config = useConfigStore();

const messageInput = ref<HTMLTextAreaElement | null>(null);

function inputKeyUp(e: KeyboardEvent) {
    updateTextAreaHeight();

    if (!messageInput.value) {
        return;
    }

    if (e.key !== 'Enter') {
        return;
    }

    if (e.shiftKey) {
        return;
    }

    const message = messageInput.value?.value.trim();

    if (!message || message == "") {
        return;
    }

    messageInput.value!.value = "";
    updateTextAreaHeight();

    const selectedModel = localStorage.getItem('selectedModel');

    if (!selectedModel) {
        throw new Error('No selected model found in localStorage.')
    }

    allChats.sendMessage(message, {
        chatId: route.params.id as string,
        requestUrl: config.apiUrl('/api/chat'),
        selectedModel: selectedModel,
    })
}

function updateTextAreaHeight() {
    messageInput.value!.style.height = "auto";
    messageInput.value!.style.height = (1 + messageInput.value!.scrollHeight) + "px";
}
</script>

<template>
    <div>
        <div class="message-input-container">
            <textarea ref="messageInput" @keyup="inputKeyUp" placeholder="Enter a message..."></textarea>
            <div class="footer">
                <ModelSelect />
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
            flex-direction: column;
            justify-content: start;
            width: 100%;
        }
    }
}
</style>
