<script setup lang="ts">
import { computed } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiBrain, BiShow, BiWrench } from 'vue-icons-plus/bi';
import Unknown from '@/icons/unknown.svg';
import type { ModelViewInfo } from '../types';
import { useProviderManager, type ModelInfo } from '@/composables/useProviderManager';
import type { ModelCapabilities } from '@/providers/base/types';

const { getModelCapabilities } = useProviderManager();

const props = defineProps<{
    modelFromParams: string | null,
    selectedModel: ModelViewInfo,
}>();

const capabilityIcons: Record<keyof ModelCapabilities, IconType> = {
    'supportsFunctionCalling': BiWrench,
    'supportsReasoning': BiBrain,
    'supportsVision': BiShow,
};

function getModelValue<T>(
    fallback: T,
    loadingValue: T,
    extractor: (model: ModelInfo ) => T
): T {

    if (props.selectedModel.state === 'unselected'  || props.selectedModel.state === 'error') return fallback;
    if (props.selectedModel.state === 'loading') return loadingValue;
    
    if (props.selectedModel.type === 'generic') {
        return extractor(props.selectedModel.model);
    }
    
    return fallback;
}

const modelName = computed<string>(() =>
    getModelValue(props.modelFromParams || '', 'Loading...', m => m.displayName)
);

const capabilityToString: Record<keyof ModelCapabilities, string> = {
    supportsFunctionCalling: 'tools',
    supportsReasoning: 'thinking',
    supportsVision: 'vision',
};


const modelCapabilites = computed<string[]>(() => {
    const capabilities = getModelValue({
        supportsFunctionCalling: false,
        supportsReasoning: false,
        supportsVision: false,
    }, {
        supportsFunctionCalling: false,
        supportsReasoning: false,
        supportsVision: false,
    }, m => getModelCapabilities(m.info.id));


    return Object.entries(capabilities)
        .filter(([_, value]) => value)
        .map(([key]) => capabilityToString[(key as keyof ModelCapabilities)]) ?? [];
});

</script>

<template>
    <UIViewerContainer>
        <div class="text-2xl md:text-3xl mb-2 md:my-6 align-middle min-w-0 whitespace-normal">
            <IconModel :name="modelFromParams ?? 'Unknown'" class="size-8 md:size-14! inline mr-2" />

            <span class="text-base-100 font-bold mr-2">{{ modelName }}</span>
            <br>
            <span class="text-base-200 text-xl">{{ modelFromParams }}</span>
        </div>

        <ModelsPageCapabilitiesSkeleton v-if="selectedModel.state === 'loading'" />
        <ModelsPageCapabilitiesList
            v-else
            :model-capabilities="modelCapabilites" />
    </UIViewerContainer>
</template>