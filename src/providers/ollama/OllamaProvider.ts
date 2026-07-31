import { chat, generateChatTitle } from "./helpers";
import type { ChatIteratorChunk, ChatOptions, ProviderMetadata } from "../base/types";
import { appMesagesToOllama } from "./converters/appMessagesToOllama";
import { OllamaWrapper } from "./OllamaWrapper";
import { reactive, ref, type Reactive } from "vue";
import type { ConnectionState, LLMProvider, ModelDownloadProgress } from "../base/ProviderInterface";
import { BaseProvider } from "../base/BaseProvider";
import { useConfigStore } from "@/stores/useConfigStore";
import type { ModelCapability, ModelInfo, ProviderModelInfo } from "@/composables/useProviderManager";
import type { ModelAttributes } from "@/components/ModelsPage/types";

/**
 * Interfaces with the Ollama wrapper before packaging responses into the common app standard.
 */
export class OllamaProvider extends BaseProvider {
    readonly name: string;
    readonly type = 'ollama';
    config: LLMProvider['config']

    readonly rawModels = ref<ModelInfo[]>([]);

    readonly connectionState: Reactive<ConnectionState> = reactive({
        status: 'disconnected',
        error: undefined,
        lastChecked: undefined
    });

    private loadedModelIds = ref<Set<string>>(new Set());

    private downloadProgress = ref<Record<string, ModelDownloadProgress>>({});
    private downloadsAbortControllers = new Map<string, AbortController>();

    readonly features = {
        modelMemory: {
            loadedModelIds: this.loadedModelIds,

            load: async (modelId) => {
                return this.ollamaWrapper.loadIntoMemory(modelId);
            },
            unload: async (modelId) => {
                return this.ollamaWrapper.unloadFromMemory(modelId);
            },

            refreshLoadedModels: async () => {
                const loadedModels = await this.ollamaWrapper.ps();
                this.loadedModelIds.value = new Set(loadedModels.map(model => model.model));
            }
        },
        modelAdmin: {
            copy: (source, destination) => {
                return this.ollamaWrapper.copy({ source, destination });
            },

            delete: (modelId) => {
                return this.ollamaWrapper.delete({ model: modelId });
            },

            externalModelUrl: (modelId) => {
                return `https://ollama.com/library/${modelId}`;
            },
        },
        modelDownload: {
            progress: this.downloadProgress,

            download: async (modelId) => {
                if (this.downloadProgress.value[modelId]) {
                    return { success: false, reason: `Already downloading '${modelId}'` };
                }

                const abortController = new AbortController();
                this.downloadsAbortControllers.set(modelId, abortController);

                const { data: stream, error } = await this.ollamaWrapper.pull({ model: modelId, stream: true }, abortController);

                if (error) {
                    this.downloadsAbortControllers.delete(modelId);
                    return { success: false, reason: 'Failed to download model.' }; // We already log the error
                }

                try {
                    for await (const progress of stream) {
                        this.downloadProgress.value[modelId] = progress;

                        if (progress.status === 'success') {
                            delete this.downloadProgress.value[modelId];
                            return { success: true }
                        }
                    }
                } catch (e) {
                    delete this.downloadProgress.value[modelId];

                    if (e === 'userRequestCancel') {
                        return { success: false };
                    }

                    return {
                        success: false,
                        reason: `Error while downloading: ${e instanceof Error ? e.message : String(e)}`
                    };
                } finally {
                    this.downloadsAbortControllers.delete(modelId);
                }

                return { success: false, reason: 'Unknown error occurred during download.' };
            },

            cancel: (modelId) => {
                if (!this.downloadProgress.value[modelId]) return;

                this.downloadsAbortControllers
                    .get(modelId)
                    ?.abort('userRequestCancel');
            },
        }
    } satisfies LLMProvider['features'];



    private ollamaWrapper: OllamaWrapper;

