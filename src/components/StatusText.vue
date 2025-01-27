<script setup lang="ts">
import { onMounted, ref } from 'vue';

const statusMessageText = ref("Waiting for Ollama...");
const statusMessageElem = ref<HTMLElement | null>(null);
const connectedToOllama = ref<boolean | null>(null);

onMounted(() => {
    fetch('http://localhost:11434/')
        .then(response => response.text())
        .then(response => {
            statusMessageText.value = response;
            connectedToOllama.value = true;
        })
        .catch((error) => {
            statusMessageText.value = error;
            connectedToOllama.value = false;
        })
});

</script>

<template>
    <span class="status-text" :class="{ 'ok': connectedToOllama === true, 'fail': connectedToOllama === false }">
        Ollama status:
        <span ref="statusMessageElem">{{ statusMessageText }}</span>
    </span>
</template>

<style scoped>
.chat-window {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.status-text {
    color: yellow;
}

.status-text.ok {
    color: lime;
}

.status-text.fail {
    color: red;
}
</style>
