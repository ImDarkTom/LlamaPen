import { useConfigStore } from '@/stores/config';
import ollamaRequest from '@/utils/ollamaRequest';
import { ref } from 'vue';

type ModelCapabiltyCache = Record<string, string[]>;

const cachedCapabilities = ref<ModelCapabiltyCache>(JSON.parse(sessionStorage.getItem('cachedCapabilities') || '{}'));

export function useModelCapabiltyCache() {
    const loadModelCapabilities = async (model: string): Promise<OllamaModelInfoResponse> => {
        const config = useConfigStore();

        if (config.api.enabled) {
            // If API is enabled, just use a placeholder so we don't unnecessarily ping
            return {
                capabilities: [],
                details: {
                    families: [],
                    family: '',
                    format: '',
                    parameter_size: '',
                    parent_model: '',
                    quantization_level: ''
                },
                license: '',
                modelfile: '',
                tensors: [],
                template: '',
                modified_at: '',
                model_info: {
                    "general.architecture": '',
                    "general.basename": model,
                    "general.file_type": 0,
                    "general.finetune": '',
                    "general.languages": '',
                    "general.parameter_count": -1,
                    "general.quantization_version": -1,
                    "general.size_label": '',
                    "general.tags": null,
                    "general.type": '',
                },
            };
        }

        const { data: response, error } = await ollamaRequest('/api/show', 'POST', {
            model,
        });

        if (error) {
            throw new Error(`Failed to load model capabilities for ${model}: ${error.message}`);
        }

        const modelInfo = (await response.json()) as OllamaModelInfoResponse;
        addToCache(model, modelInfo.capabilities);

        return modelInfo;
    }

    const addToCache = (model: string, capabilities: string[]) => {
        cachedCapabilities.value[model] = capabilities;
        sessionStorage.setItem('cachedCapabilities', JSON.stringify(cachedCapabilities.value));
    }
    
    return {
        addToCache,
        cachedCapabilities,
        loadModelCapabilities,
    }
};