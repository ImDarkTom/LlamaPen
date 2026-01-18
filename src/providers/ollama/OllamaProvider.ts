import type { ReadableOf } from "@/types/util";
import type { ChatIteratorChunk, LLMProvider } from "../base/ProviderInterface";
import ollamaApi from "@/providers/ollama/ollama";
import ollamaRequest from "@/utils/ollamaRequest";
import logger from "@/lib/logger";
import { useConfigStore } from "@/stores/config";

export class OllamaProvider implements LLMProvider {
    name = "Ollama";

    chat(messages: OllamaMessage[], abortSignal: AbortSignal, additionalOptions?: { modelOverride?: string; }): ReadableOf<ChatIteratorChunk> {
        return ollamaApi.chat(messages, abortSignal, additionalOptions);
    }
    
    async getModels(): Promise<ModelList> {
		const response = await fetch(useConfigStore().requestUrl('/api/tags'));
		const responseJson: { models: ModelList } = await response.json();

        // TODO: handle errors
		return responseJson.models;
	}
    
    async getLoadedModelIds(): Promise<string[]> {
		const { data: response, error } = await ollamaRequest('/api/ps', 'GET');

		if (error) {
			logger.warn('OllamaProvider:getLoadedModelIds', 'Error getting loaded models:', error);
			return [];
		}

		if (response.status !== 200) {
			return [];
		}

		const responseJson = await response.json() as OllamaProcessesResponse;

		const loadedModels = responseJson.models;
		if (!loadedModels) return [];

		return loadedModels.map(model => model.model);
	}


    async getModelCapabilities(modelId: string): Promise<OllamaCapability[]> {
		const { data: response, error } = await ollamaRequest('/api/show', 'POST', {
			model: modelId,
		});

		if (error) {
			logger.warn('OllamaProvider:getModelCapabilities', `Error getting model capabilities for ${modelId}: ${error}`);
			return [];
		}

		if (response.status !== 200) {
			return [];
		}

		const responseJson = await response.json() as OllamaModelInfoResponse;

		return responseJson.capabilities as OllamaCapability[];
	}


    generateChatTitle(messages: ChatMessage[]): Promise<string> {
        return ollamaApi.generateChatTitle(messages);
    }

    async loadModelIntoMemory(modelId: string): Promise<boolean> {
		const { data: response, error } = await ollamaRequest('/api/generate', 'POST', {
			model: modelId,
		});

		if (error) {
			logger.warn('OllamaProvider:loadModelIntoMemory', 'Error loading model into memory:', error);
			return false;
		}

		if (response.status !== 200) {
			return false;
		}

		return true;
	}

    async unloadModel(modelId: string): Promise<boolean> {
		const { data: response, error } = await ollamaRequest('/api/generate', 'POST', {
			model: modelId,
			keep_alive: 0
		});

		if (error) {
			logger.warn('OllamaAPI', 'Error unloading model:', error);
			return false;
		}

		if (response.status !== 200) {
			return false;
		}

		return true;
	}
}