<script setup lang="ts">
import useDownloadsStore from '@/stores/useDownloadsStore';
import useOllamaModelLibraryStore from '@/stores/useOllamaModelLibrary';
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { refDebounced } from "@vueuse/core";

const downloadStore = useDownloadsStore();
const ollamaModelLibrary = useOllamaModelLibraryStore();
const router = useRouter();

ollamaModelLibrary.fetchOnce();

function selectModel(modelVariant: string) {
    downloadStore.inputValue = modelVariant;
    router.push('/models/downloads');
}

const searchQuery = ref('');
const searchQueryDebounced = refDebounced(searchQuery, 200);

const queriedModels = computed(() => {
    return ollamaModelLibrary.ollamaModels.filter((m) => m.model.includes(searchQueryDebounced.value));
});
</script>

<template>
    <div class="w-full h-full flex flex-col box-border overflow-y-auto gap-2 p-2">
        <UIInput
            placeholder="Search for a model..."
            v-model="searchQuery" />
        
        <p class="text-sm text-base-500">
            List does not include user-uploaded models. To view all models see
            <a 
                href="https://ollama.com/search" 
                target="_blank" 
                rel="noopener noreferrer"
                class="underline">ollama.com</a>.
        </p>

        <p class="text-sm text-base-500">
            Models ordered by newest. List is updated every 72 hours. 
        </p>

        <div class="w-full max-h-full overflow-auto p-2">
            <span 
                v-if="ollamaModelLibrary.status === 'loading' || ollamaModelLibrary.status === 'idle'">
                Loading...
            </span>
            <span 
                v-else-if="ollamaModelLibrary.status === 'error'">
                Error: {{ ollamaModelLibrary.error }}
            </span>
            <ul 
                v-else
                class="flex flex-col w-full max-w-prose mx-auto">
                <BrowsePageItem
                    v-for="model in queriedModels"
                    :model
                    :key="model.model"
                    @select-model="selectModel" />
            </ul>
        </div>
    </div>
</template>