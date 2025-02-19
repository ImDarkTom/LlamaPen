<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConfigStore } from '../../../stores/config';

const config = useConfigStore();

// UI State
const statusMessageText = ref("Waiting for Ollama...");
const connectedToOllama = ref<boolean | null>(null);

// Refs

const statusMessageElem = ref<HTMLElement | null>(null);

onMounted(() => {
    fetch(config.apiUrl('/'))
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error when connecting to Ollama, code: ${response.status}`)
            }
            return response.text();
        })
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
    <div class="overflow-hidden overflow-ellipsis py-2">
        <span class="text-amber-400" :class="{ 'text-emerald-400': connectedToOllama === true, 'text-red-400': connectedToOllama === false }">
            Ollama status:
            <span ref="statusMessageElem" :title="statusMessageText">{{ statusMessageText }}</span>
        </span>
    </div>
</template>