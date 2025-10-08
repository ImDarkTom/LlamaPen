<script setup lang="ts">
import router from '@/lib/router';
import { useConfigStore } from '@/stores/config';
import setPageTitle from '@/utils/core/setPageTitle';
import { computed, onMounted, ref, watch } from 'vue';
import ollamaRequest from '@/utils/ollamaRequest';
import ModelViewer from './components/ModelViewer.vue';
import ModelList from './components/ModelList.vue';
import { tryCatch } from '@/utils/core/tryCatch';
import ViewerContainer from './components/ViewerContainer.vue';
import { useModelList } from '@/composables/useModelList';
import DownloadManager from './components/DownloadManager.vue';
import logger from '@/lib/logger';

const config = useConfigStore();

// State
const { models: modelsList, load: loadModels } = useModelList();
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

// Helpers 
const refreshModelList = async () => await loadModels(true);

// Hooks
onMounted(async () => {
    setPageTitle('Models');
    refreshModelList();

    if (!modelFromParams.value) {
        selectedModel.value = { state: 'unselected' };
    } else if(modelFromParams.value === 'downloads') {
        return
    } else {
        setModelViewInfo(modelFromParams.value);
    }
});

watch(router.currentRoute, () => {
    logger.info('Models Page', 'Route changed, loading model info for:', modelFromParams.value);

    if (!modelFromParams.value) {
        selectedModel.value = { state: 'unselected' };
    } else if (modelFromParams.value === 'downloads') {
        return;
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
        isLoaded: modelsList.value.some(item => item.modelData.model === modelId && item.loadedInMemory)
    };
}

</script>

<template>
    <div class="w-full h-full flex flex-col md:flex-row box-border overflow-y-auto gap-2 md:gap-0">
        <ModelList
            :modelsList 
            @refresh-model-list="refreshModelList" />

        <ViewerContainer 
            v-if="selectedModel.state === 'unselected' && modelFromParams !== 'downloads'" 
            class="flex items-center justify-center text-xl" >
            {{ config.cloud.enabled ?
                'Model management is only available without API mode.' :
                'Select a model to view its details, or download a new model.' }}
        </ViewerContainer>
        <DownloadManager v-else-if="modelFromParams === 'downloads'" @refresh-model-list="refreshModelList" />
        <ModelViewer v-else :modelFromParams :selectedModel />
    </div>
</template>