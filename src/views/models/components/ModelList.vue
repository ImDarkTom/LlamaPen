<script setup lang="ts">
import MemoryLoadIcon from '@/components/Icon/MemoryLoadIcon.vue';
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import { useModelList, type ModelInfoListItem } from '@/composables/useModelList';
import logger from '@/lib/logger';
import { useConfigStore } from '@/stores/config';
import ollamaRequest from '@/utils/ollamaRequest';
import { streamChunks } from '@/utils/streamChunks';
import { ref } from 'vue';
import { AiOutlineArrowLeft, AiOutlineDownload, AiOutlineSearch } from 'vue-icons-plus/ai';
import { BsEyeSlash } from 'vue-icons-plus/bs';

const config = useConfigStore();
const { connectedToOllama } = useModelList();

defineProps<{
    modelsList: ModelInfoListItem[],
}>();

const emit = defineEmits<{
    refreshModelList: [],
}>();

// example chunk:
// const downloadingModels = ref<Record<string, OllamaPullResponseChunk>>({
//     'granite-embedding:30m': {
//         status: "pulling 27d24c87a53d",
//         digest: "sha256:27d24c87a53d110b95abecbff83f966206857a9dc0ba1efd336d08dbd0afc833",
//         total: 62523136,
//         completed: 9641984
//     }
// });

const downloadingModels = ref<Record<string, OllamaPullResponseChunk>>({});
async function downloadModel() {
    const modelName = prompt('Enter model name and tag to download: ');
    if (!modelName) {
        return;
    }

    // todo: add an abortController to make this cancellable
    const { data: request, error } = await ollamaRequest('/api/pull', 'POST', {
        model: modelName,
    });

    if (error) {
        alert(`Error downloading model: ${error.message}`);
        return;
    }

    for await (const { error, chunk } of streamChunks<OllamaPullResponseChunk>(request)) {
        if (error) {
            alert(`Error downloading model: ${error.message}`);
            return;
        }

        logger.info('Models Page', `Downloading model ${modelName}`, chunk);
        downloadingModels.value[modelName] = chunk;

        if (chunk.error) {
            alert(`Error downloading model: ${chunk.error}`);
            delete downloadingModels.value[modelName];
            return;
        }

        if (chunk.status === 'success') {
            logger.info('Models Page', `Model ${modelName} downloaded successfully.`);
            delete downloadingModels.value[modelName];
            emit('refreshModelList');
        }
    }
}

</script>

<template>
    <div
        class="h-4/12 md:h-full w-full md:w-3/12 bg-background-light rounded-lg flex flex-col gap-2 p-2 relative"
        :class="{ 'cursor-not-allowed select-none overflow-hidden!': config.api.enabled }" >
            <!-- overlay -->
            <div v-if="config.api.enabled" class="w-full h-full absolute top-0 left-0 bg-black/50"></div>
            <RouterLink to="/"
                class="p-4 rounded-md flex flex-row items-center gap-2 font-semibold cursor-pointer hover:bg-surface! hover:text-text transition-colors duration-dynamic select-none">
                <AiOutlineArrowLeft class="size-6" />
                Back to Chat
            </RouterLink>

            <div class="h-[1px] w-full bg-border"></div>

            <div class="flex flex-col gap-2 overflow-y-auto">
                <form action="https://ollama.com/search" target="_blank" class="flex flex-row gap-2 items-center">
                    <input type="text" name="q" placeholder="Search ollama.com..." required
                        class="border-2 border-border-muted focus:border-border w-full rounded-lg h-6 box-content p-3 outline-0"
                        aria-label="Search Ollama models...">
                    <button type="submit" class="size-6 p-3 box-content rounded-lg bg-border-muted hover:bg-border cursor-pointer">
                        <AiOutlineSearch />
                    </button>
                </form>
                <button
                    class="text-background bg-primary enabled:hover:bg-secondary p-3 h-8 box-content rounded-lg enabled:cursor-pointer select-none flex flex-row justify-center items-center gap-2 disabled:opacity-75"
                    @click="downloadModel"
                    :disabled="!connectedToOllama">
                    <AiOutlineDownload />
                    Download
                </button>

                <div v-for="(status, modelName) in downloadingModels"
                    class="p-4 rounded-md flex flex-row items-center gap-2 bg-surface">
                    <ModelIcon :name="modelName" class="size-6" />
                    <div class="flex flex-col gap-2 w-full">
                        <div class="text-text">
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

                <div class="h-[1px] w-full bg-border"></div>

                <div v-if="!connectedToOllama">
                    Not connected to Ollama
                </div>
                <div v-else-if="modelsList.length === 0">
                    No models found
                </div>
                <RouterLink 
                    v-else-if="!config.api.enabled" 
                    v-for="{ modelData, loadedInMemory, hidden, displayName } in modelsList" 
                    class="p-4 rounded-md flex flex-row items-center gap-2 hover:bg-surface! hover:text-text transition-all duration-dynamic"
                    exactActiveClass="!bg-surface-light ring-2 ring-border ring-inset"
                    :to="`/models/${modelData.model}`" >
                    <ModelIcon :name="modelData.model ?? 'Unknown'" class="size-6" />

                    {{ displayName }}

                    <div class="grow"></div>

                    <Tooltip v-if="hidden" text="Loaded in memory"
                        class="flex items-center justify-center">
                        <BsEyeSlash class="h-full" />
                    </Tooltip>
                    <Tooltip v-if="loadedInMemory" text="Loaded in memory"
                        class="flex items-center justify-center">
                        <MemoryLoadIcon class="h-full" />
                    </Tooltip>
                </RouterLink>
            </div>
        </div>
</template>