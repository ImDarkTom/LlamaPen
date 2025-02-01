<script setup lang="ts">
import { onMounted, ref } from 'vue';

const statusMessageText = ref("Waiting for Ollama...");
const statusMessageElem = ref<HTMLElement | null>(null);
const connectedToOllama = ref<boolean | null>(null);

onMounted(() => {
    fetch(`${localStorage.getItem('customUrl')}/`)
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
    <div class="status-text-wrapper">
        <span class="status-text" :class="{ 'ok': connectedToOllama === true, 'fail': connectedToOllama === false }">
            Ollama status:
            <span ref="statusMessageElem">{{ statusMessageText }}</span>
        </span>
    </div>
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
