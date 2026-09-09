import type { ProviderMetadata } from "@/providers/base/types";
import { providerFactory } from "@/providers/ProviderFactory";
import { computed } from "vue";
import { useConfigStore, type defaultMessageOptions } from "@/stores/useConfigStore";

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

export type ModelParameters =
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

export type ModelReasoningEffort =
    'max' |
    'xhigh' |
    'high' |
    'medium' |
    'low' |
    'minimal' |
    'none';

export type ModelReasoningOptions = {
    supported_efforts?: ModelReasoningEffort[];
    default_effort?: ModelReasoningEffort
    default_enabled: boolean;
    supports_max_tokens?: boolean;
    mandatory?: boolean;
}

export type ModelInputModalities = 'text' | 'image' | 'video' | 'file' | 'audio' | 'unknown-modalities';
export type ModelOutputModalities = 'text' | 'image' | 'unknown-modalities';

export type ProviderModelInfo = {
    name: string; // Pretty name
    id: string;
    external_link: string | null;
    created: number | null;
    description: string | null;
    context_length: number | null;
    capabilities: ModelCapability[];
    architecture: {
        input_modalities: ModelInputModalities[];
        output_modalities: ModelOutputModalities[]
    };
    supported_parameters: ModelParameters[];
    default_parameters: Partial<Record<ModelParameters, unknown | null>>;
    knowledge_cutoff: string | null; // date
    top_provider?: {
        context_length: number | null;
        is_moderated: boolean | null;
        max_completion_tokens: number | null;
    };
    pricing?: {
        prompt: number;
        completion: number;
    };
    reasoning?: ModelReasoningOptions;

    providerMetadata?: ProviderMetadata;
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

        const supportsParameter = (parameter: ModelParameters) => {
            const found = rawModels.value
                .find(modelItem => modelItem.info.id === modelId);

            if (found) {
                return found.info.supported_parameters.includes(parameter);
            } else {
                return false;
            }
        }

        return { loadIntoMemory, unloadFromMemory, getAttributes, getDisplayName, getCapabilities, supportsParameter };
    }

    const getSelectedModel = () => {
        const selected = rawModels.value
            .find(modelItem => modelItem.info.id === useConfigStore().selectedModel);

        const getCapabilities = () => {
            return selected?.info.capabilities ?? [];
        }

        const supportsParameter = (parameter: ModelParameters) => {
            return selected?.info.supported_parameters.includes(parameter) ?? false;
        }

        /** Generation parameters the selected model accepts, or undefined when the user has them turned off. */
        const getGenerationParams = (): Partial<typeof defaultMessageOptions> | undefined => {
            const config = useConfigStore();
            if (!config.chat.messageOptionsEnabled) return undefined;

            return Object.fromEntries(
                Object.entries(config.chat.messageOptions)
                    .filter(([parameter]) => supportsParameter(parameter as ModelParameters)),
            );
        }

        /** Undefined when the model has no reasoning support, so providers can omit the field entirely. */
        const getReasoningEnabled = (): boolean | undefined => {
            if (!supportsParameter('reasoning')) return undefined;

            return useConfigStore().chat.thinking.enabled;
        }

        /** Configured effort, dropped if the selected model does not list it as supported. */
        const getReasoningEffort = (): ModelReasoningEffort | undefined => {
            const effort = useConfigStore().chat.thinking.effort;
            if (!effort) return undefined;

            return selected?.info.reasoning?.supported_efforts?.includes(effort) ? effort : undefined;
        }

        const getReasoningMaxTokens = (): number | undefined => {
            const maxTokens = useConfigStore().chat.thinking.maxTokens;
            if (!maxTokens || !selected?.info.reasoning?.supports_max_tokens) return undefined;

            return maxTokens;
        }

        return {
            getCapabilities,
            supportsParameter,
            getGenerationParams,
            getReasoningEnabled,
            getReasoningEffort,
            getReasoningMaxTokens,
            id: selected?.info.id,
            displayName: selected?.app.displayName,
            defaultParameters: selected?.info.default_parameters,
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