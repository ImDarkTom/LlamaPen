import { type LLMProvider } from "@/providers/base/ProviderInterface";
import { isLPCloudProvider, isOllamaProvider } from "@/providers/utils/ProviderCheck";
import type { ProviderMetadata } from "@/providers/base/types";
import { providerFactory } from "@/providers/ProviderFactory";
import { computed } from "vue";
import { useConfigStore } from "@/stores/useConfigStore";
import logger from "@/lib/logger";
import { OpenAIProvider } from "@/providers/openai/OpenAIProvider";
import { OllamaProvider } from "@/providers/ollama/OllamaProvider";

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

    const registerProvider = (key: string, type: Exclude<LLMProvider['type'], 'lpcloud'>) => {
        if (allProviders.value.has(key)) {
            logger.warn(`Provider with key '${key}' is already registered, skipping`);
            return;
        }

        switch (type) {
            case 'ollama':
                providerFactory.register(key, new OllamaProvider());
                break;
            case 'openai':
                providerFactory.register(key, new OpenAIProvider({
                    name: 'OpenAI',
                    baseURL: 'https://api.openai.com/v1',
                    apiKey: 'placeholder',
                }));
                break;
            default:
                logger.error(`Invalid provider type '${type}' for provider with key '${key}'`);
        }
    }

    // ----------------
    // Current provider
    // ----------------
    const currentProvider = computed(() => providerFactory.getSelectedProvider());
    const currentProviderId = computed(() => providerFactory.getSelectedProviderId())
    const rawModels = currentProvider.value.rawModels;
    const loadedModelIds = computed(() => {
        if (isOllamaProvider(currentProvider.value)) {
            return currentProvider.value.loadedModelIds.value;
        }
        return new Set<string>();
    });

    const isOllama = computed(() => isOllamaProvider(currentProvider.value));
    const isLPCloud = computed(() => isLPCloudProvider(currentProvider.value));

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

    const refreshLoadedModels = () => {
        if (isOllamaProvider(currentProvider.value)) {
            return currentProvider.value.refreshLoadedModels();
        }
        logger.warn(`Provider ${currentProvider.value.name} does not support memory management, skipping refreshLoadedModels`);
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
        registerProvider,

        currentProvider,
        currentProviderId,
        rawModels,

        isOllama,
        isLPCloud,

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