<script setup lang="ts">
import router from '@/lib/router';
import setPageTitle from '@/utils/core/setPageTitle';
import { computed, onMounted, ref, watch } from 'vue';
import logger from '@/lib/logger';
import { useProviderManager } from '@/composables/useProviderManager';
import type { ModelViewInfo } from '@/components/ModelsPage/types';
import { BiLoaderAlt } from 'vue-icons-plus/bi';

// todo(provider-separation): organise the components for this by provider,
// e.g. ollama/Viewer.vue, ollama/DownloadManager.vue, generic/Viewer.vue, etc.

// State
const { currentProvider, rawModels, getModel } = useProviderManager();

const selectedModel = ref<ModelViewInfo>({ state: 'unselected' });

const modelFromParams = computed<string | null>(() => {
    const modelParam = router.currentRoute.value.params.model;

    if (typeof modelParam === 'string') {
        return modelParam;
    } else if (Array.isArray(modelParam) && modelParam.length > 0) {
        return modelParam[0] ?? null;
    }

    return null;
});

// Helpers
const refreshModelList = async () => await currentProvider.value.loadModels(true);

// Hooks
onMounted(async () => {
    setPageTitle('Models');
    await refreshModelList();

    if (!modelFromParams.value) {
        selectedModel.value = { state: 'unselected' };
    } else if (modelFromParams.value === 'downloads') {
        return;
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

    try {
        const modelInfo = getModel(modelId);
        const attributes = await modelInfo.getAttributes();

        if (modelFromParams.value !== modelId) return; // user changed models

        const modelName = modelInfo.getDisplayName() || modelId;
        const capabilities = modelInfo.getCapabilities();

        selectedModel.value = {
            state: 'data',
            attributes,
            modelId,
            modelName,
            capabilities,
        };
    } catch (e) {
        selectedModel.value = {
            state: 'error',
            message: e instanceof Error ? e.message : 'Unknown error',
        };
    }
}
</script>

<template>
    <div class="w-full h-full flex flex-col md:flex-row box-border overflow-y-auto gap-2 md:gap-0">
        <ModelsPageModelList
            :modelsList="rawModels"
            @refresh-model-list="refreshModelList" />

        <UIViewerContainer
            v-if="selectedModel.state === 'unselected'"
            class="flex items-center justify-center text-xl">
            Select a model from the sidebar to view its details.
        </UIViewerContainer>
        <UIViewerContainer
            v-else-if="selectedModel.state === 'loading'"
            class="flex items-center justify-center">
            <BiLoaderAlt class="animate-spin" />
        </UIViewerContainer>
        <UIViewerContainer
            v-else-if="selectedModel.state === 'error'"
            class="flex items-center justify-center">
            Error loading model details: <code>{{ selectedModel.message }}</code>
        </UIViewerContainer>
        <ModelsPageViewer
            v-else
            :modelFromParams
            :selectedModel />
    </div>
</template>
