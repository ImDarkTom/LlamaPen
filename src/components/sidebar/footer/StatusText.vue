<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConfigStore } from '../../../stores/config';
import { useUiStore } from '../../../stores/uiStore';

const config = useConfigStore();
const uiStore = useUiStore();

// UI State
const statusMessageText = ref("Waiting for Ollama...");

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
            uiStore.setConnectedToOllama(true);
        })
        .catch((error) => {
            statusMessageText.value = error;
            uiStore.setConnectedToOllama(false);
        })
});

</script>

<template>  
    <div class="overflow-hidden overflow-ellipsis py-2">
        <span class="text-amber-400" :class="{ 'text-emerald-400': uiStore.connectedToOllama, 'text-red-400': !uiStore.connectedToOllama }">
            Ollama status:
            <span ref="statusMessageElem" :title="statusMessageText">{{ statusMessageText }}</span>
        </span>
    </div>
</template>