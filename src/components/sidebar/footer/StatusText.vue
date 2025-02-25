<script setup lang="ts">
import { onMounted, ref } from 'vue';
import apiClient from '../../../utils/apiClient';

// UI State
const statusMessageText = ref("Waiting for Ollama...");
const statusStillLoading = ref(true);

// Refs
const statusMessageElem = ref<HTMLElement | null>(null);

onMounted(async () => {
    const status = await apiClient.status;
    apiClient.refreshConnectionCheck(status);

    statusStillLoading.value = false;
    statusMessageText.value = status.errorMessage || status.message;
});
</script>

<template>  
    <div class="overflow-hidden overflow-ellipsis py-2">
        <span class="text-amber-400" :class="{ 'text-emerald-400': apiClient.connected, 'text-red-400': !apiClient.connected && !statusStillLoading }">
            Ollama status:
            <span ref="statusMessageElem" :title="statusMessageText">{{ statusMessageText }}</span>
        </span>
    </div>
</template>