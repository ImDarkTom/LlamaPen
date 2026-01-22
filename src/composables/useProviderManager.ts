import type { LLMProvider } from "@/providers/base/ProviderInterface";
import { providerFactory } from "@/providers/ProviderFactory";
import { computed } from "vue";

type ProviderWithFeatureMethod<
    TFeature extends Partial<LLMProvider>,
    TMethod extends keyof Extract<LLMProvider, TFeature>
> = Extract<LLMProvider, TFeature>[TMethod] extends (...args: infer P) => infer R
    ? { params: P, returnType: R }
    : never;

export function useProviderManager() {
    const currentProvider = computed(() => providerFactory.getCurrentProvider());

    const capabilities = {
        hasOllamaFeatures: computed(() => currentProvider.value.hasOllamaFeatures),
    };

    const connectionState = computed(() => currentProvider.value.connectionState);

    // Always available (from BaseLLMProvider)
    const refreshConnection = ((...args: Parameters<LLMProvider['refreshConnection']>) =>
        currentProvider.value.refreshConnection(...args)) as LLMProvider['refreshConnection'];

    const chat = ((...args: Parameters<LLMProvider['chat']>) =>
        currentProvider.value.chat(...args)) as LLMProvider['chat'];

    const getModels = ((...args: Parameters<LLMProvider['getModels']>) =>
        currentProvider.value.getModels(...args)) as LLMProvider['getModels'];

    const getModelCapabilities = ((...args: Parameters<LLMProvider['getModelCapabilities']>) =>
            currentProvider.value.getModelCapabilities(...args)) as LLMProvider['getModelCapabilities'];

    const generateChatTitle = ((...args: Parameters<LLMProvider['generateChatTitle']>) =>
            currentProvider.value.generateChatTitle(...args)) as LLMProvider['generateChatTitle'];

    
    // Ollama-specific
    type LoadModelIntoMemoryMethod = ProviderWithFeatureMethod<{ hasOllamaFeatures: true }, 'loadModelIntoMemory'>;
    const loadModelIntoMemory = (...args: LoadModelIntoMemoryMethod['params']): LoadModelIntoMemoryMethod['returnType'] => {
        const prov = currentProvider.value;
        if (!prov.hasOllamaFeatures) {
            throw new Error(`Provider ${prov.name} does not support memory management`);
        }
        return prov.loadModelIntoMemory(...args);
    };

    type UnloadModelIntoMemoryMethod = ProviderWithFeatureMethod<{ hasOllamaFeatures: true }, 'unloadModel'>;
    const unloadModel = (...args: UnloadModelIntoMemoryMethod['params']): UnloadModelIntoMemoryMethod['returnType'] => {
        const prov = currentProvider.value;
        if (!prov.hasOllamaFeatures) {
            throw new Error(`Provider ${prov.name} does not support memory management`);
        }
        return prov.unloadModel(...args);
    };

    type GetLoadedModelIdsMethod = ProviderWithFeatureMethod<{ hasOllamaFeatures: true }, 'getLoadedModelIds'>;
    const getLoadedModelIds = (...args: GetLoadedModelIdsMethod['params']): GetLoadedModelIdsMethod['returnType'] => {
        const prov = currentProvider.value;
        if (!prov.hasOllamaFeatures) {
            throw new Error(`Provider ${prov.name} does not support memory management`);
        }
        return prov.getLoadedModelIds(...args);
    };

    type GetModelDetailsMethod = ProviderWithFeatureMethod<{ hasOllamaFeatures: true }, 'getModelDetails'>;
    const getModelDetails = (...args: GetModelDetailsMethod['params']): GetModelDetailsMethod['returnType'] => {
        const prov = currentProvider.value;
        if (!prov.hasOllamaFeatures) {
            throw new Error(`Provider ${prov.name} does not support Ollama model details`);
        }
        return prov.getModelDetails(...args);
    };

    return {
        currentProvider,
        capabilities,
        connectionState,

        refreshConnection,

        chat,
        getModels,
        getModelCapabilities,
        generateChatTitle,

        // Memory management methods
        loadModelIntoMemory,
        unloadModel,
        getLoadedModelIds,

        // Ollama model details
        getModelDetails,
    }
}