import type { ReadableOf } from "@/types/util";

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
    readonly name: string;

    chat(
        messages: OllamaMessage[], 
        abortSignal: AbortSignal, 
        additionalOptions?: { modelOverride?: string }
    ): ReadableOf<ChatIteratorChunk>

    getModels(): Promise<ModelList>

    getLoadedModelIds(): Promise<string[]>

    getModelCapabilities(modelId: string): Promise<('completion' | 'tools' | 'thinking' | 'vision' | 'insert' | 'embedding' | 'search')[]>

    generateChatTitle(messages: ChatMessage[]): Promise<string>;

    /**
     * Loads a model into memory. TODO: make ollama-specific
     * @param modelName The name of the model to load into memory.
     * @returns If the model was successfully loaded into memory.
     */
    loadModelIntoMemory(modelId: string): Promise<boolean>;

    unloadModel(modelId: string): Promise<boolean>;
}

