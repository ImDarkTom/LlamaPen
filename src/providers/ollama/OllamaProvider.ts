import type { ReadableOf } from "@/types/util";
import type { BaseLLMProvider, WithMemoryManagement } from "../base/ProviderInterface";
import { chat, generateChatTitle } from "./helpers";
import type { ChatIteratorChunk, ChatOptions } from "../base/types";
import { appMesagesToOllama } from "./converters/appMessagesToOllama";
import { ollamaWrapper } from "./OllamaWrapper";
import type { ShowResponse } from "ollama";

/**
 * Interfaces with the Ollama wrapper before packaging responses into the common app standard.
 */
export class OllamaProvider implements BaseLLMProvider, WithMemoryManagement {
    name = "Ollama";
	supportsMemoryManagement = true as const;

    async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<ReadableOf<ChatIteratorChunk>> {
		const ollamaFormatMessages = await appMesagesToOllama(messages);
        return chat(ollamaFormatMessages, abortSignal, options);
    }
    
    async getModels(): Promise<ModelList> {
		const list = await ollamaWrapper.list();
		return list;
	}
    
    async getLoadedModelIds(): Promise<string[]> {
		const loadedModels = await ollamaWrapper.ps();
		if (!loadedModels) return [];

		return loadedModels.map(model => model.model);
	}

    async getModelCapabilities(modelId: string): Promise<OllamaCapability[]> {
		const { data: modelInfo, error } = await ollamaWrapper.show({ model: modelId });
		if (error || !modelInfo) {
			return [];
		}

		return modelInfo.capabilities as OllamaCapability[];
	}

    generateChatTitle(messages: ChatMessage[]): Promise<string> {
        return generateChatTitle(messages);
    }

    async loadModelIntoMemory(modelId: string): Promise<boolean> {
		const success = await ollamaWrapper.loadIntoMemory(modelId);
		return success;
	}

    async unloadModel(modelId: string): Promise<boolean> {
		const success = await ollamaWrapper.unloadFromMemory(modelId);
		return success;
	}

	async getModelDetails(modelId: string): Promise<{ data: ShowResponse, error: null } | { data: null, error: string }> {
		const { data: modelInfo, error } = await ollamaWrapper.show({ model: modelId });
		if (error) {
			return { data: null, error: error.message };
		}

		return { data: modelInfo, error: null };
	}
}