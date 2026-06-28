import { type LLMProvider } from "@/providers/base/ProviderInterface";
import type { ProviderMetadata } from "@/providers/base/types";
import { providerFactory } from "@/providers/ProviderFactory";
import { computed } from "vue";
import { useConfigStore } from "@/stores/useConfigStore";

// Types
/** App-level info */
export type ModelCapability = (
    'unavailable' |
    'vision' | 
    'reasoning' | 
    'always-reasons' |
    'tools' | 
    ({} & string)
);

export type ModelInfo = {
    displayName: string;
    hidden: boolean;
    /** Provider-level info */
    info: { 
        name: string; // Pretty name
        id: string;
        subtitle: string;
        capabilities: ModelCapability[];
        providerMetadata?: ProviderMetadata;
    };
}

type ModelInfoResult = 
    | { exists: true, data: ModelInfo } 
    | { exists: false, data: null };


// Composable
export function useProviderManager() {
    // All providers
    const allProviders = computed(() => providerFactory.getProviders());
    const setActiveProvider = (providerKey: string) => providerFactory.setSelectedProvider(providerKey);

    // ----------------
    // Current provider
    // ----------------
    const currentProvider = computed(() => providerFactory.getSelectedProvider());
    const currentProviderId = computed(() => providerFactory.getSelectedProviderId())
    const rawModels = currentProvider.value.rawModels;
    const loadedModelIds = computed(() => {
        return currentProvider.value.features.modelMemory?.loadedModelIds.value ?? new Set<string>();
    });

    // Connection state
    const connectionState = currentProvider.value.connectionState;
    const isConnected = computed(() => connectionState.status === 'connected');
    const isLoading = computed(() => connectionState.status === 'checking');
    const isDisconnected = computed(() => 
        connectionState.status === 'error' || connectionState.status === 'disconnected'
    );


    // Base methods
    const refreshConnection = () => currentProvider.value.refreshConnection();
    const loadModels = (force: boolean) => currentProvider.value.loadModels(force);

    const refreshAndLoadModels = () => {
        currentProvider.value.refreshConnection();
        currentProvider.value.loadModels(true);
    }

    const chat = ((...args: Parameters<LLMProvider['chat']>) =>
        currentProvider.value.chat(...args)) as LLMProvider['chat'];

    const getModelCapabilities = ((...args: Parameters<LLMProvider['getModelCapabilities']>) =>
            currentProvider.value.getModelCapabilities(...args)) as LLMProvider['getModelCapabilities'];

    const generateChatTitle = ((...args: Parameters<LLMProvider['generateChatTitle']>) =>
            currentProvider.value.generateChatTitle(...args)) as LLMProvider['generateChatTitle'];

    
    // Ollama-specific
    const loadModelIntoMemory = (modelId: string) => {
        const feature = currentProvider.value.features.modelMemory;
        if (!feature) {
            throw new Error(`Provider ${currentProvider.value.name} does not support memory management`);
        }
        
        return feature.load(modelId);
    };

    const unloadModel = (modelId: string) => {
        const feature = currentProvider.value.features.modelMemory;
        if (!feature) {
            throw new Error(`Provider ${currentProvider.value.name} does not support memory management`);
        }
        return feature.unload(modelId);
    };

    const refreshLoadedModels = () => {
        return currentProvider.value.features.modelMemory?.refreshLoadedModels();
    };

    const getModelAttributes = (modelId: string) => {
        return currentProvider.value.getModelAttributes(modelId);
    };

    // Model Info utils
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


    // Selected model
    const selectedModelInfo = computed<ModelInfoResult>(() => {
            const selected = rawModels.value
                .find(modelItem => modelItem.info.id === useConfigStore().selectedModel);
    
            if (selected) {
                return { exists: true, data: selected };
            } else {
                return { exists: false, data: null };
            }
        });

    // https://stackoverflow.com/a/79910618/17727765
    const selectedModelCapabilities = computed(() => {
        if (!selectedModelInfo.value.exists) return [];

        return getModelCapabilities(selectedModelInfo.value.data.info.id);
    });

    return {
        allProviders,
        setActiveProvider,

        currentProvider,
        currentProviderId,
        rawModels,

        connectionState,
        isConnected,
        isLoading,
        isDisconnected,
        refreshConnection,

        refreshAndLoadModels,

        // Base
        loadModels,
        chat,
        getModelCapabilities,
        generateChatTitle,
        getModelAttributes,

        // Ollama-specific
        loadedModelIds,
        loadModelIntoMemory,
        unloadModel,
        refreshLoadedModels,

        // Get model info
        getModelInfo,
        allModelIds,
        selectedModelInfo,
        selectedModelCapabilities
    }
}