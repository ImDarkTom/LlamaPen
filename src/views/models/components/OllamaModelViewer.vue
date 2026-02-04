<script setup lang="ts">
import { computed } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiBrain, BiReflectVertical, BiShow, BiSkipNext, BiWrench } from 'vue-icons-plus/bi';
import DOMPurify from 'dompurify';
import Unknown from '@/icons/unknown.svg';
import InfoSection from './InfoSection.vue';
import CapabilitiesSkeleton from './CapabilitiesSkeleton.vue';
import ViewerContainer from './ViewerContainer.vue';
import { useConfigStore } from '@/stores/config';
import type { ModelViewInfo } from './types';
import type { ShowResponse, ModelDetails } from 'ollama/browser';

const config = useConfigStore();

const cloudEnabled = computed(() => config.cloud.enabled);

const props = defineProps<{
    modelFromParams: string | null,
    selectedModel: ModelViewInfo,
}>();

// Model actions
function sanitizeSection(text: string | null) {
    return DOMPurify.sanitize(text ?? '')
}

const capabilityIcons: Record<string, IconType> = {
    'completion': BiSkipNext,
    'tools': BiWrench,
    'thinking': BiBrain,
    'vision': BiShow,
    'insert': BiReflectVertical
};

function getModelValue<T>(
    fallback: T,
    loadingValue: T,
    extractor: (model: ShowResponse & { model_info: Record<string, any> }) => T
): T {

    if (props.selectedModel.state === 'unselected'  || props.selectedModel.state === 'error') return fallback;
    if (props.selectedModel.state === 'loading') return loadingValue;
    
    if (props.selectedModel.type === 'ollama') {
        return extractor(props.selectedModel.model);
    }
    
    return fallback;
}

const modelName = computed<string>(() =>
    getModelValue(props.modelFromParams || '', 'Loading...', m => m.model_info['general.basename'] || props.modelFromParams || '')
);

const modelCapabilites = computed(() =>
    getModelValue([], [], m => m.capabilities)
);

const modelLicense = computed(() =>
    getModelValue('', 'Loading license...', m => m.license)
);

const modelModelfile = computed(() =>
    getModelValue('', 'Loading modelfile...', m => m.modelfile)
);

const modelTemplate = computed(() =>
    getModelValue('', 'Loading template...', m => m.template)
);

const modelDetails = computed(() =>
    getModelValue<ModelDetails>({
        families: [],
        family: '',
        format: '',
        parameter_size: '',
        parent_model: '',
        quantization_level: '',
    }, {
        families: ['Loading...'],
        family: 'Loading...',
        format: 'Loading...',
        parameter_size: 'Loading...',
        parent_model: 'Loading...',
        quantization_level: 'Loading...',
    }, m => m.details)
);

const modelInfo = computed(() =>
    getModelValue<Record<string, any>>({}, {}, m => m.model_info)
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
            <div v-for="capability in modelCapabilites" role="listitem"
                class="flex flex-row bg-secondary text-background-light p-2 rounded-lg">
                <component :is="capabilityIcons[capability] ?? Unknown" class="size-6 p-1" />
                <span class="capitalize">{{ capability }}</span>
            </div>
        </div>

        <div class="relative">
            <div v-if="cloudEnabled" class="absolute w-full min-h-full bg-black/35 rounded-lg backdrop-blur-sm flex items-center justify-center text-lg shadow-sm">
                Info unavailable in Cloud mode.
            </div>
            <h2 class="text-xl md:text-3xl pt-4 pb-2 text-text">Info</h2>
            <InfoSection title="License" :content="sanitizeSection(modelLicense)" />
            <InfoSection title="Modelfile" :content="sanitizeSection(modelModelfile)" />
            <InfoSection title="Template" :content="sanitizeSection(modelTemplate)" />
            <InfoSection title="Details" :kv-list="(modelDetails as Record<string, any>)" />
            <InfoSection title="Model Info" :kv-list="modelInfo" />
        </div>
    </ViewerContainer>
</template>