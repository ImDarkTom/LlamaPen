import { defineStore } from "pinia";
import { ref } from "vue";
import { useConfigStore } from "./useConfigStore";
import { useProviderManager } from "@/composables/useProviderManager";

/**
 * UI-related things that only affect the clientside. State and functions for updating things like clientside custom model names.
 */
const useUIStore = defineStore('uiStore', () => {
    const chatIsScrollingDown = ref(true);
    const { rawModels } = useProviderManager();

    /** Set a model hidden for the user. */
    function setModelHidden(modelId: string | null, setHidden: boolean) {
        if (!modelId) return;
        const config = useConfigStore();

        // Update in config
        if (setHidden) {
            config.chat.hiddenModels = config.chat.hiddenModels.filter((model) => model !== modelId)
        } else {
            config.chat.hiddenModels.push(modelId)
        }

        // Update current state
        const target = rawModels.value.find(modelItem => modelItem.info.id === modelId);
        if (target) target.app.hidden = !setHidden;
    }
    
    function renameModel(modelId: string, newName: string) {
        const config = useConfigStore();
        config.chat.modelRenames[modelId] = newName;

        // Update in state
        const target = rawModels.value.find(modelItem => modelItem.info.id === modelId);
        if (target) target.app.displayName = newName;
    }

    return {
        chatIsScrollingDown,
        setModelHidden,
        renameModel,
    };
});

export default useUIStore;