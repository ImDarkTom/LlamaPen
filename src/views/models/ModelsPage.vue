<script setup lang="ts">
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import router from '@/lib/router';
import { useConfigStore } from '@/stores/config';
import ollamaApi from '@/utils/ollama';
import setPageTitle from '@/utils/core/setPageTitle';
import { computed, onMounted, ref, watch } from 'vue';
import InfoSection from './components/InfoSection.vue';
import { useUiStore } from '@/stores/uiStore';
import ActionButton from './components/ActionButton.vue';
import ollamaRequest from '@/utils/ollamaRequest';
import logger from '@/lib/logger';
import { AiOutlineArrowLeft, AiOutlineDownload, AiOutlineSearch } from 'vue-icons-plus/ai';
import ModelLoadedIcon from '@/components/Icon/MemoryLoadIcon.vue';
import Tooltip from '@/components/Tooltip/Tooltip.vue';
import { Fa6Memory } from 'vue-icons-plus/fa6';
import { BsCopy, BsFillTrash3Fill } from 'vue-icons-plus/bs';
import MemoryUnloadIcon from '@/components/Icon/MemoryUnloadIcon.vue';
import { streamChunks } from '@/utils/streamChunks';
import { BiLinkExternal } from 'vue-icons-plus/bi';
import { simpleMarked } from '@/lib/marked';

const config = useConfigStore();

const modelList = ref<ModelList>([]);
const loadedModels = ref<string[]>([]);
const selectedModel = ref<OllamaModelInfoResponse | null>(null);

const modelFromRoute = computed<string | null>(() => router.currentRoute.value.params.model as string | null);

const uiStore = useUiStore();

const refreshModelList = async () => {
    logger.info('Models Page', 'Refreshing model list');
    modelList.value = await ollamaApi.getModels(true);
};

const refreshLoadedModels = async () => {
    logger.info('Models Page', 'Refreshing loaded models');
    loadedModels.value = await ollamaApi.getLoadedModelIds();
};

onMounted(async () => {
    setPageTitle('Models');

    refreshModelList();
    refreshLoadedModels();
    console.log('Loaded models:', loadedModels.value);

    loadModelInfo(modelFromRoute.value);
});

watch(router.currentRoute, () => {
    console.log('Route changed, loading model info for:', modelFromRoute.value);

    if (!modelFromRoute.value) {
        selectedModel.value = null;
        return;
    }

    loadModelInfo(modelFromRoute.value);
});

async function loadModelInfo(modelName: string | null) {
    if (!modelName) {
        return;
    }

    const { data: response, error } = await ollamaRequest('/api/show', 'POST', {
        model: modelName,
    });

    if (error) {
        return;
    }

    if (!response.ok) {
        // Ollama returns 404s for non-existent models.
        return;
    }

    selectedModel.value = await response.json() as OllamaModelInfoResponse;
}

// Model actions
async function copyModel() {
    const modelName = modelFromRoute.value;
    if (!modelName) {
        alert('No model selected to copy.');
        return;
    }

    const destination = prompt('Enter name for the new model copy:', `${modelName}-copy`);

    const { error } = await ollamaRequest('/api/copy', 'POST', {
        source: modelName,
        destination,
    });

    if (error) {
        alert(`Error copying model: ${error.message}`);
        return;
    }

    refreshModelList();
}

async function deleteModel() {
    const modelName = modelFromRoute.value;
    if (!modelName) {
        alert('No model selected to delete.');
        return;
    }

    if (!confirm(`Are you sure you want to delete the model "${modelName}"? This action cannot be undone.`)) {
        return;
    }

    const { error } = await ollamaRequest('/api/delete', 'DELETE', {
        model: modelName,
    });

    if (error) {
        alert(`Error deleting model: ${error.message}`);
        return;
    }

    selectedModel.value = null;
    refreshModelList();
}

const loadModelText = ref('Load Model');

async function loadModelIntoOllama() {
    const modelName = modelFromRoute.value;
    if (!modelName) {
        alert('No model selected to load.');
        return;
    }

    loadModelText.value = 'Loading...';

    const success = await ollamaApi.loadModelIntoMemory(modelName);

    if (!success) {
        alert(`Failed to load model "${modelName}".`);
        loadModelText.value = 'Load Model';
        return;
    }

    refreshLoadedModels();
}

async function unloadModel() {
    const modelName = modelFromRoute.value;
    if (!modelName) {
        alert('No model selected to unload.');
        return;
    }

    await ollamaApi.unloadModel(modelName);
    refreshLoadedModels();
}

// {
//     'granite-embedding:30m': {
//         status: "pulling 27d24c87a53d",
//         digest: "sha256:27d24c87a53d110b95abecbff83f966206857a9dc0ba1efd336d08dbd0afc833",
//         total: 62523136,
//         completed: 9641984
//     }
// }
const downloadingModels = ref<Record<string, OllamaPullResponseChunk>>({});
async function downloadModel() {
    const modelName = prompt('Enter model name and tag to download: ');
    if (!modelName) {
        return;
    }

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
            await refreshModelList();
            await refreshLoadedModels();
        }
    }
}

</script>

