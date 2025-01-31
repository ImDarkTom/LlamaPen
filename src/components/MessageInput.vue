<script setup lang="ts">
import { ref } from 'vue';
import { useAllChatsStore } from '../stores/allChats';
import { useRoute } from 'vue-router';

const route = useRoute();
const allChats = useAllChatsStore();

const messageInput = ref<HTMLTextAreaElement | null>(null);

/**
 * 
 * @param text Text to parse for command.
 * @returns  If a command has been ran.
 */
function handleCommands(text: string): boolean {
    switch (text) {
        case "/clear":
            localStorage.setItem("messages", "[]");
            location.reload();
            return true;

        default:
            return false;
    }
}

function inputKeyUp(e: KeyboardEvent) {
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

    if (handleCommands(message)) {
        return;
    }

    sendMessage(message);
}

async function sendMessage(userMessage: string) {
    allChats.setOpened(route.params.id as string);
    
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

    const response = await fetch(`${localStorage.getItem('customUrl')}/api/chat`, {
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
    <div class="message-input-container">
        <textarea ref="messageInput" @keyup="inputKeyUp" rows="1"
            placeholder="Enter a message (or clear with /clear)..."></textarea>
    </div>
</template>

<style scoped>
.message-input-container {
    display: flex;
}

textarea {
    width: 100%;
    box-sizing: border-box;
    font-size: 1.2rem;
    padding: 1rem;
    margin: 1rem;
    border-radius: 1rem;
    resize: vertical;
    border: 1px solid;
    min-height: 1rem;
    background: var(--bg-2);
    box-shadow: 0px 3px 10px -3px black;
}
</style>
