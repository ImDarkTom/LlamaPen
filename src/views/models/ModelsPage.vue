<script setup lang="ts">
import router from '@/lib/router';
import { useConfigStore } from '@/stores/config';
import ollamaApi from '@/utils/ollama';
import setPageTitle from '@/utils/core/setPageTitle';
import { computed, onMounted, ref, watch } from 'vue';
import ollamaRequest from '@/utils/ollamaRequest';
import logger from '@/lib/logger';
import ModelViewer from './components/ModelViewer.vue';
import ModelList from './components/ModelList.vue';
import { tryCatch } from '@/utils/core/tryCatch';

const config = useConfigStore();

const modelsList = ref<ModelSidebarListItem[]>([]);
const selectedModel = ref<ModelViewInfo>({ state: 'unselected' });

const modelFromParams = computed<string | null>(() => {
    const modelParam = router.currentRoute.value.params.model;

    if (typeof modelParam === 'string') {
        return modelParam;
    } else if (Array.isArray(modelParam) && modelParam.length > 0) {
        return modelParam[0];
    } else {
        return null;
    }
});

async function refreshModelList() {
    logger.info('Models Page', 'Refreshing model list');
    const modelInfo = await ollamaApi.getModels(true);

    logger.info('Models Page', 'Refreshing loaded models');
    const loadedModels = await ollamaApi.getLoadedModelIds();

    modelsList.value = modelInfo.map((model) => {
        return {
            model,
            loadedInMemory: loadedModels.includes(model.model)
        };
    });
}

onMounted(async () => {
    setPageTitle('Models');

    refreshModelList();

    if (!modelFromParams.value) {
        selectedModel.value = { state: 'unselected' };
    } else {
        setModelViewInfo(modelFromParams.value);
    }
});

watch(router.currentRoute, () => {
    console.log('Route changed, loading model info for:', modelFromParams.value);

    if (!modelFromParams.value) {
        selectedModel.value = { state: 'unselected' };
    } else {
        setModelViewInfo(modelFromParams.value);
    }
});

async function setModelViewInfo(modelId: string) {
    selectedModel.value = { state: 'loading' };
    const { data: response, error: requestError } = await ollamaRequest('/api/show', 'POST', {
        model: modelId,
    });

    if (requestError) {
        selectedModel.value = { state: 'error', message: requestError.message }
        return;
    }

    if (response.status === 404) {
        selectedModel.value = { state: 'error', message: 'Model not found.' };
        return;
    } else if (!response.ok) {
        selectedModel.value = { state: 'error', message: await response.text() };
        return;
    }

    const { data: modelInfo, error: jsonParseError } = await tryCatch<OllamaModelInfoResponse>(response.json());
    if (jsonParseError) {
        selectedModel.value = { state: 'error', message: jsonParseError.message };
        return;
    }

    selectedModel.value = {
        state: 'data',
        model: modelInfo,
        isLoaded: modelsList.value.some(item => item.model.model === modelId && item.loadedInMemory)
    };
}

</script>

<template>
    <div class="w-full h-full flex flex-col md:flex-row gap-2 p-2 box-border overflow-y-auto"
        :class="{ 'pt-10': !config.showSidebar }">
        <ModelList
            :modelsList 
            @refresh-model-list="refreshModelList"
        />
        
        <div v-if="selectedModel.state === 'unselected'"
            class="h-8/12 md:h-full w-full md:w-9/12 bg-background-light rounded-lg p-2 flex items-center justify-center text-xl">
            {{ config.api.enabled ?
                'Model management is only available without API mode.' :
                'Select a model to view its details, or download a new model.' }}
        </div>
        <ModelViewer v-else
            :modelFromParams
            :selectedModel
            @refresh-model-list="refreshModelList"
        />
    </div>
</template>