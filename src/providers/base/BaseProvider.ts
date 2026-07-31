import { ref, type Ref } from "vue";
import type { ConnectionState, LLMProvider } from "./ProviderInterface";
import type { ChatIteratorChunk, ChatOptions } from "./types";
import type { ModelCapability, ModelInfo, ProviderModelInfo } from "@/composables/useProviderManager";
import logger from "@/lib/logger";
import type { ModelAttributes } from "@/components/ModelsPage/types";
import { NameParser, SubtitleParser } from "../openai/nonStandardParsing";
import { useConfigStore } from "@/stores/useConfigStore";

export abstract class BaseProvider implements LLMProvider {
    abstract readonly name: string;
    abstract readonly type: 'ollama' | 'openai';
    abstract readonly connectionState: ConnectionState;

    abstract readonly rawModels: Ref<ModelInfo[]>;

    abstract readonly features: LLMProvider['features'];

    abstract config: LLMProvider['config'];

    private initialised = ref(false);
    private loadPromise: Promise<void> | null = null;

    async loadModels(force: boolean = false): Promise<void> {
        if (this.initialised.value && !force) return;
        if (this.loadPromise) return this.loadPromise;

        if (this.connectionState.status === 'error') {
            return;
        }

        this.loadPromise = (async () => {
            try {
                const configStore = useConfigStore();

                const providerInfoList: ProviderModelInfo[] = await this.getModels();

                const modelList: ModelInfo[] = providerInfoList.map((modelProvInfo) => {
                    const appRename = configStore.chat.modelRenames[modelProvInfo.id];

                    return {
                        info: modelProvInfo,
                        app: {
                            displayName: appRename ?? NameParser.getNameForModel(modelProvInfo.providerMetadata, modelProvInfo.id),
                            hidden: configStore.chat.hiddenModels.includes(modelProvInfo.id),
                            subtitle: SubtitleParser.getSubtitleForModel(modelProvInfo.providerMetadata),
                        }
                    }
                })

                this.rawModels.value = modelList;

                try {
                    await this.onModelsLoaded();
                } catch (error) {
                    logger.error('BaseProvider:loadModels', `Error running onModelsLoaded for ${this.name}:`, error);
                }
            } finally {
                this.initialised.value = true;
                this.loadPromise = null;
            }
        })();

        return this.loadPromise;
    }

    /**
     * Run connectivity check to provider.
     */
    public abstract refreshConnection(): Promise<void>;

    /**
     * Send a chat request to the provider.
     * @param messages The chat messages to use as context.
     * @param abortSignal AbortSignal for if user cancells.
     * @param options Chat parameters.
     * @returns An iterable list of response chunks as they come in.
     */
    public abstract chat(
        messages: ChatMessage[],
        abortSignal: AbortSignal,
        options: ChatOptions
    ): Promise<AsyncIterable<ChatIteratorChunk>>;

    public abstract getModelAttributes(modelId: string): Promise<ModelAttributes>;

    /**
     * Generate the title to a chat using a provider's model.
     * @param messages Messages to use as context for the chat title generation.
     */
    public abstract generateChatTitle(messages: ChatMessage[]): Promise<string>;

    /**
     * Hook for provider-specific logic after models are loaded with no errors.
     * E.g. used in Ollama to fetch capabilites for each model.
     */
    protected onModelsLoaded(): Promise<void> | void {
        // Override in subclasses if needed
    }

    /**
     * Internal method to fetch models from provider and transform them info a
     * common format.
     */
    protected abstract getModels(): Promise<ProviderModelInfo[]>;

    // Connection state
    public isConnected() {
        return this.connectionState.status === 'connected';
    }

    public isLoading() {
        return this.connectionState.status === 'checking';
    }

    public isDisconnected() {
        return this.connectionState.status === 'error' || this.connectionState.status === 'disconnected'
    }


    public getAllModelIds() {
        return this.rawModels.value.map((model) => model.info.id);
    }
}