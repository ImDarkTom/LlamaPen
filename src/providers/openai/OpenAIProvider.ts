import type { ModelCapability, ModelInfo } from "@/composables/useProviderManager";
import { BaseProvider } from "../base/BaseProvider";
import type { Reactive, Ref } from "vue";
import type { ConfigurableProvider, ConnectionState } from "../base/ProviderInterface";
import type { ChatOptions, ChatIteratorChunk, ProviderMetadata } from "../base/types";
import type { ModelAttributes } from "@/components/ModelsPage/types";
import { OpenAI } from "openai";
import { chatHelper } from "./chatHelper";
import logger from "@/lib/logger";
import { CapabilityParser, NameParser, SubtitleParser } from "./nonStandardParsing";

type OpenAIConfig = {
    name: string;
    apiKey: string;
    baseURL: string;
}

export class OpenAIProvider extends BaseProvider implements ConfigurableProvider<OpenAIConfig> {
    readonly name: string;
    readonly type = 'openai';

    readonly rawModels: Ref<ModelInfo[], ModelInfo[]> = ref([]);

    readonly connectionState: Reactive<ConnectionState> = reactive({
        status: 'disconnected',
        error: undefined,
        lastChecked: undefined
    });

    readonly features = {};

    private client: OpenAI;

    config: OpenAIConfig;

    constructor(config: OpenAIConfig) {
        super();

        this.name = config.name;
        this.config = config;

        this.client = new OpenAI({
            apiKey: this.config.apiKey,
            baseURL: this.config.baseURL,
            dangerouslyAllowBrowser: true,
        });
    }

    public async refreshConnection(): Promise<void> {
        this.connectionState.status = 'checking';

        try {
            await this.client.models.list()
            this.connectionState.status = 'connected';
            this.connectionState.error = undefined;
            this.connectionState.lastChecked = new Date();
        } catch (error) {
            logger.error("Failed to connect to OpenAI-compatible provider:", error);

            this.connectionState.status = 'error';
            if (error instanceof Error) {
                this.connectionState.error = `Connection failed: ${error.message}`;
                return;
            }

            this.connectionState.error = `Unknown error: ${String(error)}`;
        }
    }

    public async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<AsyncIterable<ChatIteratorChunk>> {
        return chatHelper(messages, abortSignal, options, this.client);
    }

    public getModelCapabilities(modelId: string): ModelCapability[] {
        const model = this.rawModels.value.find((model) => model.info.id === modelId);
        if (!model?.info.providerMetadata) return [];

        return CapabilityParser.attemptParseModelCapabilities(model.info.providerMetadata);
    }

    public async getModelAttributes(modelId: string): Promise<ModelAttributes> {
        const model = this.rawModels.value.find(m => m.info.id === modelId);
        if (!model || model.info.providerMetadata?.provider !== 'openai') return {};

        return {
            'Metadata': {
                'Created': model.info.providerMetadata.data.created.toLocaleString(),
                'Owned By': model.info.providerMetadata.data.ownedBy,
            }
        }
    }

    public async generateChatTitle(messages: ChatMessage[]): Promise<string> {
        return messages[0].content.slice(0, 20) + (messages[0].content.length > 20 ? '...' : '');
    }

    protected async getModels(): Promise<ModelInfo[]> {
        const models = await this.client.models.list();

        return models.data.map((model) => {
            const providerMetadata: ProviderMetadata = {
                provider: 'openai',
                data: {
                    created: new Date(model.created * 1000),
                    ownedBy: model.owned_by,
                    allInfo: model,
                }
            };

            return {
                displayName: NameParser.getNameForModel(providerMetadata, model.id),
                hidden: false,
                info: {
                    capabilities: [],
                    id: model.id,
                    name: NameParser.getNameForModel(providerMetadata, model.id),
                    subtitle: SubtitleParser.getSubtitleForModel(providerMetadata),
                    providerMetadata,
                }
            }
        });
    }
}
