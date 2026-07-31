import type { ProviderMetadata } from "@/providers/base/types";
import { providerFactory } from "@/providers/ProviderFactory";
import { computed } from "vue";
import { useConfigStore } from "@/stores/useConfigStore";

// Types
/** App-level info */
export type ModelCapability = (
    'unavailable' |
    'vision' |
    'always-reasons' |
    'tools' |
    ({} & string)
);

type ModelParameters =
    'max_tokens' |
    'reasoning' |
    'include_reasoning' |
    'tool_choice' |
    'tools' |
    'temperature' |
    // 'response_format' | - todo - add later
    'stop' |
    'seed' |
    'top_p' |
    'presence_penalty' |
    'frequency_penalty' |
    'repetition_penalty' |
    'top_k' |
    'min_p';

type ModelReasoningEffort =
    'max' |
    'xhigh' |
    'high' |
    'medium' |
    'low' |
    'minimal' |
    'none';

type ModelInfoNew = {
    architecture: {
        input_modalities: ('text' | 'image' | 'video' | 'file' | 'audio')[];
        output_modalities: ('text' | 'image')[]
    };
    pricing: {
        prompt: number;
        completion: number;
    } | null;
    top_provider: {
        context_length: number;
        is_moderated: boolean;
        max_completion_tokens: number | null;
    };
    // https://openrouter.ai/docs/api_reference/parameters
    supported_parameters: ModelParameters[];
    default_parameters: Record<ModelParameters, unknown | null>;
    knowledge_cutoff: string | null; // date
    reasoning?: {
        supported_efforts?: ModelReasoningEffort[];
        default_effort?: ModelReasoningEffort
        default_enabled: boolean;
        supports_max_tokens?: boolean;
        mandatory?: boolean;
    }
}

export type ModelReasoningOptions = {
    supported_efforts?: ModelReasoningEffort[];
    default_effort?: ModelReasoningEffort
    default_enabled: boolean;
    supports_max_tokens?: boolean;
    mandatory?: boolean;
}

export type ProviderModelInfo = {
    name: string; // Pretty name
    id: string;
    external_link: string | null;
    created: number
    description: string | null;
    context_length: number | null;
    capabilities: ModelCapability[];
    providerMetadata?: ProviderMetadata;
    reasoning?: ModelReasoningOptions;
};

export type AppModelInfo = {
    displayName: string;
    hidden: boolean;
    subtitle: string;
};

export type ModelInfo = {
    app: AppModelInfo;
    info: ProviderModelInfo;
}

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

    const getModel = (modelId: string) => {
        const loadIntoMemory = () => {
            const feature = currentProvider.value.features.modelMemory;
            if (!feature) {
                throw new Error(`Provider ${currentProvider.value.name} does not support memory management`);
            }

            return feature.load(modelId);
        };

        const unloadFromMemory = () => {
            const feature = currentProvider.value.features.modelMemory;
            if (!feature) {
                throw new Error(`Provider ${currentProvider.value.name} does not support memory management`);
            }
            return feature.unload(modelId);
        };

        const getAttributes = () => {
            return currentProvider.value.getModelAttributes(modelId);
        };

        const getDisplayName = (): string | null => {
            const found = rawModels.value
                .find(modelItem => modelItem.info.id === modelId);

            if (found) {
                return found.app.displayName;
            } else {
                return null;
            }
        }

        const getCapabilities = () => {
            const found = rawModels.value
                .find(modelItem => modelItem.info.id === modelId);

            if (found) {
                return found.info.capabilities;
            } else {
                return [];
            }
        }

        return { loadIntoMemory, unloadFromMemory, getAttributes, getDisplayName, getCapabilities };
    }

    const getSelectedModel = () => {
        const selected = rawModels.value
            .find(modelItem => modelItem.info.id === useConfigStore().selectedModel);

        const getCapabilities = () => {
            return selected?.info.capabilities ?? [];
        }

        return {
            getCapabilities,
            id: selected?.info.id,
            displayName: selected?.app.displayName,
            reasoning: selected?.info.reasoning,
        };
    }

    return {
        // All providers
        allProviders,
        setActiveProvider,

        // Current provider
        currentProvider,
        currentProviderId,
        rawModels,

        // Current provider models
        getModel,
        getSelectedModel,

        // Ollama-specific
        loadedModelIds,
    }
}