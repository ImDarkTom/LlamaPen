import type { LLMProvider } from "@/providers/base/ProviderInterface";
import { providerFactory } from "@/providers/ProviderFactory";
import { computed } from "vue";

export function useProviderManager() {
    const currentProvider = computed(() => providerFactory.getCurrentProvider());

    return {
        currentProvider,

        chat: ((...args: Parameters<LLMProvider['chat']>) =>
            currentProvider.value.chat(...args)) as LLMProvider['chat'],

        getModels: ((...args: Parameters<LLMProvider['getModels']>) =>
            currentProvider.value.getModels(...args)) as LLMProvider['getModels'],

        getLoadedModelIds: ((...args: Parameters<LLMProvider['getLoadedModelIds']>) =>
            currentProvider.value.getLoadedModelIds(...args)) as LLMProvider['getLoadedModelIds'],

        getModelCapabilities: ((...args: Parameters<LLMProvider['getModelCapabilities']>) =>
            currentProvider.value.getModelCapabilities(...args)) as LLMProvider['getModelCapabilities'],

        generateChatTitle: ((...args: Parameters<LLMProvider['generateChatTitle']>) =>
            currentProvider.value.generateChatTitle(...args)) as LLMProvider['generateChatTitle'],

        loadModelIntoMemory: ((...args: Parameters<LLMProvider['loadModelIntoMemory']>) =>
            currentProvider.value.loadModelIntoMemory(...args)) as LLMProvider['loadModelIntoMemory'],

        unloadModel: ((...args: Parameters<LLMProvider['unloadModel']>) =>
            currentProvider.value.unloadModel(...args)) as LLMProvider['unloadModel'],
    }
}