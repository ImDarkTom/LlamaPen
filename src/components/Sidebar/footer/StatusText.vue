<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { emitter } from '../../../lib/mitt';
import { useModelList } from '@/composables/useModelList';
import OllamaIcon from '@/components/Icon/OllamaIcon.vue';
import { BiChevronDown } from 'vue-icons-plus/bi';

const { connectedToOllama, load, error, loading } = useModelList();

// UI State
const statusMessageText = ref("Waiting for Ollama...");
const moreInfoText = ref('Attempting to connect to Ollama...');

onMounted(async () => {
    await load();

    if (connectedToOllama.value) {
        statusMessageText.value = "Connected";
        moreInfoText.value = "Connected to Ollama!";
    } else if (error) {
        if (error.value === "NetworkError when attempting to fetch resource.") {
            statusMessageText.value = "Disconnected";
            moreInfoText.value = "Network error, is Ollama running?";
        } else {
            statusMessageText.value = "Unknown Error";
            moreInfoText.value = error.value || 'Unknown Error';
        }

        emitter.emit('openNotConnectedPopup');
    }
});

const expanded = ref(false);
function toggle() {
    expanded.value = !expanded.value;
}
</script>

<template>
    <div 
        class="overflow-hidden overflow-ellipsis p-1 rounded-md ring-1 cursor-pointer transition-colors duration-dynamic"
        :class="{ 
            'text-warning bg-warning/25 hover:bg-warning/35 ring-warning/50': loading,
            'text-success bg-success/25 hover:bg-success/35 ring-success/50': connectedToOllama && !loading, 
            'text-danger bg-danger/25 hover:bg-danger/35 ring-danger/50': !connectedToOllama && !loading
        }"
        @click="toggle">
        <div class="flex flex-row gap-2">
            <OllamaIcon class="inline size-6" />
            <span 
                class="font-medium" 
                :class="{ 'animate-pulse': loading }"
                :title="statusMessageText"
                >{{ statusMessageText }}</span>
            <BiChevronDown class="inline ml-auto transition-transform duration-dynamic" :class="{ 'rotate-180': expanded }" />
        </div>
        <div v-if="expanded" class="mt-1">
            {{ moreInfoText }}
        </div>
    </div>
</template>