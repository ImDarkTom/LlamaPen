import { ref } from 'vue';

type ModelCapabiltyCache = Record<string, string[]>;

const cachedCapabilities = ref<ModelCapabiltyCache>(JSON.parse(sessionStorage.getItem('cachedCapabilities') || '{}'));

export function useModelCapabiltyCache() {
    const addToCache = (model: string, capabilities: string[]) => {
        cachedCapabilities.value[model] = capabilities;
        sessionStorage.setItem('cachedCapabilities', JSON.stringify(cachedCapabilities.value));
    }
    
    return {
        addToCache,
        cachedCapabilities
    }
};