import type { ReadableOf } from "@/types/util";
import type { ChatIteratorChunk, ChatOptions, Model, ModelCapabilities } from "./types";
import type { ShowResponse } from "ollama/browser";
import type { Reactive, Ref } from "vue";
import type { OllamaProvider } from "../ollama/OllamaProvider";
import type { ModelInfo } from "@/composables/useProviderManager";

// TODO: have this contain all standardized types for use throughout the app (or maybe in a separate types.ts file in providers/base/)

/**
 * Other todos:
 * - OpenRouter provider (using sdk for type safety, also make sure to chunk with the provider so js doesn't get loaded unless openrouter provider is explicitly chosen)
 */

export type ConnectionState = {
    status: 'connected' | 'disconnected' | 'checking' | 'error';
    error?: string;
    lastChecked?: Date;
}

export interface BaseLLMProvider {
    /**
     * Pretty name of the provider.
     */
    readonly name: string;
    readonly connectionState: Reactive<ConnectionState>;
    
    rawModels: Ref<ModelInfo[]>;

    /** 
     * Set the connection state to loading and re-send a network request to the provider's URL
     */
    refreshConnection(): Promise<void>

    /**
     * Loads models from the provider and initialises capabilities.
     * @param force When false, if models were already loaded before, ignore the reqest. True overrides this and re-sends a request, aka refreshes.
     */
    loadModels(force: boolean): Promise<void | null>;
    

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
    ): Promise<ReadableOf<ChatIteratorChunk>>;

    /**
     * Get a list of available models from the provider. This is used when loading capabilites in some providers to set `rawModels`.
     * TODO: We could also maybe have another method to get all models (e.g. ones not available/selected for use)
     */
    getModels(): Promise<Model[]>;

    /**
     * Get the model 'capabilities', e.g. image inputs, thinking/reasoning, etc.
     * @param modelId Model to get capabilities for.
     */
    getModelCapabilities(modelId: string): ModelCapabilities;


    /**
     * Generates a chat title based on the provided chat messages. Uses JSON-structure outputs from model.
     * TODO: add a flag for provider to indicate if JSON-structure outputs are supported.
     * @param messages Chat messages to generate a title for
     */
    generateChatTitle(messages: ChatMessage[]): Promise<string>;
}

export interface OllamaLLMProvider extends BaseLLMProvider {
    /**
     * @param modelId The model to get details for.
     */
    getModelDetails(modelId: string): Promise<{ data: ShowResponse, error: null } | { data: null, error: string }>;

    /**
     * Get the IDs of models currently loaded into memory.
     */
    getLoadedModelIds(): Promise<string[]>;

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

export type LLMProvider = BaseLLMProvider | OllamaLLMProvider;

export type LLMProviderTypes = OllamaProvider;

export function isOllamaProvider(provider: LLMProvider): provider is OllamaLLMProvider {
    return 'getLoadedModelIds' in provider;
}