<script setup lang="ts">
import { ref } from 'vue';
import { BiCloudDownload, BiStopCircle } from 'vue-icons-plus/bi';
import useDownloadsStore from '@/stores/useDownloadsStore';
import { storeToRefs } from 'pinia';
import type { ProgressResponse } from 'ollama';
import useOllamaModelLibraryStore from '@/stores/useOllamaModelLibrary';
import logger from '@/lib/logger';

const downloadsStore = useDownloadsStore();
const { progressChunks } = storeToRefs(downloadsStore)

const emit = defineEmits<{
    refreshModelList: [];
}>();

const modelInputValue = ref<string>('');
const downloadError = ref<string | null>(null);

async function downloadModel() {
    const modelName = modelInputValue.value;
    if (!modelName.trim()) {
        return;
    }

    const { success, reason } = await downloadsStore.downloadModel(modelName);
    if (!success && reason) {
        logger.error('Download Manager', `Failed to download model: ${reason}`);
        downloadError.value = reason;
    }

    // !success with no reason means the user cancelled, so we're ok

    emit('refreshModelList');
}

const getStatusText = (status: ProgressResponse) => 
    status.completed 
        ? `${(status.completed / 1024 / 1024).toFixed(2)}MB / ${((status.total ?? 0) / 1024 / 1024).toFixed(2)}MB` 
        : 'Waiting...';

const ollamaModelLibrary = useOllamaModelLibraryStore();
ollamaModelLibrary.fetchOnce();

const modelNames = computed(() => {
    if (ollamaModelLibrary.status !== 'done') return [];

    return ollamaModelLibrary.ollamaModels.flatMap(model => {
        const sizes = model.sizes.map(size => `${model.model}:${size}`);
        const cloud = model.hasCloud ? [`${model.model}:cloud`] : [];

        return [...sizes, ...cloud];
    })
});

const modelInput = ref<HTMLInputElement | null>(null);

function selectModel(modelVariant: string) {
    modelInputValue.value = modelVariant;
    modelInput.value?.focus();
}
</script>

<template>
    <UIViewerContainer class="grid not-md:grid-rows-2 md:grid-cols-2 gap-2">
        <div class="flex flex-col gap-2 w-full">
            <form 
                class="flex flex-row gap-2 w-full"
                @submit.prevent="downloadModel">
                <UIInput
                    placeholder="Model tag (e.g. gemma4:e2b)"
                    v-model="modelInputValue"
                    ref="modelInput"
                    required
                    aria-label="Model ID input"
                    list="model-suggestions" />
                <datalist id="model-suggestions">
                    <option
                        v-for="model in modelNames"
                        :key="model"
                        :value="model"></option>
                </datalist>

                <button
                    type="submit"
                    class="bg-base-700 hover:bg-base-600 transition-all duration-dynamic hover:duration-0 px-4 rounded-md text-lg w-fit cursor-pointer" >
                    <span class="whitespace-normal md:whitespace-nowrap">
                        <BiCloudDownload class="inline mr-2 align-middle" /> 
                        <span class="align-middle">Start</span>
                    </span>
                </button>
            </form>

            <p 
                v-if="downloadError"
                class="text-danger">
                {{ downloadError }}
            </p>

            <div class="flex flex-col gap-2">
                <div class="bg-base-800 p-2 rounded-lg">
                    <div
                        v-if="Object.keys(progressChunks).length !== 0"
                        class="flex flex-col gap-2">
                        <div 
                            v-for="(status, modelName) in progressChunks"
                            :key="modelName"
                            class="p-4 rounded-md flex flex-col gap-4 bg-base-700" >
                            <div class="flex flex-row gap-4">
                                <IconModel :name="modelName" class="size-12" />

                                <div class="flex flex-col gap-2 w-full">
                                    <div class="text-base-100 font-medium text-lg">
                                        {{ modelName }}
                                    </div>
                                    <div class="text-sm flex flex-col gap-1">
                                        <span>
                                            {{ status.status }}
                                        </span>
                                        <span class="flex flex-row gap-1 justify-between font-medium">
                                            <span>
                                                {{ getStatusText(status) }}
                                            </span>
                                            <span class="text-base-100">
                                                {{ Math.round((status.completed ? status.completed / (status.total ?? 0) : 0) * 100) }}%
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex flex-row gap-2">
                                <progress
                                    class="bg-base-800 w-full h-10 rounded-md"
                                    :max="status.total" 
                                    :value="status.completed"></progress>
                                <ButtonPrimary
                                    text="Cancel" 
                                    class="p-2!"
                                    :icon="BiStopCircle" 
                                    @click="downloadsStore.cancelDownload(modelName)" />
                            </div>
                        </div>
                    </div>
                    <div 
                        v-else
                        class="text-center text-sm font-medium">
                        No models currently downloading
                    </div>
                </div>
            </div>
        </div>

        <ModelsPageDownloadManagerLibraryList
            @select-model="selectModel" />
    </UIViewerContainer>
</template>