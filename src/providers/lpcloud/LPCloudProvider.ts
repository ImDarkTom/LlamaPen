import type { ChatIteratorChunk, ChatOptions, Model, ModelCapabilities } from "../base/types";
import { lpCloudWrapper } from "./LPCloudWrapper";
import { reactive, ref, type Reactive, type Ref } from "vue";
import type { ConnectionState, LPCloudLLMProvider } from "../base/ProviderInterface";
import { BaseProvider } from "../base/BaseProvider";
import type { ModelInfo } from "@/composables/useProviderManager";
import { appMessagesToLPCloud } from "./converters/appMessagesToLPCloud";
import { chat } from "./helpers/chat";
import * as helpers from "./helpers/generateChatTitle";
import useCloudUserStore from "@/stores/useCloudUserStore";


export class LPCloudProvider extends BaseProvider implements LPCloudLLMProvider {
    readonly name = "LlamaPen Cloud";
    readonly rawModels: Ref<ModelInfo[]> = ref([]);

    readonly connectionState: Reactive<ConnectionState> = reactive({
        status: 'disconnected',
        error: undefined,
        lastChecked: undefined
    });

    public get isSignedIn() {
        return useCloudUserStore().isSignedIn;
    }

    protected onModelsLoaded(): void {
        for (const model of this.rawModels.value) {
            this.fetchedCapabilities.value.set(
                model.info.id, 
                model.info.capabilities
            );
        }
    }

    public async refreshConnection(): Promise<void> {
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

    public async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<AsyncIterable<ChatIteratorChunk>> {
        const ollamaFormatMessages = await appMessagesToLPCloud(messages);
        return chat(ollamaFormatMessages, abortSignal, options);
    }
    
    public async getModels(): Promise<Model[]> {
        const list = await lpCloudWrapper.list();

        return list.map((m) => {
            return {
                name: m.name,
                id: m.model,
                subtitle: m.llamapenMetadata.creator,
                capabilities: {
                    supportsFunctionCalling: m.capabilities.includes('tools'),
                    supportsReasoning: m.capabilities.includes('thinking'),
                    supportsVision: m.capabilities.includes('vision'),
                },
                providerMetadata: {
                    provider: 'lpcloud',
                    data: {
                        premium: m.llamapenMetadata.premium ?? false,
                        priceTier: m.llamapenMetadata.priceTier,
                        providerName: m.llamapenMetadata.creator,
                        tags: m.llamapenMetadata.tags ?? [],
                    },
                }
            }
        });
    }

    public getModelCapabilities(modelId: string): ModelCapabilities {
        return this.fetchedCapabilities.value.get(modelId) ?? {
            supportsFunctionCalling: false,
            supportsReasoning: false,
            supportsVision: false,
        };
    }

    public async generateChatTitle(messages: ChatMessage[]): Promise<string> {
        return await helpers.generateChatTitle(messages);
    }
}