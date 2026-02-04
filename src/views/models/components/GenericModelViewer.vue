<script setup lang="ts">
import { computed } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiBrain, BiShow, BiWrench } from 'vue-icons-plus/bi';
import Unknown from '@/icons/unknown.svg';
import CapabilitiesSkeleton from './CapabilitiesSkeleton.vue';
import ViewerContainer from './ViewerContainer.vue';
import type { ModelViewInfo } from './types';
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

const modelCapabilites = computed<ModelCapabilities>(() =>
    getModelValue({
        supportsFunctionCalling: false,
        supportsReasoning: false,
        supportsVision: false,
    }, {
        supportsFunctionCalling: false,
        supportsReasoning: false,
        supportsVision: false,
    }, m => getModelCapabilities(m.info.id))
);
</script>

<template>
    <ViewerContainer>
        <div class="text-2xl md:text-3xl mb-2 md:my-6 align-middle min-w-0 whitespace-normal">
            <IconModel :name="modelFromParams ?? 'Unknown'" class="size-8 md:size-14! inline mr-2" />

            <span class="text-text font-bold mr-2">{{ modelName }}</span>
            <br>
            <span class="text-text-muted text-xl">{{ modelFromParams }}</span>
        </div>

        <CapabilitiesSkeleton v-if="selectedModel.state === 'loading'" />
        <div v-else role="list" class="flex flex-row gap-2">
            <div v-for="capability of Object.keys(modelCapabilites) as Array<keyof ModelCapabilities>" role="listitem"
                class="flex flex-row bg-secondary text-background-light p-2 rounded-lg">
                <component :is="capabilityIcons[capability] ?? Unknown" class="size-6 p-1" />
                <span class="capitalize">{{ capability }}</span>
            </div>
        </div>
    </ViewerContainer>
</template>