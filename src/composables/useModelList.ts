import { useConfigStore } from "@/stores/config";
import { computed } from "vue";
import { useProviderManager } from "./useProviderManager";
import type { Model, ModelCapabilities } from "@/providers/base/types";
import { ref } from "vue";

export type ModelInfo = {
    info: Model;
    displayName: string;
    loadedInMemory: boolean;
    hidden: boolean;
    fetchedCapabilities?: ModelCapabilities;
}

const rawModels = ref<ModelInfo[]>([]);
const loadedModelIds = ref<string[]>([]);
const initialised = ref(false);

let loadPromise: Promise<void> | null = null;

async function load(force: boolean = false) {
    if (initialised.value && !force) return;
    if (loadPromise) return loadPromise;

    const config = useConfigStore();
    const providerManager = useProviderManager();

    if (providerManager.connectionState.status === 'error') {
        return;
    }

    loadPromise = (async () => {
        try {
            if (providerManager.isOllama.value) {
                loadedModelIds.value = await providerManager.getLoadedModelIds();
            }

            // Get the base model list
            rawModels.value = (await providerManager.getModels())
                .map((model) => {
                    const modelId = model.id;

                    const displayName = 
                        config.chat.modelRenames[modelId] ||
                        model.name ||
                        modelId;

                    const isHidden = config.chat.hiddenModels.includes(modelId);

                    return {
                        info: model,
                        displayName,
                        loadedInMemory: loadedModelIds.value.includes(modelId),
                        hidden: isHidden,
                    }
                });

            if (
                !config.cloud.enabled && 
                (
                    config.ollama.modelCapabilities.autoload && rawModels.value.length < 31
                    || config.ollama.modelCapabilities.alwaysAutoload
                )
            ) {
                for (const model of rawModels.value) {
                    const capabilities = await providerManager.getModelCapabilities(model.info.id);
                    model.fetchedCapabilities = capabilities;
                }
            }
        } finally {
            initialised.value = true;
            loadPromise = null;
        }
    })();

    return loadPromise;
}

async function refreshModelStates() {
    const loadedModelIds = await useProviderManager().getLoadedModelIds();
    const hiddenModels = useConfigStore().chat.hiddenModels;

    rawModels.value.forEach((item) => {
        item.loadedInMemory = loadedModelIds.includes(item.info.id);
        item.hidden = hiddenModels.includes(item.info.id);
    });
}

export function useModelList() {
    const modelIds = computed(() => rawModels.value.map((item) => item.info.id));

    function setModelHidden(modelId: string | null, setHidden: boolean) {
        if (!modelId) return;
        const config = useConfigStore();

        if (setHidden) {
            config.chat.hiddenModels = config.chat.hiddenModels.filter((model) => model !== modelId)
        } else {
            config.chat.hiddenModels.push(modelId)
        }

        refreshModelStates();
    }

    function getModelCapabilities(model: ModelInfo) {
        return model.fetchedCapabilities || model.info.capabilities;
    }
    
    const selectedModelCapabilities = computed<ModelCapabilities>(() => {
        if (!selectedModelInfo.value.exists) return {
            supportsFunctionCalling: false,
            supportsReasoning: false,
            supportsVision: false
        };

        return getModelCapabilities(selectedModelInfo.value.data);
    })

    const selectedModelInfo = computed<
        { exists: true, data: ModelInfo } | 
        { exists: false, data: null }
    >(() => {
        const selected = rawModels.value
            .find(modelItem => modelItem.info.id === useConfigStore().selectedModel);

        if (selected) {
            return { exists: true, data: selected };
        } else {
            return { exists: false, data: null };
        }
    });

    function getModelInfo(modelId: string): 
        { exists: true, data: ModelInfo } | { exists: false, data: null } {
        const selected = rawModels.value
            .find(modelItem => modelItem.info.id === modelId);

        if (selected) {
            return { exists: true, data: selected };
        } else {
            return { exists: false, data: null };
        }
    }

    function renameModel(modelId: string, newName: string) {
        const config = useConfigStore();

        config.chat.modelRenames[modelId] = newName;

        // Update in state
        const target = rawModels.value.find(modelItem => modelItem.info.id === modelId);
        if (target) target.displayName = newName;
    }

    return {
        rawModels,
        load,
        modelIds,
        setModelHidden,
        selectedModelInfo,
        selectedModelCapabilities,
        getModelCapabilities,
        getModelInfo,
        renameModel,
    };
};