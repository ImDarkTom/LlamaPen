import { defineStore } from 'pinia';
import { ref } from 'vue';

const MODELS_JSON_URL = 'https://imdarktom.github.io/OllamaLibraryAPI/models.json';

export type ModelLibraryResponse = {
    model: string;
    description: string;
    capabilities: string[];
    sizes: string[];
    hasCloud: boolean;
    lastUpdated: string;
    tagCount: string;
    pullCount: string;
}[];

const useOllamaModelLibraryStore = defineStore('ollamaModelLibrary', () => {
    const ollamaModels = ref<ModelLibraryResponse>([]);
    const status = ref<'idle' | 'loading' | 'done' | 'error'>('idle');
    const error = ref<string | null>(null);

    async function fetchOnce() {
        if (status.value === 'done' || status.value === 'loading') return;

        status.value = 'loading';
        try {
            const res = await fetch(MODELS_JSON_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            ollamaModels.value = await res.json();
            status.value = 'done';
        } catch (err) {
            if (err && err instanceof Error) {
                error.value = err.message;
            } else {
                error.value === 'Unknown error.'
            }

            status.value = 'error';
        }
    }

    return {
        ollamaModels,
        status,
        error,
        fetchOnce
    }
});

export default useOllamaModelLibraryStore;