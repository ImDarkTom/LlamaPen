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
}

const rawModels = useProviderManager().rawModels;
const fetchedCapabilities = ref<Map<string, ModelCapabilities>>(new Map());

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
        return fetchedCapabilities.value.get(model.info.id) || model.info.capabilities;
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
        modelIds,
        setModelHidden,
        selectedModelInfo,
        selectedModelCapabilities,
        getModelCapabilities,
        getModelInfo,
        renameModel,
    };
};