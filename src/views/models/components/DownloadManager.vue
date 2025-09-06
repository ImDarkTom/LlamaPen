<script setup lang="ts">
import logger from '@/lib/logger';
import ollamaRequest from '@/utils/ollamaRequest';
import { streamChunks } from '@/utils/streamChunks';
import { ref } from 'vue';
import ViewerContainer from './ViewerContainer.vue';
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import { BsCloudDownload } from 'vue-icons-plus/bs';
import PrimaryButton from '@/components/Buttons/PrimaryButton.vue';
import { ImCancelCircle } from 'vue-icons-plus/im';

const emit = defineEmits<{
    refreshModelList: [];
}>();

const modelInputValue = ref<string>('');

// example chunk:
// const downloadChunks = ref<Record<string, OllamaPullResponseChunk>>({
//     'deepseek granite-embedding:30m': {
//         status: "pulling 27d24c87a53d",
//         digest: "sha256:27d24c87a53d110b95abecbff83f966206857a9dc0ba1efd336d08dbd0afc833",
//         total: 62523136,
//         completed: 9641984
//     }
// });

const controllerMap: Map<string, AbortController> = new Map();

const downloadChunks = ref<Record<string, OllamaPullResponseChunk>>({});
async function downloadModel() {
    if (!modelInputValue.value) return;

    const modelName = modelInputValue.value;
    if (!modelName) {
        return;
    }

    const abortController = new AbortController();
    const { data: request, error } = await ollamaRequest('/api/pull', 'POST', {
        model: modelName,
    }, { signal: abortController.signal });

    if (error) {
        alert(`Error downloading model: ${error.message}`);
        return;
    }

    controllerMap.set(modelName, abortController);

    for await (const { error, chunk } of streamChunks<OllamaPullResponseChunk>(request)) {
        if (error) {
            if (error.message === 'userRequestCancel') {
                delete downloadChunks.value[modelName];
                return;
            }
            
            alert(`Error downloading model: ${error.message}`);
            return;
        }

        downloadChunks.value[modelName] = chunk;

        if (chunk.error) {
            alert(`Error downloading model (chunk error): ${chunk.error}`);
            delete downloadChunks.value[modelName];
            return;
        }

        if (chunk.status === 'success') {
            logger.info('Models Page', `Model ${modelName} downloaded successfully.`);
            delete downloadChunks.value[modelName];
            emit('refreshModelList');
        }
    }
}

function cancelDownload(model: string) {
    if (!downloadChunks.value[model]) return;

    const abortController = controllerMap.get(model);
    abortController?.abort('userRequestCancel');
}

</script>

<template>
    <ViewerContainer class="flex flex-col gap-2">
        <form 
            class="flex flex-row gap-2 w-full"
            @submit.prevent="downloadModel">
            <input 
                type="text" 
                placeholder="Model tag (e.g. gemma3:latest)"
                class="w-full bg-surface px-4 py-6 rounded-md text-lg"
                v-model="modelInputValue"
                required
                aria-label="Model ID input">
            <button
                type="submit"
                class="bg-primary hover:bg-secondary transition-all duration-dynamic hover:duration-0 text-background p-4 rounded-md text-lg w-fit cursor-pointer" >
                <span class="whitespace-normal md:whitespace-nowrap">
                    <BsCloudDownload class="inline mr-2 align-middle" /> 
                    <span class="align-middle">Start Download</span>
                </span>
            </button>
        </form>

        <div
            v-if="Object.keys(downloadChunks).length !== 0"
            class="flex flex-col gap-2">
            <div v-for="(status, modelName) in downloadChunks"
                class="p-4 rounded-md flex flex-col gap-4 bg-surface" >
                <div class="flex flex-row gap-4">
                    <ModelIcon :name="modelName" class="size-12" />

                    <div class="flex flex-col gap-2 w-full">
                        <div class="text-text text-xl">
                            {{ modelName }}
                        </div>
                        <div class="text-sm flex flex-col gap-1">
                            <span>
                                {{ status.status }}
                            </span>
                            <span class="flex flex-row gap-1 justify-between">
                                <span>{{ status.completed ? `${(status.completed / 1024 / 1024).toFixed(2)}
                                    MB/${((status.total ??
                                        0) / 1024 / 1024).toFixed(2)} MB` : 'Waiting...' }}</span>
                                <span>{{ Math.round((status.completed ? status.completed / (status.total ?? 0) : 0) * 100)
                                    }}%</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div>
                    <progress
                        class="bg-background w-full h-8 rounded-md"
                        :max="status.total" 
                        :value="status.completed">32%</progress>
                    <PrimaryButton text="Cancel " :icon="ImCancelCircle" @click="cancelDownload(modelName)" />
                </div>
            </div>
        </div>
        <div 
            v-else
            class="text-center mt-8">
            No models currently downloading
        </div>
    </ViewerContainer>
</template>