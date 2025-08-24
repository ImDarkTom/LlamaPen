import { useConfigStore } from "@/stores/config";
import ollamaApi from "@/utils/ollama";
import { computed, reactive, toRefs } from "vue";

export type ModelInfoListItem = {
    modelData: ModelListItem;
    loadedInMemory: boolean;
    hidden: boolean;
}

const state = reactive<{
    models: ModelInfoListItem[],
    loading: boolean,
    error: string | null,
    initialised: boolean,
}>({
    models: [],
    loading: false,
    error: null,
    initialised: false,
});

let loadPromise: Promise<void> | null = null;

async function load(force: boolean = false) {
    if (state.initialised && !force) return;
    if (loadPromise) return loadPromise;

    state.loading = true;
    state.error = null;
    loadPromise = (async () => {
        try {
            const loadedModelIds = await ollamaApi.getLoadedModelIds();

            // Get the base model list
            state.models = (await ollamaApi.getModels(force))
                .map((model) => ({
                    modelData: model,
                    loadedInMemory: loadedModelIds.includes(model.model),
                    hidden: useConfigStore().chat.hiddenModels.includes(model.model),
                }));
            
            state.initialised = true;
        } catch (err) {
            state.error = (err as Error).message;
        } finally {
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
    const modelIds = computed(() => state.models.map((item) => item.modelData.name));

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

    return {
        ...toRefs(state),
        load,
        modelIds,
        setModelHidden
    };
};