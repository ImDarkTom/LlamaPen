<script setup lang="ts">
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import router from '@/router';
import { useConfigStore } from '@/stores/config';
import ollamaApi from '@/utils/ollama';
import setPageTitle from '@/utils/title';
import { Marked } from 'marked';
import { computed, onMounted, ref, watch } from 'vue';
import InfoSection from './components/InfoSection.vue';
import { useUiStore } from '@/stores/uiStore';
import ActionButton from './components/ActionButton.vue';
import ollamaRequest from '@/utils/request';
import logger from '@/utils/logger';
import { AiOutlineArrowLeft } from 'vue-icons-plus/ai';

const config = useConfigStore();

const modelList = ref<ModelList>([]);
const selectedModel = ref<OllamaModelInfoResponse | null>(null);

const modelFromRoute = computed<string | null>(() => router.currentRoute.value.params.model as string | null);

const modelPageMarked = new Marked();

const uiStore = useUiStore();

const refreshModelList = async () => {
    logger.info('Models Page', 'Refreshing model list');
    modelList.value = await ollamaApi.getModels(true);
};

onMounted(async () => {
    setPageTitle('Models');
    refreshModelList();
    loadModel(modelFromRoute.value);
});

watch(router.currentRoute, () => {
    loadModel(modelFromRoute.value);
});

async function loadModel(modelName: string | null) {
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
</script>

<template>
    <div class="w-full h-full flex flex-col md:flex-row gap-2 p-2 box-border overflow-y-auto"
        :class="{ 'pt-10': !config.showSidebar }">
        <div
            class="h-4/12 md:h-full w-full md:w-3/12 bg-primary-300 rounded-lg flex flex-col gap-2 p-2 overflow-y-auto">
            <RouterLink to="/"
                class="p-4 rounded-md flex flex-row items-center gap-2 font-semibold cursor-pointer select-none">
                <AiOutlineArrowLeft class="size-6" />
                Back to Chat/Notes
            </RouterLink>
            <div class="h-[1px] w-full bg-txt-2"></div>
            <div v-if="!uiStore.connectedToOllama">
                Not connected to Ollama
            </div>
            <div v-else-if="modelList.length === 0">
                No models found
            </div>
            <RouterLink v-else v-for="model in modelList" :to="`/models/${model.model}`"
                class="p-4 rounded-md flex flex-row items-center gap-2" exactActiveClass="!bg-primary-200">
                <ModelIcon :name="model.name ?? 'Unknown'" class="size-6" />
                {{ model.name }}
            </RouterLink>
        </div>
        <div v-if="!selectedModel">
            Select a model to view its details, or, download a new model.
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
            <div class="flex flex-row gap-2">
                <ActionButton type="normal" @click="copyModel">Copy Model</ActionButton>
                <ActionButton type="danger" @click="deleteModel">Delete Model</ActionButton>
            </div>

            <h2 class="text-3xl pt-4 pb-2">Info</h2>
            <InfoSection title="License">
                {{ modelPageMarked.parse(selectedModel?.license ?? '') }}
            </InfoSection>
            <InfoSection title="Modelfile">
                {{ modelPageMarked.parse(selectedModel?.modelfile ?? '') }}
            </InfoSection>
            <InfoSection title="Template">
                {{ modelPageMarked.parse(selectedModel?.template ?? '') }}
            </InfoSection>
            <InfoSection title="Details" :kv-list="selectedModel?.details" />
            <InfoSection title="Model Info" :kv-list="selectedModel?.model_info" />
        </div>
    </div>
</template>