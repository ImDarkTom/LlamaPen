import ollamaRequest from '@/utils/ollamaRequest';
import { ref } from 'vue';

type ModelCapabiltyCache = Record<string, string[]>;

const cachedCapabilities = ref<ModelCapabiltyCache>(JSON.parse(sessionStorage.getItem('cachedCapabilities') || '{}'));

export function useModelCapabiltyCache() {
    const loadModelCapabilities = async (model: string): Promise<OllamaModelInfoResponse> => {
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