import { ref, type Ref } from "vue";
import type { BaseLLMProvider } from "./ProviderInterface";
import type { Model, ModelCapabilities } from "./types";
import { useConfigStore } from "@/stores/config";
import type { ModelInfo } from "@/composables/useProviderManager";

export abstract class BaseProvider implements BaseLLMProvider {
    abstract readonly name: string;
    abstract readonly connectionState: BaseLLMProvider['connectionState'];

    abstract rawModels: Ref<ModelInfo[]>;
    protected fetchedCapabilities = ref<Map<string, ModelCapabilities>>(new Map());
    protected loading = ref(false);
    protected initialised = ref(false);
    private loadPromise: Promise<void | null> | null = null;

    async loadModels(force: boolean = false): Promise<void | null> {
        if (this.initialised.value && !force) return;
        if (this.loadPromise) return this.loadPromise;

        if (this.connectionState.status === 'error') {
            return;
        }

        this.loading.value = true;

        this.loadPromise = (async () => {
            try {
                this.rawModels.value = (await this.getModels())
                    .map((model) => {
                        const modelId = model.id;

                        const displayName = 
                            useConfigStore().chat.modelRenames[modelId] ||
                            model.name ||
                            modelId;

                        const isHidden = useConfigStore().chat.hiddenModels.includes(modelId);

                        return {
                            info: model,
                            displayName,
                            loadedInMemory: false,
                            hidden: isHidden,
                        }
                    });

                await this.onModelsLoaded();
            }  finally {
                this.initialised.value = true;
                this.loading.value = false;
                this.loadPromise = null;
            }

            return this.loadPromise;
        })();
    }

    /**
     * Hook for provider-specific logic after models are loaded with no errors.
     */
    protected async onModelsLoaded(): Promise<void> {
        // Override in subclasses if needed
    }


    abstract refreshConnection(): Promise<void>;
    abstract chat(...args: any): Promise<any>;
    abstract getModels(): Promise<Model[]>;
    abstract getAllModels(): ModelInfo[];
    abstract getModelCapabilities(modelId: string): ModelCapabilities;
    abstract generateChatTitle(messages: ChatMessage[]): Promise<string>;
}