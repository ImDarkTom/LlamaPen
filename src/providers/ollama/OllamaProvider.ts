import type { ReadableOf } from "@/types/util";
import { chat, generateChatTitle } from "./helpers";
import type { ChatIteratorChunk, ChatOptions, Model, ModelCapabilities } from "../base/types";
import { appMesagesToOllama } from "./converters/appMessagesToOllama";
import { ollamaWrapper } from "./OllamaWrapper";
import type { ShowResponse } from "ollama";
import { reactive, ref, type Reactive, type Ref } from "vue";
import type { ConnectionState, OllamaLLMProvider } from "../base/ProviderInterface";
import { BaseProvider } from "../base/BaseProvider";
import { useConfigStore } from "@/stores/config";
import type { ModelInfo } from "@/composables/useProviderManager";

/**
 * Interfaces with the Ollama wrapper before packaging responses into the common app standard.
 */
export class OllamaProvider extends BaseProvider implements OllamaLLMProvider {
	name = "Ollama";
	hasOllamaFeatures = true as const;
	rawModels: Ref<ModelInfo[], ModelInfo[]> = ref<ModelInfo[]>([]);;
	

	protected async onModelsLoaded(): Promise<void> {
		let loadedModelIds = await this.getLoadedModelIds();

		this.rawModels.value = this.rawModels.value.map(m => {
			return {
				...m,
				loadedInMemory: loadedModelIds.includes(m.info.id),
			};
		});

		const config = useConfigStore();
		const shouldAutoloadCapabilities = !config.cloud.enabled && 
			(
				config.ollama.modelCapabilities.autoload && this.rawModels.value.length < 31
				|| config.ollama.modelCapabilities.alwaysAutoload
			);

		if (shouldAutoloadCapabilities) {
			for (const model of this.rawModels.value) {
				const capabilities = await this.fetchModelCapabilities(model.info.id);
				this.fetchedCapabilities.value.set(model.info.id, capabilities);
			}
		}
	}

	connectionState: Reactive<ConnectionState> = reactive({
		status: 'disconnected',
		error: undefined,
		lastChecked: undefined
	});

	async refreshConnection(): Promise<void> {
		this.connectionState.status = 'checking';

		const { error } = await ollamaWrapper.version();

		if (error) {
			this.connectionState.status = 'error';
			this.connectionState.error = error.message;
		} else {
			this.connectionState.status = 'connected';
			this.connectionState.error = undefined;
			this.connectionState.lastChecked = new Date();
		}
	}

    async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<ReadableOf<ChatIteratorChunk>> {
		const ollamaFormatMessages = await appMesagesToOllama(messages);
        return chat(ollamaFormatMessages, abortSignal, options);
    }
    
    async getModels(): Promise<Model[]> {
		const list = await ollamaWrapper.list();

		return list.map((m) => {
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

	getModelCapabilities(modelId: string): ModelCapabilities {
		return this.fetchedCapabilities.value.get(modelId) ?? {
			supportsFunctionCalling: false,
			supportsReasoning: false,
			supportsVision: false,
		};
	}

    private async fetchModelCapabilities(modelId: string): Promise<ModelCapabilities> {
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