<template>
    <div class="w-full h-full flex flex-col md:flex-row gap-2 p-2 box-border overflow-y-auto"
        :class="{ 'pt-10': !config.showSidebar }">
        <div
            class="h-4/12 md:h-full w-full md:w-3/12 bg-primary-300 rounded-lg flex flex-col gap-2 p-2 overflow-y-auto relative"
            :class="{ 'cursor-not-allowed select-none overflow-hidden!': config.api.enabled }">
            <div v-if="config.api.enabled" class="w-full h-full absolute top-0 left-0 bg-primary-700 opacity-50">

            </div>
            <RouterLink to="/"
                class="p-4 rounded-md flex flex-row items-center gap-2 font-semibold cursor-pointer select-none">
                <AiOutlineArrowLeft class="size-6" />
                Back to Chat/Notes
            </RouterLink>

            <div class="h-[1px] w-full bg-txt-2"></div>

            <form action="https://ollama.com/search" target="_blank" class="flex flex-row gap-2 items-center">
                <input type="text" name="q" placeholder="Search ollama.com..." required
                    class="bg-primary-400 focus:bg-primary-500 w-full rounded-lg h-6 box-content p-3 outline-0"
                    aria-label="Search Ollama models...">
                <button type="submit" class="size-6 p-3 box-content rounded-lg bg-primary-200 cursor-pointer">
                    <AiOutlineSearch />
                </button>
            </form>
            <button
                class="bg-primary-200 p-3 h-8 box-content rounded-lg enabled:cursor-pointer select-none enabled:hover:brightness-90 flex flex-row justify-center items-center gap-2 disabled:opacity-75"
                @click="downloadModel"
                :disabled="!uiStore.connectedToOllama">
                <AiOutlineDownload />
                Download
            </button>

            <div v-for="(status, modelName) in downloadingModels"
                class="p-4 rounded-md flex flex-row items-center gap-2 bg-primary-200">
                <ModelIcon :name="modelName" class="size-6" />
                <div class="flex flex-col gap-2 w-full">
                    <div>
                        {{ modelName }}
                    </div>
                    <div class="text-txt-2 text-sm flex flex-col gap-1">
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

            <div class="h-[1px] w-full bg-txt-2"></div>

            <div v-if="!uiStore.connectedToOllama">
                Not connected to Ollama
            </div>
            <div v-else-if="modelList.length === 0">
                No models found
            </div>
            <RouterLink v-else v-for="model in modelList" :to="`/models/${model.model}`"
                class="p-4 rounded-md flex flex-row items-center gap-2 hover:bg-primary-200/50! transition-all duration-100"
                exactActiveClass="!bg-primary-200">
                <ModelIcon :name="model.name ?? 'Unknown'" class="size-6" />

                {{ model.name }}

                <div class="grow"></div>

                <Tooltip v-if="loadedModels.includes(model.model)" text="Loaded in memory"
                    class="flex items-center justify-center">
                    <ModelLoadedIcon class="h-full" />
                </Tooltip>
            </RouterLink>
        </div>
        <div v-if="!selectedModel"
            class="h-8/12 md:h-full w-full md:w-9/12 bg-primary-300 rounded-lg p-2 flex items-center justify-center text-xl">
            {{ config.api.enabled ?
                'Model management is only available without API mode.' :
                'Select a model to view its details, or, download a new model.' }}
        </div>
        <div v-else class="h-8/12 md:h-full w-full md:w-9/12 bg-primary-300 rounded-lg p-2 overflow-y-auto">
            <span class="flex flex-row gap-2 items-center">
                <ModelIcon :name="modelFromRoute ?? 'Unknown'" class="size-14 p-2" />
                <h1 class="font-bold">
                    {{ selectedModel?.model_info['general.basename'] ?? modelFromRoute }}
                    <span class="text-txt-2 font-normal">({{ modelFromRoute }})</span>
                </h1>
            </span>

            <h2 class="text-3xl pb-2 pt-4">Actions</h2>
            <div class="flex flex-row gap-2 overflow-x-auto">
                <a :href="`https://ollama.com/library/${modelFromRoute}`" target="_blank"
                    class="p-4 min-w-max rounded-lg cursor-pointer select-none flex items-center justify-center flex-row gap-2 bg-primary-200!">
                    <BiLinkExternal />
                    Open in Ollama Library
                </a>
                <ActionButton type="toggled" @click="unloadModel"
                    v-if="modelFromRoute && loadedModels.includes(modelFromRoute)">
                    <MemoryUnloadIcon /> Unload Model
                </ActionButton>
                <ActionButton type="normal" @click="loadModelIntoOllama" v-else>
                    <Fa6Memory /> {{ loadModelText }}
                </ActionButton>
                <ActionButton type="normal" @click="copyModel">
                    <BsCopy /> Copy/duplicate Model
                </ActionButton>
                <ActionButton type="danger" @click="deleteModel">
                    <BsFillTrash3Fill /> Delete Model
                </ActionButton>
            </div>

            <h2 class="text-3xl pt-4 pb-2">Info</h2>
            <InfoSection title="License">
                {{ simpleMarked.parse(selectedModel?.license ?? '') }}
            </InfoSection>
            <InfoSection title="Modelfile">
                {{ simpleMarked.parse(selectedModel?.modelfile ?? '') }}
            </InfoSection>
            <InfoSection title="Template">
                {{ simpleMarked.parse(selectedModel?.template ?? '') }}
            </InfoSection>
            <InfoSection title="Details" :kv-list="selectedModel?.details" />
            <InfoSection title="Model Info" :kv-list="selectedModel?.model_info" />
        </div>
    </div>
</template>