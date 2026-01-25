import type { ReadableOf } from "@/types/util";
import type { ChatIteratorChunk, ChatOptions, Model, ModelCapabilities } from "../base/types";
import { lpCloudWrapper } from "./LPCloudWrapper";
import { reactive, ref, type Reactive, type Ref } from "vue";
import type { ConnectionState } from "../base/ProviderInterface";
import { BaseProvider } from "../base/BaseProvider";
import type { ModelInfo } from "@/composables/useProviderManager";
import { appMesagesToOllama } from "../ollama/converters/appMessagesToOllama";
import { chat } from "./helpers/chat";
import * as helpers from "./helpers/generateChatTitle";


export class LPCloudProvider extends BaseProvider {
    name = "LlamaPen Cloud";
    rawModels: Ref<ModelInfo[]> = ref<ModelInfo[]>([]);;

    connectionState: Reactive<ConnectionState> = reactive({
        status: 'disconnected',
        error: undefined,
        lastChecked: undefined
    });

    protected onModelsLoaded(): void {
        for (const model of this.rawModels.value) {
            this.fetchedCapabilities.value.set(
                model.info.id, 
                model.info.capabilities
            );
        }
    }

    async refreshConnection(): Promise<void> {
        this.connectionState.status = 'checking';

        const returnedError = await lpCloudWrapper.checkConnection();

        if (returnedError) {
            this.connectionState.status = 'error';
            this.connectionState.error = returnedError.message;
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
        const list = await lpCloudWrapper.list();

        return list.map((m) => {
            return {
                name: m.name,
                id: m.model,
                capabilities: {
                    supportsFunctionCalling: m.capabilities.includes('tools'),
                    supportsReasoning: m.capabilities.includes('thinking'),
                    supportsVision: m.capabilities.includes('vision'),
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

    generateChatTitle(messages: ChatMessage[]): Promise<string> {
        return helpers.generateChatTitle(messages);
    }
}