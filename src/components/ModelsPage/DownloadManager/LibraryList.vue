<script setup lang="ts">
// import { useProviderManager } from '@/composables/useProviderManager';
import useOllamaModelLibraryStore from '@/stores/useOllamaModelLibrary';

const ollamaModelLibrary = useOllamaModelLibraryStore();
// const providerManager = useProviderManager();

const emit = defineEmits<{
    selectModel: [ string ];
}>();

const selectModel = (modelVariant: string) => emit('selectModel', modelVariant);

// const isModelDownloaded = (modelId: string) => providerManager.allModelIds.value.includes(modelId);
// :disabled="isModelDownloaded(`${model.model}:${size}`)"
// temporarilt taken out while we work out updating via checking timestamps

const searchQuery = ref('');
const searchQueryDebounced = refDebounced(searchQuery, 200);

const queriedModels = computed(() => {
    return ollamaModelLibrary.ollamaModels.filter((m) => m.model.includes(searchQueryDebounced.value));
});

</script>

<template>
    <div class="flex flex-col overflow-hidden">
        <UITextDivider text="Ollama Library" />
        <UIInput
            placeholder="Search for a model..."
            v-model="searchQuery" />

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
                <ModelsPageDownloadManagerLibraryListItem
                    v-for="model in queriedModels"
                    :model
                    :key="model.model"
                    @select-model="selectModel" />
            </ul>
        </div>
    </div>
</template>