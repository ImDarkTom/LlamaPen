import { ref, type Ref } from "vue";
import type { ConnectionState, LLMProvider } from "./ProviderInterface";
import type { ChatIteratorChunk, ChatOptions } from "./types";
import type { ModelCapability, ModelInfo } from "@/composables/useProviderManager";
import logger from "@/lib/logger";
import type { ModelAttributes } from "@/components/ModelsPage/types";

export abstract class BaseProvider implements LLMProvider {
    abstract readonly name: string;
    abstract readonly type: 'ollama' | 'openai';
    abstract readonly connectionState: ConnectionState;

    abstract readonly rawModels: Ref<ModelInfo[]>;
    protected readonly fetchedCapabilities = ref<Map<string, ModelCapability[]>>(new Map());

    abstract features: LLMProvider['features'];
    
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
                this.rawModels.value = await this.getModels();
                
                try {
                    await this.onModelsLoaded();
                } catch (error) {
                    logger.error('BaseProvider:loadModels', `Error running onModelsLoaded for ${this.name}:`, error);
                }
            }  finally {
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

    /**
     * Get the capabilities for a specific model.
     * @param modelId Model ID to check capabilities for. E.g. `gemma4:e4b`
     */
    public abstract getModelCapabilities(modelId: string): ModelCapability[];

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
    protected abstract getModels(): Promise<ModelInfo[]>;
}