<script setup lang="ts">
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import ollamaApi from '@/utils/ollama';
import { computed, ref } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { AiOutlineVerticalAlignMiddle } from 'vue-icons-plus/ai';
import { BiBrain, BiLinkExternal } from 'vue-icons-plus/bi';
import { BsCopy, BsEye, BsFillTrash3Fill, BsTools } from 'vue-icons-plus/bs';
import { VscDebugContinue } from 'vue-icons-plus/vsc';
import DOMPurify from 'dompurify';
import Unknown from '@/icons/unknown.svg';
import ollamaRequest from '@/utils/ollamaRequest';
import ActionButton from './ActionButton.vue';
import { Fa6Memory } from 'vue-icons-plus/fa6';
import MemoryUnloadIcon from '@/components/Icon/MemoryUnloadIcon.vue';
import InfoSection from './InfoSection.vue';
import CapabilitiesSkeleton from './CapabilitiesSkeleton.vue';
import router from '@/lib/router';

const props = defineProps<{
    modelFromParams: string | null,
    selectedModel: ModelViewInfo,
}>();

const emit = defineEmits<{
    refreshModelList: [];
    setSelectedModel: [m: ModelViewInfo]
}>();

function refreshModelList() {
    emit('refreshModelList');
}

// Model actions
async function copyModel() {
    const modelName = props.modelFromParams;
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
    const modelName = props.modelFromParams;
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

    router.push('/models');
    refreshModelList();
}

const loadModelText = ref('Load Model');
async function loadModelIntoOllama() {
    const modelName = props.modelFromParams;
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

    loadModelText.value = 'Unload Model';
    refreshModelList()
}

async function unloadModel() {
    const modelName = props.modelFromParams;
    if (!modelName) {
        alert('No model selected to unload.');
        return;
    }

    await ollamaApi.unloadModel(modelName);
    loadModelText.value = 'Load Model';
    refreshModelList();
}

function sanitizeSection(text: string | null) {
    return DOMPurify.sanitize(text ?? '')
}

const capabilityIcons: Record<string, IconType> = {
    'completion': VscDebugContinue,
    'tools': BsTools,
    'thinking': BiBrain,
    'vision': BsEye,
    'insert': AiOutlineVerticalAlignMiddle
};

function getModelValue<T>(
    fallback: T,
    loadingValue: T,
    extractor: (model: OllamaModelInfoResponse) => T
): T {
    if (props.selectedModel.state === 'unselected'  || props.selectedModel.state === 'error') return fallback;
    if (props.selectedModel.state === 'loading') return loadingValue;
    return extractor(props.selectedModel.model);
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
    getModelValue<Record<string, unknown>>({}, {}, m => m.details)
);

const modelInfo = computed(() =>
    getModelValue<Record<string, unknown>>({}, {}, m => m.model_info)
);
</script>

<template>
    <div class="h-8/12 md:h-full w-full md:w-9/12 bg-background-light rounded-lg p-2 overflow-y-auto">
        <span class="flex flex-row gap-2 items-center">
            <ModelIcon :name="modelFromParams ?? 'Unknown'" class="size-14 p-2" />

            <h1 class="font-bold text-text">
                {{ modelName }}
                <span class="text-text-muted font-normal">({{ modelFromParams }})</span>
            </h1>
        </span>

        <CapabilitiesSkeleton v-if="selectedModel.state === 'loading'" />
        <div v-else role="list" class="flex flex-row gap-2">
            <div v-for="capability in modelCapabilites" role="listitem"
                class="flex flex-row bg-secondary text-background-light p-2 rounded-lg">
                <component :is="capabilityIcons[capability] ?? Unknown" class="size-6 p-1" />
                <span class="capitalize">{{ capability }}</span>
            </div>
        </div>

        <h2 class="text-3xl pb-2 pt-4 text-text">Actions</h2>
        <div class="flex flex-row gap-2 overflow-x-auto" :class="{ 'opacity-50': selectedModel.state === 'loading' }">
            <a :href="`https://ollama.com/library/${modelFromParams}`" target="_blank"
                class="p-4 min-w-max rounded-lg cursor-pointer select-none flex items-center justify-center flex-row gap-2 text-background-light bg-primary!">
                <BiLinkExternal />
                Open in Ollama Library
            </a>
            <ActionButton type="toggled" @click="unloadModel"
                v-if="modelFromParams && (selectedModel.state === 'data' && selectedModel.isLoaded)">
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

        <h2 class="text-3xl pt-4 pb-2 text-text">Info</h2>
        <InfoSection title="License" :content="sanitizeSection(modelLicense)" />
        <InfoSection title="Modelfile" :content="sanitizeSection(modelModelfile)" />
        <InfoSection title="Template" :content="sanitizeSection(modelTemplate)" />
        <InfoSection title="Details" :kv-list="modelDetails" />
        <InfoSection title="Model Info" :kv-list="modelInfo" />
    </div>
</template>