    constructor(name: string, config: LLMProvider['config']) {
        super();

        this.name = name;
        this.config = config;

        this.ollamaWrapper = new OllamaWrapper({ host: config.baseURL, headers: { 'Authorization': `Bearer ${config.apiKey}` } })
    }


    protected async onModelsLoaded(): Promise<void> {
        await this.features.modelMemory.refreshLoadedModels();

        this.rawModels.value = this.rawModels.value.map(m => {
            return {
                ...m,
                subtitle: m.info.id,
            };
        });

        const config = useConfigStore();
        const shouldAutoloadCapabilities =
            config.provider.ollama.autoloadCapabilities && this.rawModels.value.length < 31
            || config.provider.ollama.alwaysAutoloadCapabilities;

        if (shouldAutoloadCapabilities) {
            for (const model of this.rawModels.value) {
                const capabilities = await this.fetchModelCapabilities(model.info.id);
                this.fetchedCapabilities.value.set(model.info.id, capabilities);
            }
        }
    }

    public async refreshConnection(): Promise<void> {
        this.connectionState.status = 'checking';

        const { error } = await this.ollamaWrapper.version();

        if (error) {
            this.connectionState.status = 'error';
            this.connectionState.error = error.message;
        } else {
            this.connectionState.status = 'connected';
            this.connectionState.error = undefined;
            this.connectionState.lastChecked = new Date();
        }
    }


    public async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<AsyncIterable<ChatIteratorChunk>> {
        const ollamaFormatMessages = await appMesagesToOllama(messages);
        return chat(this.ollamaWrapper, ollamaFormatMessages, abortSignal, options);
    }

    public async getModels(): Promise<ProviderModelInfo[]> {
        const list = await this.ollamaWrapper.list();

        return list.map((m) => {
            const providerMetadata: ProviderMetadata = {
                provider: 'ollama',
                data: {
                    size: m.size,
                    parameterSize: m.details.parameter_size,
                    family: m.details.family,
                    modifiedAt: m.modified_at,
                    quantization: m.details.quantization_level,
                    context_length: (m.details as Record<string, any>).context_length,
                }
            };

            return {
                name: m.name,
                id: m.model,
                external_link: `https://ollama.com/library/${m.model}`,
                created: new Date(m.modified_at.toTimeString as unknown as string).getTime() ?? null,
                description: null, // todo: supplement on 
                context_length: null,
                capabilities: [],
                providerMetadata,
            }
        });
    }

    public getModelCapabilities(modelId: string): string[] {
        return this.fetchedCapabilities.value.get(modelId) ?? [];
    }

    public async getModelAttributes(modelId: string): Promise<ModelAttributes> {
        const { data: modelInfo, error } = await this.ollamaWrapper.show({ model: modelId });
        if (error) throw new Error('Could not fetch model details.');

        if (!this.fetchedCapabilities.value.has(modelId)) {
            this.fetchedCapabilities.value.set(modelId, modelInfo.capabilities);
        }

        return {
            'License': modelInfo.license,
            'Modelfile': modelInfo.modelfile,
            'Template': modelInfo.template,
            'Details': modelInfo.details as unknown as Record<string, unknown>,
            'Model Info': modelInfo.model_info as unknown as Record<string, unknown>,
        }
    }

    public async generateChatTitle(messages: ChatMessage[]): Promise<string> {
        return generateChatTitle(this.ollamaWrapper, messages);
    }

    private async fetchModelCapabilities(modelId: string): Promise<string[]> {
        // 'completion' | 'tools' | 'thinking' | 'vision' | 'insert' | 'embedding' | 'search'
        const CAPABILITY_MAP: Record<string, ModelCapability> = {
            thinking: 'reasoning',
        };

        const { data: modelInfo, error } = await this.ollamaWrapper.show({ model: modelId });
        if (error || !modelInfo) {
            return [];
        }

        return modelInfo.capabilities.map((c) => CAPABILITY_MAP[c] ?? c);
    }
}