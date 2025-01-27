<script setup lang="ts">
import { reactive, ref } from 'vue';

const messageInput = ref<HTMLTextAreaElement | null>(null);

let chatMessages = reactive<any[]>(JSON.parse(localStorage.getItem('messages') || "[]"));
/**
 * 
 * @param text Text to parse for command.
 * @returns  If a command has been ran.
 */
function handleCommands(text: string): boolean {
    switch (text) {
        case "/clear":
            localStorage.setItem("messages", "[]");
            return true;

        default:
            return false;
    }
}

function inputKeyUp(e: KeyboardEvent) {
    if (e.key !== 'Enter') {
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

    chatMessages.push({
        role: 'user',
        content: message,
    });

    fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        body: JSON.stringify({
            model: 'llama3.2:1b',
            messages: chatMessages,
            stream: false,
        })
    })
        .then(response => response.json())
        .then(response => {
            chatMessages.push(messageParser(response.message));
            localStorage.setItem('messages', JSON.stringify(chatMessages));
        });
}

/**
 * 
 * @param message Message from ai
 * @returns HTML output.
 */
function messageParser(message: any): string {
    // TODO use `marked` for md parsing
    return message;
}

defineExpose({
    chatMessages,
})

</script>

<template>
    <textarea ref="messageInput" @keyup="inputKeyUp" rows="1"></textarea>
</template>

<style scoped>
textarea {
    width: 100%;
    box-sizing: border-box;
    font-size: 1.2rem;
    padding: 1rem;
    margin: 1rem;
    border-radius: 1rem;
    resize: vertical;
    border: 1px solid white;
    min-height: 1rem;
}
</style>
