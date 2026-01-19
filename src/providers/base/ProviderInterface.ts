import type { ReadableOf } from "@/types/util";

// TODO: have this contain all standardized types for use throughout the app (or maybe in a separate types.ts file in providers/base/)

/**
 * Other todos:
 * - OpenRouter provider (using sdk for type safety, also make sure to chunk with the provider so js doesn't get loaded unless openrouter provider is explicitly chosen)
 */

export type ChatIteratorChunk = {
	type: 'error',
	error: {
		type: string;
		message: string;
	};
} | {
	type: 'done',
	reason: 'completed' | 'cancelled' | 'error',
	stats?: ModelChatMessage['stats']
} | {
	type: 'message',
	data: OllamaChatResponseChunk;
};

export interface LLMProvider {
    readonly name: string; // Name of the provider

    /**
     * Generates a chat response as a stream of chunks.
     * 
     * This needs major overhauling, currently we need to:
     * - Use non-Ollama messages
     * - Standardize ChatIteratorChunk across providers
     * - Not use `modelOverride` as a workaround to get regeneration with a non-selected model working
     * - Replace additionalOptions with a standardized options object (using an interface e.g. ChatOptions)
     * 
     * @param messages Chat messages.
     * @param abortSignal AbortSignal to stop streaming.
     * @param additionalOptions Model override.
     */
    chat(
        messages: OllamaMessage[], 
        abortSignal: AbortSignal, 
        additionalOptions?: { modelOverride?: string }
    ): ReadableOf<ChatIteratorChunk>

    /**
     * Get a list of available models from the provider.
     * TODO: standardize ModelList across providers. We could also maybe have another method to get all models (e.g. ones not available/selected for use)
     */
    getModels(): Promise<ModelList>

    /**
     * Get the IDs of models currently loaded into memory.
     * TODO: add a flag for provider to indicate if memory management is supported.
     */
    getLoadedModelIds(): Promise<string[]>

    /**
     * Get the model 'capabilities', e.g. image inputs, thinking/reasoning, etc.
     * TODO: standardize capabilities across providers (don't use OllamaCapability).
     * @param modelId Model to get capabilities for.
     */
    getModelCapabilities(modelId: string): Promise<OllamaCapability[]>

    /**
     * Generates a chat title based on the provided chat messages. Uses JSON-structure outputs from model.
     * TODO: add a flag for provider to indicate if JSON-structure outputs are supported.
     * @param messages Chat messages to generate a title for
     */
    generateChatTitle(messages: ChatMessage[]): Promise<string>;

    /**
     * Loads a model into memory.
     * TODO: add a flag for provider to indicate if memory management is supported.
     * @param modelName The name of the model to load into memory.
     * @returns If the model was successfully loaded into memory.
     */
    loadModelIntoMemory(modelId: string): Promise<boolean>;

    /**
     * Unloads a model from memory.
     * TODO: add a flag for provider to indicate if this is supported.
     * @param modelName The name of the model to unload from memory.
     * @returns If the model was successfully unloaded from memory.
     */
    unloadModel(modelId: string): Promise<boolean>;
}

