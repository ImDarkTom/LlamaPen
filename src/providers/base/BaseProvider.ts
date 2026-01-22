import { ref } from "vue";
import type { BaseLLMProvider } from "./ProviderInterface";
import type { Model, ModelCapabilities } from "./types";
import type { ModelInfo } from "@/composables/useModelList";
import { useConfigStore } from "@/stores/config";
import { OllamaProvider } from "../ollama/OllamaProvider";

export abstract class BaseProvider implements BaseLLMProvider {
    abstract readonly name: string;
    abstract readonly connectionState: BaseLLMProvider['connectionState'];

    protected rawModels = ref<ModelInfo[]>([]);
    protected loading = ref(false);
    protected initialised = ref(false);
    private loadPromise: Promise<void | null> | null = null;

    constructor() {
        this.onLoad()
    }

    protected onLoad() {
        console.log(`Loading provider: ${this.name}`);
    }

    async loadModels(force: boolean = false): Promise<void | null> {
        if (this.initialised.value && !force) return;
        if (this.loadPromise) return this.loadPromise;

        if (this.connectionState.status === 'error') {
            return;
        }

        this.loading.value = true;

        this.loadPromise = (async () => {
            try {
                let loadedModelIds: string[] = [];
                if (this instanceof OllamaProvider) {
                    loadedModelIds = await this.getLoadedModelIds();
                }

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
                            loadedInMemory: loadedModelIds.includes(modelId),
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
     * Hook for provider-specific logic after models are loaded
     */
    protected async onModelsLoaded(): Promise<void> {
        // Override in subclasses if needed
    }


    abstract refreshConnection(): Promise<void>;
    abstract chat(...args: any): Promise<any>;
    abstract getModels(): Promise<Model[]>;
    abstract getModelCapabilities(modelId: string): Promise<ModelCapabilities>;
    abstract generateChatTitle(messages: ChatMessage[]): Promise<string>;
}