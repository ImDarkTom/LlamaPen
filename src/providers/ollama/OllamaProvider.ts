import { chat, generateChatTitle } from "./helpers";
import type { ChatIteratorChunk, ChatOptions, ProviderMetadata } from "../base/types";
import { appMesagesToOllama } from "./converters/appMessagesToOllama";
import { ollamaWrapper } from "./OllamaWrapper";
import { reactive, ref, type Reactive } from "vue";
import type { ConnectionState, MemoryManagedProvider } from "../base/ProviderInterface";
import { BaseProvider } from "../base/BaseProvider";
import { useConfigStore } from "@/stores/useConfigStore";
import type { ModelCapability, ModelInfo } from "@/composables/useProviderManager";
import type { ModelAttributes } from "@/components/ModelsPage/types";
import { SubtitleParser } from "../openai/nonStandardParsing";

/**
 * Interfaces with the Ollama wrapper before packaging responses into the common app standard.
 */
export class OllamaProvider extends BaseProvider implements MemoryManagedProvider {
    readonly name = "Ollama";
    readonly type = 'ollama';

    readonly rawModels = ref<ModelInfo[]>([]);
    readonly loadedModelIds = ref<Set<string>>(new Set());

    readonly hasOllamaFeatures = true as const;

    readonly connectionState: Reactive<ConnectionState> = reactive({
        status: 'disconnected',
        error: undefined,
        lastChecked: undefined
    });


    protected async onModelsLoaded(): Promise<void> {
        await this.refreshLoadedModels();

        this.rawModels.value = this.rawModels.value.map(m => {
            return {
                ...m,
                subtitle: m.info.id,
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

    public async refreshConnection(): Promise<void> {
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


    public async chat(messages: ChatMessage[], abortSignal: AbortSignal, options: ChatOptions): Promise<AsyncIterable<ChatIteratorChunk>> {
        const ollamaFormatMessages = await appMesagesToOllama(messages);
        return chat(ollamaFormatMessages, abortSignal, options);
    }

    public async getModels(): Promise<ModelInfo[]> {
        const configStore = useConfigStore();
        const list = await ollamaWrapper.list();

        return list.map((m) => {
            const displayName = configStore.chat.modelRenames[m.model] || m.name;
            const isHidden = configStore.chat.hiddenModels.includes(m.model);

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
                displayName,
                hidden: isHidden,
                info: {
                    name: m.name,
                    id: m.model,
                    subtitle: SubtitleParser.getSubtitleForModel(providerMetadata),
                    capabilities: [],
                    providerMetadata,
                }
            }
        });
    }

    public getModelCapabilities(modelId: string): string[] {
        return this.fetchedCapabilities.value.get(modelId) ?? [];
    }

    public async getModelAttributes(modelId: string): Promise<ModelAttributes> {
        const { data: modelInfo, error } = await ollamaWrapper.show({ model: modelId });
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
        return generateChatTitle(messages);
    }

    async refreshLoadedModels(): Promise<void> {
        const loadedModels = await ollamaWrapper.ps();
        if (!loadedModels) {
            this.loadedModelIds.value = new Set();
            return;
        }

        this.loadedModelIds.value = new Set(loadedModels.map(model => model.model));
    }

    async loadModelIntoMemory(modelId: string): Promise<boolean> {
        return await ollamaWrapper.loadIntoMemory(modelId);
    }

    async unloadModel(modelId: string): Promise<boolean> {
        return await ollamaWrapper.unloadFromMemory(modelId);
    }

    private async fetchModelCapabilities(modelId: string): Promise<string[]> {
        // 'completion' | 'tools' | 'thinking' | 'vision' | 'insert' | 'embedding' | 'search'
        const CAPABILITY_MAP: Record<string, ModelCapability> = {
            thinking: 'reasoning',
        };

        const { data: modelInfo, error } = await ollamaWrapper.show({ model: modelId });
        if (error || !modelInfo) {
            return [];
        }

        return modelInfo.capabilities.map((c) => CAPABILITY_MAP[c] ?? c);
    }
}