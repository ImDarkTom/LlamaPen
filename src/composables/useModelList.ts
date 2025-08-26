import { useConfigStore } from "@/stores/config";
import ollamaApi from "@/utils/ollama";
import { computed, reactive, toRefs } from "vue";

export type ModelInfoListItem = {
    modelData: ModelListItem;
    displayName: string;
    loadedInMemory: boolean;
    hidden: boolean;
    fetchedCapabilities?: OllamaCapability[];
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

    state.loading = true;
    state.error = null;
    loadPromise = (async () => {
        try {
            // Get loaded models so we can tag which are loaded when we get the full list
            const loadedModelIds = await ollamaApi.getLoadedModelIds();

            // Get the base model list
            state.models = (await ollamaApi.getModels(force))
                .map((model) => {
                    const displayName = 
                        config.chat.modelRenames[model.model] ||
                        model.name ||
                        model.model;

                    return {
                        modelData: model,
                        displayName,
                        loadedInMemory: loadedModelIds.includes(model.model),
                        hidden: config.chat.hiddenModels.includes(model.model),
                    }
                });

            if (
                !config.api.enabled && 
                (
                    config.ollama.modelCapabilities.autoload && state.models.length < 31
                    || config.ollama.modelCapabilities.alwaysAutoload
                )
            ) {
                for (const model of state.models) {
                    const capabilities = await ollamaApi.getModelCapabilities(model.modelData.model);
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
    const loadedModelIds = await ollamaApi.getLoadedModelIds();
    const hiddenModels = useConfigStore().chat.hiddenModels;

    state.models.forEach((item) => {
        item.loadedInMemory = loadedModelIds.includes(item.modelData.model);
        item.hidden = hiddenModels.includes(item.modelData.model);
    });
}

export function useModelList() {
    const modelIds = computed(() => state.models.map((item) => item.modelData.model));

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
        return model.modelData.capabilities ||
            model.fetchedCapabilities || [];
    }
    
    const selectedModelCapabilities = computed(() => {
        if (!selectedModelInfo.value.exists) return [];

        return getModelCapabilities(selectedModelInfo.value.data);
    })

    const selectedModelInfo = computed<
        { exists: true, data: ModelInfoListItem } | 
        { exists: false, data: null }
    >(() => {
        const selected = state.models
            .find(modelItem => modelItem.modelData.model === useConfigStore().selectedModel);

        if (selected) {
            return { exists: true, data: selected };
        } else {
            return { exists: false, data: null };
        }
    });

    return {
        ...toRefs(state),
        load,
        modelIds,
        setModelHidden,
        selectedModelInfo,
        selectedModelCapabilities,
        getModelCapabilities
    };
};