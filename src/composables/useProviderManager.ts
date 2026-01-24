import { isOllamaProvider, type LLMProvider } from "@/providers/base/ProviderInterface";
import type { ModelCapabilities } from "@/providers/base/types";
import { providerFactory } from "@/providers/ProviderFactory";
import { computed } from "vue";
import type { Model } from "@/providers/base/types";
import { useConfigStore } from "@/stores/config";

export type ModelInfo = {
    info: Model;
    displayName: string;
    loadedInMemory: boolean;
    hidden: boolean;
}

export function useProviderManager() {
    const currentProvider = computed(() => providerFactory.getCurrentProvider());


    const isOllama = computed(() => isOllamaProvider(currentProvider.value));

    const rawModels = currentProvider.value.rawModels;

    const connectionState = currentProvider.value.connectionState;
    const isConnected = computed(() => connectionState.status === 'connected');
    const isLoading = computed(() => connectionState.status === 'checking');
    const isDisconnected = computed(() => connectionState.status === 'error' || connectionState.status === 'disconnected');


    // Always available (from BaseLLMProvider)
    const refreshConnection = () => currentProvider.value.refreshConnection();
    const loadModels = (force: boolean) => currentProvider.value.loadModels(force);

    const chat = ((...args: Parameters<LLMProvider['chat']>) =>
        currentProvider.value.chat(...args)) as LLMProvider['chat'];

    const getModels = ((...args: Parameters<LLMProvider['getModels']>) =>
        currentProvider.value.getModels(...args)) as LLMProvider['getModels'];

    const getAllModels = ((...args: Parameters<LLMProvider['getAllModels']>) =>
        currentProvider.value.getAllModels(...args)) as LLMProvider['getAllModels'];

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


    // Selected model
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

    const selectedModelCapabilities = computed<ModelCapabilities>(() => {
        if (!selectedModelInfo.value.exists) return {
            supportsFunctionCalling: false,
            supportsReasoning: false,
            supportsVision: false
        };

        return getModelCapabilities(selectedModelInfo.value.data.info.id);
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

    const allModelIds = computed(() => rawModels.value.map((item) => item.info.id));

    return {
        currentProvider,
        isOllama,

        rawModels,

        loadModels,

        connectionState,
        isConnected,
        isLoading,
        isDisconnected,

        // Base
        refreshConnection,
        chat,
        getModels,
        getAllModels,
        getModelCapabilities,
        generateChatTitle,

        // Ollama-specific
        loadModelIntoMemory,
        unloadModel,
        getLoadedModelIds,
        getModelDetails,

        // Get model info
        getModelInfo,
        allModelIds,

        // Selected Mode
        selectedModelInfo,
        selectedModelCapabilities
    }
}