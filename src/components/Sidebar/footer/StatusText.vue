<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useConfigStore } from '../../../stores/config';
import { useUiStore } from '../../../stores/uiStore';
import { emitter } from '../../../mitt';

const config = useConfigStore();
const uiStore = useUiStore();

// UI State
const statusMessageText = ref("Waiting for Ollama...");
const waitingForResponse = ref<boolean>(true);

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
            if (error instanceof TypeError) {
                statusMessageText.value = "Network error, is Ollama running?";
            } else {
                statusMessageText.value = error.message;
            }

            uiStore.setConnectedToOllama(false);
            emitter.emit('popup:ollamanotconnected');
        })
        .finally(() => {
            waitingForResponse.value = false;
        });
        
});

</script>

<template>
    <div v-if="!config.api.enabled" class="overflow-hidden overflow-ellipsis py-2 font-semibold">
        <span
            :class="{ 
                'text-amber-400': waitingForResponse,
                'text-emerald-400': uiStore.connectedToOllama && !waitingForResponse, 
                'text-red-400': !uiStore.connectedToOllama && !waitingForResponse
                }">
            Ollama status:
            <span class="font-normal" ref="statusMessageElem" :title="statusMessageText">{{ statusMessageText }}</span>
        </span>
    </div>
</template>