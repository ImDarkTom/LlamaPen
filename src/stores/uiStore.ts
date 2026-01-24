import { defineStore } from "pinia";
import { ref } from "vue";
import { useConfigStore } from "./config";
import { useProviderManager } from "@/composables/useProviderManager";

const { rawModels } = useProviderManager();

async function refreshModelStates() {
    const loadedModelIds = await useProviderManager().getLoadedModelIds();
    const hiddenModels = useConfigStore().chat.hiddenModels;

    rawModels.value.forEach((model) => {
        model.loadedInMemory = loadedModelIds.includes(model.info.id);
        model.hidden = hiddenModels.includes(model.info.id);
    });
}

/**
 * UI-related things that only affect the clientside. State and functions for updating things like clientside custom model names.
 */
const useUIStore = defineStore('uiStore', () => {
    const chatIsScrollingDown = ref(true);

    /** Set a model hidden for the user. */
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
    
    function renameModel(modelId: string, newName: string) {
        const config = useConfigStore();
        config.chat.modelRenames[modelId] = newName;

        // Update in state
        const target = rawModels.value.find(modelItem => modelItem.info.id === modelId);
        if (target) target.displayName = newName;
    }

    return {
        chatIsScrollingDown,
        setModelHidden,
        renameModel,
    };
});

export default useUIStore;