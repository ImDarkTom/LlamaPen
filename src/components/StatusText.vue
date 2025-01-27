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

function showGuide() {
    const originUrl = window.location.origin;

    alert(`Ollama does not allow external connections by default, for this app to work you need to add this URL to Ollama's trusted origins and re-launch it. You can do this by running this in command prompt or powershell: \n\n set OLLAMA_ORIGINS=\"${originUrl}\" & ollama serve`);
}

</script>

<template>
    <span class="status-text" :class="{ 'ok': connectedToOllama === true, 'fail': connectedToOllama === false }">
        Ollama status:
        <span ref="statusMessageElem">{{ statusMessageText }}</span>
    </span>
    <input type="button" value="?" @click="showGuide">
</template>

<style scoped>
.status-text {
    color: yellow;
}

.status-text.ok {
    color: lime;
}

.status-text.fail {
    color: red;
}

input {
    background: transparent;
    color: var(--txt-accent);
    font-weight: bold;
    border: 1px solid var(--txt-accent);
    margin-left: 1rem;
    border-radius: 1rem;
    cursor: pointer;
}
</style>
