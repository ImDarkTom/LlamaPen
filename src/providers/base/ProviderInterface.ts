import type { ChatIteratorChunk, ChatOptions } from "./types";
import type { Reactive, Ref } from "vue";
import type { ModelCapability, ModelInfo } from "@/composables/useProviderManager";
import type { ModelAttributes } from "@/components/ModelsPage/types";

export type ConnectionState = {
    status: 'connected' | 'disconnected' | 'checking' | 'error';
    error?: string;
    lastChecked?: Date;
}

export interface LLMProvider {
    readonly name: string;
    readonly type: 'ollama' | 'openai';
    readonly connectionState: Reactive<ConnectionState>;
    readonly rawModels: Ref<ModelInfo[]>;

    /**
     * Loads models from the provider and initialises capabilities.
     * @param force When false, if models were already loaded before, ignore the reqest. 
     * True overrides this and re-sends a request, aka refreshes.
     */
    loadModels(force: boolean): Promise<void>;

    /** 
     * Set the connection state to loading and re-send a network request to the provider's URL
     */
    refreshConnection(): Promise<void>;
    

    /**
     * Generates a chat response as a stream of chunks.
     * 
     * This needs major overhauling, currently we need to:
     * - Standardize ChatIteratorChunk across providers
     * 
     * @param messages Chat messages.
     * @param abortSignal AbortSignal to stop streaming.
     * @param options Client-side generation options.
     */
    chat(
        messages: ChatMessage[], 
        abortSignal: AbortSignal, 
        options: ChatOptions,
    ): Promise<AsyncIterable<ChatIteratorChunk>>;

    /**
     * Get the model 'capabilities', e.g. image inputs, thinking/reasoning, etc.
     * @param modelId Model to get capabilities for.
     */
    getModelCapabilities(modelId: string): ModelCapability[];

    /**
     * Get the attributes of a model. E.g. license, modelfile, etc.
     * @param modelId Model to get attributes for.
     */
    getModelAttributes(modelId: string): Promise<ModelAttributes>;


    /**
     * Generates a chat title based on the provided chat messages. Uses JSON-structure outputs from model.
     * TODO: add a flag for provider to indicate if JSON-structure outputs are supported.
     * @param messages Chat messages to generate a title for
     */
    generateChatTitle(messages: ChatMessage[]): Promise<string>;
}

export interface MemoryManagedProvider extends LLMProvider {
    readonly loadedModelIds: Ref<Set<string>>;
    refreshLoadedModels(): Promise<void>;
    
    /**
     * Loads a model into memory.
     * @param modelName The name of the model to load into memory.
     * @returns If the model was successfully loaded into memory.
     */
    loadModelIntoMemory(modelId: string): Promise<boolean>;

    /**
     * Unloads a model from memory.
     * @param modelName The name of the model to unload from memory.
     * @returns If the model was successfully unloaded from memory.
     */
    unloadModel(modelId: string): Promise<boolean>;
}

export interface ConfigurableProvider<TConfig extends Record<string, unknown>> extends LLMProvider {
    config: TConfig;
}