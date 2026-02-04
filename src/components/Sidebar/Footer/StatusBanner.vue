<script setup lang="ts">
import { ref, watch } from 'vue';
import { emitter } from '../../../lib/mitt';
import { BiChevronUp } from 'vue-icons-plus/bi';
import { useProviderManager } from '@/composables/useProviderManager';
import logger from '@/lib/logger';

const { isConnected, isLoading, connectionState } = useProviderManager();

const statusMessageText = ref("Waiting for Ollama...");
const moreInfoText = ref('Attempting to connect to Ollama...');
const expanded = ref(false);

watch(connectionState, (newState) => {
    logger.info('StausText Component', 'New provider connection status:', newState.status)
    switch (newState.status) {
        case 'checking':
            statusMessageText.value = 'Checking connection...';
            moreInfoText.value = 'Checking connection to Ollama...';
            break;
        case 'connected':
            statusMessageText.value = "Connected";
            moreInfoText.value = "Connected to Ollama!";
            break;
        case 'error':
            if (newState.error === "NetworkError when attempting to fetch resource.") {
                statusMessageText.value = "Disconnected";
                moreInfoText.value = "Network error, is Ollama running?";
            } else {
                statusMessageText.value = "Unknown Error";
                moreInfoText.value = newState.error || 'Unknown Error';
            }

            emitter.emit('openNotConnectedPopup');
            break;
        case 'disconnected':
        default:
            statusMessageText.value = 'Waiting for Ollama...';
            moreInfoText.value = 'Attempting to connect to Ollama...';
    }
}, { immediate: true });
</script>

<template>
    <div 
        class="overflow-hidden overflow-ellipsis p-1 rounded-md ring-1 cursor-pointer transition-colors duration-dynamic"
        :class="{ 
            'text-warning bg-warning/25 hover:bg-warning/35 ring-warning/50': isLoading,
            'text-success bg-success/25 hover:bg-success/35 ring-success/50': isConnected && !isLoading, 
            'text-danger bg-danger/25 hover:bg-danger/35 ring-danger/50': !isConnected && !isLoading
        }"
        @click="expanded = !expanded">
        <div class="flex flex-row gap-2">
            <IconOllama class="inline size-6" />
            <span 
                class="font-medium" 
                :class="{ 'animate-pulse': isLoading }"
                :title="statusMessageText"
                >{{ statusMessageText }}</span>
            <BiChevronUp class="inline ml-auto transition-transform duration-dynamic" :class="{ 'rotate-180': expanded }" />
        </div>
        <div v-if="expanded" class="mt-1">
            {{ moreInfoText }}
        </div>
    </div>
</template>