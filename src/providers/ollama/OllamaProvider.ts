import type { ReadableOf } from "@/types/util";
import type { BaseLLMProvider, WithMemoryManagement, WithOllamaModelDetails } from "../base/ProviderInterface";
import { chat, generateChatTitle } from "./helpers";
import type { ChatIteratorChunk, ChatOptions, Model, ModelCapabilities } from "../base/types";
import { appMesagesToOllama } from "./converters/appMessagesToOllama";
import { ollamaWrapper } from "./OllamaWrapper";
import type { ShowResponse } from "ollama";

/**
 * Interfaces with the Ollama wrapper before packaging responses into the common app standard.
 */
export class OllamaProvider implements BaseLLMProvider, WithMemoryManagement, WithOllamaModelDetails {
    name = "Ollama";
	supportsMemoryManagement = true as const;
	supportsOllamaModelDetails = true as const;

    async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<ReadableOf<ChatIteratorChunk>> {
		const ollamaFormatMessages = await appMesagesToOllama(messages);
        return chat(ollamaFormatMessages, abortSignal, options);
    }
    
    async getModels(): Promise<Model[]> {
		const list = await ollamaWrapper.list();

		return list.map((m) => {
			// TODO: real capabilities
			return {
				name: m.name,
				id: m.model,
				capabilities: {
					supportsFunctionCalling: false,
					supportsReasoning: false,
					supportsVision: false,
				}
			}
		});
	}

    async getModelCapabilities(modelId: string): Promise<ModelCapabilities> {
		// 'completion' | 'tools' | 'thinking' | 'vision' | 'insert' | 'embedding' | 'search'

		const { data: modelInfo, error } = await ollamaWrapper.show({ model: modelId });
		if (error || !modelInfo) {
			return {
				supportsFunctionCalling: false,
				supportsReasoning: false,
				supportsVision: false,
			};
		}

		const capabilities = modelInfo.capabilities;

		return {
			supportsReasoning: capabilities.includes('thinking'),
			supportsVision: capabilities.includes('vision'),
			supportsFunctionCalling: capabilities.includes('tools'),
		}
	}

    generateChatTitle(messages: ChatMessage[]): Promise<string> {
        return generateChatTitle(messages);
    }

	
	async getLoadedModelIds(): Promise<string[]> {
		const loadedModels = await ollamaWrapper.ps();
		if (!loadedModels) return [];

		return loadedModels.map(model => model.model);
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