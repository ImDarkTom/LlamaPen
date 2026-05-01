<script setup lang="ts">
import { computed } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiBrain, BiHeadphone, BiMicrophone, BiReflectVertical, BiShow, BiText, BiWrench } from 'vue-icons-plus/bi';
import DOMPurify from 'dompurify';
import Unknown from '@/icons/unknown.svg';
import { useConfigStore } from '@/stores/config';
import type { ModelViewInfo } from '../types';
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

const capabilityDetails: Record<string, { icon: IconType, color: string, ring: string }> = {
    'completion': { 
        icon: BiText, color: 'bg-capability-completion/40', ring: 'ring-capability-completion' 
    },
    'tools': { 
        icon: BiWrench, color: 'bg-capability-tools/40', ring: 'ring-capability-tools' 
    },
    'thinking': { 
        icon: BiBrain, color: 'bg-capability-reasoning/40', ring: 'ring-capability-reasoning' 
    },
    'vision': { 
        icon: BiShow, color: 'bg-capability-vision/40', ring: 'ring-capability-vision' 
    },
    'insert': { 
        icon: BiReflectVertical, color: 'bg-capability-completion/40', ring: 'ring-capability-completion' 
    },
    'audio': { 
        icon: BiMicrophone, color: 'bg-capability-audio/40', ring: 'ring-capability-audio' 
    }
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
    <UIViewerContainer>
        <div class="text-2xl md:text-3xl mb-2 md:my-6 align-middle min-w-0 whitespace-normal">
            <IconModel :name="modelFromParams ?? 'Unknown'" class="size-8 md:size-14! inline mr-2" />

            <span class="text-base-100 font-bold mr-2">{{ modelName }}</span>
            <br>
            <span class="text-base-200 text-xl">{{ modelFromParams }}</span>
        </div>

        <ModelsPageCapabilitiesSkeleton v-if="selectedModel.state === 'loading'" />
        <div 
            v-else 
            role="list" 
            class="flex flex-row gap-2 overflow-auto">
            <div 
                v-for="capability in modelCapabilites" 
                role="listitem"
                class="flex flex-row items-center text-sm font-medium gap-1.5 text-base-300 p-2 rounded-lg ring-1 ring-inset select-none"
                :class="`${capabilityDetails[capability].color} ${capabilityDetails[capability].ring}`">
                <component 
                    :is="capabilityDetails[capability].icon ?? Unknown" 
                    class="size-4" />
                <span class="capitalize">{{ capability }}</span>
            </div>
        </div>

        <div class="relative">
            <div v-if="cloudEnabled" class="absolute w-full min-h-full bg-black/35 rounded-lg backdrop-blur-sm flex items-center justify-center text-lg shadow-sm">
                Info unavailable in Cloud mode.
            </div>
            <h2 class="text-xl md:text-3xl pt-4 pb-2 text-base-100">Info</h2>
            <ModelsPageInfoSection title="License" :content="sanitizeSection(modelLicense)" />
            <ModelsPageInfoSection title="Modelfile" :content="sanitizeSection(modelModelfile)" />
            <ModelsPageInfoSection title="Template" :content="sanitizeSection(modelTemplate)" />
            <ModelsPageInfoSection title="Details" :kv-list="(modelDetails as Record<string, any>)" />
            <ModelsPageInfoSection title="Model Info" :kv-list="modelInfo" />
        </div>
    </UIViewerContainer>
</template>