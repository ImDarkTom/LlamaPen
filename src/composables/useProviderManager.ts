import { isOllamaProvider, type LLMProvider } from "@/providers/base/ProviderInterface";
import { providerFactory } from "@/providers/ProviderFactory";
import { computed } from "vue";

export function useProviderManager() {
    const currentProvider = computed(() => providerFactory.getCurrentProvider());


    const isOllama = computed(() => isOllamaProvider(currentProvider.value));


    const connectionState = currentProvider.value.connectionState;
    const isConnected = computed(() => connectionState.status === 'connected');
    const isLoading = computed(() => connectionState.status === 'checking');
    const isDisconnected = computed(() => connectionState.status === 'error' || connectionState.status === 'disconnected');


    // Always available (from BaseLLMProvider)
    const refreshConnection = () => currentProvider.value.refreshConnection();

    const chat = ((...args: Parameters<LLMProvider['chat']>) =>
        currentProvider.value.chat(...args)) as LLMProvider['chat'];

    const getModels = ((...args: Parameters<LLMProvider['getModels']>) =>
        currentProvider.value.getModels(...args)) as LLMProvider['getModels'];

    const getModelCapabilities = ((...args: Parameters<LLMProvider['getModelCapabilities']>) =>
            currentProvider.value.getModelCapabilities(...args)) as LLMProvider['getModelCapabilities'];

    const generateChatTitle = ((...args: Parameters<LLMProvider['generateChatTitle']>) =>
            currentProvider.value.generateChatTitle(...args)) as LLMProvider['generateChatTitle'];

    
    // Ollama-specific
    const loadModelIntoMemory = (modelId: string) => {
        if (!isOllamaProvider(currentProvider.value)) {
            throw new Error(`Provider ${currentProvider.value.name} does not support memory management`);
        }
        return currentProvider.value.loadModelIntoMemory(modelId);
    };

    const unloadModel = (modelId: string) => {
        if (!isOllamaProvider(currentProvider.value)) {
            throw new Error(`Provider ${currentProvider.value.name} does not support memory management`);
        }
        return currentProvider.value.unloadModel(modelId);
    };

    const getLoadedModelIds = () => {
        if (!isOllamaProvider(currentProvider.value)) {
            throw new Error(`Provider ${currentProvider.value.name} does not support memory management`);
        }
        return currentProvider.value.getLoadedModelIds();
    };

    const getModelDetails = (modelId: string) => {
        if (!isOllamaProvider(currentProvider.value)) {
            throw new Error(`Provider ${currentProvider.value.name} does not support model details`);
        }
        return currentProvider.value.getModelDetails(modelId);
    };

    return {
        currentProvider,
        isOllama,

        connectionState,
        isConnected,
        isLoading,
        isDisconnected,

        // Base
        refreshConnection,
        chat,
        getModels,
        getModelCapabilities,
        generateChatTitle,

        // Ollama-specific
        loadModelIntoMemory,
        unloadModel,
        getLoadedModelIds,
        getModelDetails,
    }
}