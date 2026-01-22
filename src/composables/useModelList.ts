import { useConfigStore } from "@/stores/config";
import { computed, reactive, toRefs } from "vue";
import { useProviderManager } from "./useProviderManager";
import type { Model, ModelCapabilities } from "@/providers/base/types";

export type ModelInfoListItem = {
    modelData: Model;
    displayName: string;
    loadedInMemory: boolean;
    hidden: boolean;
    fetchedCapabilities?: ModelCapabilities;
}

const state = reactive<{
    models: ModelInfoListItem[],
    loading: boolean,
    error: string | null,
    initialised: boolean,
    connectedToOllama: boolean,
}>({
    models: [],
    loading: false,
    error: null,
    initialised: false,
    connectedToOllama: false
});

let loadPromise: Promise<void> | null = null;

async function load(force: boolean = false) {
    if (state.initialised && !force) return;
    if (loadPromise) return loadPromise;

    const config = useConfigStore();
    const providerManager = useProviderManager();

    if (providerManager.connectionState.value.status === 'error') {
        state.connectedToOllama = false;
        state.error = providerManager.connectionState.value.error || 'An error occured.';
        return;
    }

    state.loading = true;
    state.error = null;
    loadPromise = (async () => {
        try {
            // Get loaded models so we can tag which are loaded when we get the full list
            let loadedModelIds: string[]; 
            if (providerManager.capabilities.hasOllamaFeatures) {
                loadedModelIds = await providerManager.getLoadedModelIds();
            } else {
                loadedModelIds = [];
            }

            // Get the base model list
            state.models = (await providerManager.getModels())
                .map((model) => {
                    const modelId = model.id;

                    const displayName = 
                        config.chat.modelRenames[modelId] ||
                        model.name ||
                        modelId;

                    const isHidden = config.chat.hiddenModels.includes(modelId);

                    // TODO: rename modelData to info
                    return {
                        modelData: model,
                        displayName,
                        loadedInMemory: loadedModelIds.includes(modelId),
                        hidden: isHidden,
                    }
                });

            if (
                !config.cloud.enabled && 
                (
                    config.ollama.modelCapabilities.autoload && state.models.length < 31
                    || config.ollama.modelCapabilities.alwaysAutoload
                )
            ) {
                for (const model of state.models) {
                    const capabilities = await useProviderManager().getModelCapabilities(model.modelData.id);
                    model.fetchedCapabilities = capabilities;
                }
            }

            state.connectedToOllama = true;
        } catch (err) {
            state.error = (err as Error).message;
        } finally {
            state.initialised = true;
            state.loading = false;
            loadPromise = null;
        }
    })();

    return loadPromise;
}

async function refreshModelStates() {
    const loadedModelIds = await useProviderManager().getLoadedModelIds();
    const hiddenModels = useConfigStore().chat.hiddenModels;

    state.models.forEach((item) => {
        item.loadedInMemory = loadedModelIds.includes(item.modelData.id);
        item.hidden = hiddenModels.includes(item.modelData.id);
    });
}

export function useModelList() {
    const modelIds = computed(() => state.models.map((item) => item.modelData.id));

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

    function getModelCapabilities(model: ModelInfoListItem) {
        return model.fetchedCapabilities || model.modelData.capabilities;
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
        { exists: true, data: ModelInfoListItem } | 
        { exists: false, data: null }
    >(() => {
        const selected = state.models
            .find(modelItem => modelItem.modelData.id === useConfigStore().selectedModel);

        if (selected) {
            return { exists: true, data: selected };
        } else {
            return { exists: false, data: null };
        }
    });

    function getModelInfo(modelId: string): 
        { exists: true, data: ModelInfoListItem } | { exists: false, data: null } {
        const selected = state.models
            .find(modelItem => modelItem.modelData.id === modelId);

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
        const target = state.models.find(modelItem => modelItem.modelData.id === modelId);
        if (target) target.displayName = newName;
    }

    return {
        ...toRefs(state),
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