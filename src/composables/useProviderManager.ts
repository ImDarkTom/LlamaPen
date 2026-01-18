import { providerFactory } from "@/providers/ProviderFactory";
import { computed } from "vue";

export function useProviderManager() {
    const currentProvider = computed(() => providerFactory.getCurrentProvider());

    return {
        currentProvider,
        chat: currentProvider.value.chat,
        getModels: currentProvider.value.getModels,
        getLoadedModelIds: currentProvider.value.getLoadedModelIds,
        getModelCapabilities: currentProvider.value.getModelCapabilities,
        generateChatTitle: currentProvider.value.generateChatTitle,
        loadModelIntoMemory: currentProvider.value.loadModelIntoMemory,
        unloadModel: currentProvider.value.unloadModel,
    }
}