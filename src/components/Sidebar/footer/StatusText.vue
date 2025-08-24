<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { emitter } from '../../../lib/mitt';
import { useModelList } from '@/composables/useModelList';

const { connectedToOllama, load, error, loading } = useModelList();

// UI State
const statusMessageText = ref("Waiting for Ollama...");

onMounted(async () => {
    await load();

    if (connectedToOllama.value) {
        statusMessageText.value = "Ollama is running";
    } else if (error) {
        if (error.value === "NetworkError when attempting to fetch resource.") {
            statusMessageText.value = "Network error, is Ollama running?";
        } else {
            statusMessageText.value = error.value || 'Unknown Error';
        }

        emitter.emit('popup:ollamanotconnected');
    }
});
</script>

<template>
    <div class="overflow-hidden overflow-ellipsis font-semibold">
        <span
            :class="{ 
                'text-warning': loading,
                'text-success': connectedToOllama && !loading, 
                'text-danger': !connectedToOllama && !loading
                }">
            Ollama status:
            <span class="font-normal" :title="statusMessageText">{{ statusMessageText }}</span>
        </span>
    </div>
</template>