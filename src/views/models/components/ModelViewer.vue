<script setup lang="ts">
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import ollamaApi from '@/utils/ollama';
import { computed, ref } from 'vue';
import type { IconType } from 'vue-icons-plus';
import { BiBrain, BiCopy, BiLinkExternal, BiPencil, BiReflectVertical, BiSkipNext, BiTrash, BiWrench } from 'vue-icons-plus/bi';
import { BsEye, BsEyeSlash } from 'vue-icons-plus/bs';
import DOMPurify from 'dompurify';
import Unknown from '@/icons/unknown.svg';
import ollamaRequest from '@/utils/ollamaRequest';
import { Fa6Memory } from 'vue-icons-plus/fa6';
import MemoryUnloadIcon from '@/components/Icon/MemoryUnloadIcon.vue';
import InfoSection from './InfoSection.vue';
import CapabilitiesSkeleton from './CapabilitiesSkeleton.vue';
import router from '@/lib/router';
import ViewerContainer from './ViewerContainer.vue';
import { useConfigStore } from '@/stores/config';
import { useModelList } from '@/composables/useModelList';
import PrimaryButton from '@/components/Buttons/PrimaryButton.vue';

const { setModelHidden } = useModelList();
const config = useConfigStore();

const apiEnabled = computed(() => config.api.enabled);

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

const loadModelText = ref('Load into memory');
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
    refreshModelList();
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

async function renameModel() {
    const modelName = props.modelFromParams;
    if (!modelName) {
        alert('No model selected to rename.');
        return;
    }

    let newName = prompt(`Enter a new name for '${modelName}' (app cosmetic only): '`, modelName);
    if (newName === '' || !newName) {
        newName = modelName;
    }

    useConfigStore().chat.modelRenames[modelName] = newName;

    refreshModelList();
}

function sanitizeSection(text: string | null) {
    return DOMPurify.sanitize(text ?? '')
}

const capabilityIcons: Record<string, IconType> = {
    'completion': BiSkipNext,
    'tools': BiWrench,
    'thinking': BiBrain,
    'vision': BsEye,
    'insert': BiReflectVertical
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

const isHidden = computed(() => config.chat.hiddenModels.includes(props.modelFromParams || ''));
</script>

<template>
    <ViewerContainer>
        <div class="text-2xl md:text-3xl mb-2 md:my-6 align-middle min-w-0 whitespace-normal">
            <ModelIcon :name="modelFromParams ?? 'Unknown'" class="size-8 md:size-14! inline mr-2" />

            <span class="text-text font-bold mr-2">{{ modelName }}</span>
            <span class="text-text-muted font-normal">({{ modelFromParams }})</span>
        </div>

        <CapabilitiesSkeleton v-if="selectedModel.state === 'loading'" />
        <div v-else role="list" class="flex flex-row gap-2">
            <div v-for="capability in modelCapabilites" role="listitem"
                class="flex flex-row bg-secondary text-background-light p-2 rounded-lg">
                <component :is="capabilityIcons[capability] ?? Unknown" class="size-6 p-1" />
                <span class="capitalize">{{ capability }}</span>
            </div>
        </div>

        <h2 class="text-xl md:text-3xl pb-2 pt-4 text-text">Actions</h2>
        <div class="flex flex-row gap-2 overflow-x-auto pb-2" :class="{ 'opacity-50': selectedModel.state === 'loading' }">
            <PrimaryButton
                v-if="!apiEnabled"
                type="external-link"
                text="Open in Ollama Library"
                :icon="BiLinkExternal"
                :href="`https://ollama.com/library/${modelFromParams}`"/>
            <PrimaryButton
                type="button"
                color="primary"
                text="Rename model"
                :icon="BiPencil"
                @click="renameModel" />
            <PrimaryButton
                type="button"
                :color="isHidden ? 'sunken' : 'primary'"
                :text="isHidden ? 'Unhide from list' : 'Hide from list'"
                :icon="isHidden ? BsEyeSlash : BsEye"
                @click="setModelHidden(modelFromParams, isHidden)" />

            <template v-if="!apiEnabled">
                <PrimaryButton
                    v-if="modelFromParams && (selectedModel.state === 'data' && selectedModel.isLoaded)"
                    type="button"
                    text="Unload Model"
                    :icon="MemoryUnloadIcon"
                    @click="unloadModel" />
                <PrimaryButton
                    v-else
                    type="button"
                    :text="loadModelText"
                    :icon="Fa6Memory"
                    @click="loadModelIntoOllama" />
                <PrimaryButton
                    type="button"
                    text="Copy/duplicate model"
                    :icon="BiCopy"
                    @click="copyModel" />
                <PrimaryButton
                    type="button"
                    color="danger"
                    text="Delete model"
                    :icon="BiTrash"
                    @click="deleteModel" />
            </template>
        </div>

        <div class="relative">
            <div v-if="apiEnabled" class="absolute w-full min-h-full bg-black/35 rounded-lg backdrop-blur-sm flex items-center justify-center text-lg shadow-sm">
                Info unavailable in API mode.
            </div>
            <h2 class="text-xl md:text-3xl pt-4 pb-2 text-text">Info</h2>
            <InfoSection title="License" :content="sanitizeSection(modelLicense)" />
            <InfoSection title="Modelfile" :content="sanitizeSection(modelModelfile)" />
            <InfoSection title="Template" :content="sanitizeSection(modelTemplate)" />
            <InfoSection title="Details" :kv-list="modelDetails" />
            <InfoSection title="Model Info" :kv-list="modelInfo" />
        </div>
    </ViewerContainer>
</template>