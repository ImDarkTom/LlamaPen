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

    sendMessage(message);
}

function updateTextAreaHeight() {
    messageInput.value!.style.height = "auto";
    messageInput.value!.style.height = (1 + messageInput.value!.scrollHeight) + "px";
}

async function sendMessage(userMessage: string) {
    allChats.setOpened(route.params.id as string);
    allChats.initialise();

    allChats.addMessage('user', userMessage);
    const responseMessageId = allChats.addMessage('assistant', '');

    function handleChunk(value: Uint8Array) {
        const chunkText = new TextDecoder().decode(value).trim().split('\n');

        for (const chunk of chunkText) {
            const chunkJson = JSON.parse(chunk);

            const messageChunk = chunkJson.message.content;
            allChats.modifyMessage(responseMessageId, messageChunk, 'append');
        }
    }

    const response = await fetch(config.apiUrl('/api/chat'), {
        method: 'POST',
        body: JSON.stringify({
            model: localStorage.getItem('selectedModel'),
            messages: allChats.openedAsOllama,
            stream: true,
        })
    });

    const reader = response.body?.getReader();

    while (true) {
        const { done, value } = await reader!.read();

        if (done) {
            allChats.saveToLocalStorage();
            return;
        }

        handleChunk(value);
    }
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
