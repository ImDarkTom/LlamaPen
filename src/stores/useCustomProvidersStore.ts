import { defineStore } from 'pinia';

export type CustomProvider = {
    name: string;
    baseURL: string;
    apiKey: string;
    format: 'ollama' | 'openai';
    seededDefault?: true;
};

export type KeyedCustomProvider = CustomProvider & { key: string; };

export const useCustomProvidersStore = defineStore('customProvidersStore', () => {
    const providers = ref<KeyedCustomProvider[]>([
        {
            key: 'ollama',
            name: 'Ollama',
            format: 'ollama',
            baseURL: import.meta.env.VITE_DEFAULT_OLLAMA ?? 'http://localhost:11434',
            apiKey: 'ollama',
            seededDefault: true,
        }
    ]);

    function seedDefaultProvider(data: CustomProvider) {
        const existingProvider = providers.value.find((p) => p.seededDefault);

        if (existingProvider) {
            Object.assign(existingProvider, data, {
                key: 'ollama',
                seededDefault: true,
            });
            return;
        }

        providers.value.unshift({
            ...data,
            key: 'ollama',
            seededDefault: true,
        });
    }

    function add(provider: CustomProvider): string {
        const key = `custom-${Date.now()}`;
        providers.value.push({ ...provider, key });
        return key;
    }

    function update(updatedFields: KeyedCustomProvider) {
        const providerKey = providers.value.find((p) => p.key === updatedFields.key);
        if (!providerKey) return;

        const newProvider: CustomProvider = {
            apiKey: updatedFields.apiKey,
            format: updatedFields.format,
            baseURL: updatedFields.baseURL,
            name: updatedFields.name,
        };

        Object.assign(providerKey, newProvider);
    }

    function remove(key: string) {
        // todo: once we migrate to only using custom providers this will ensure the user can't
        // break the app
        if (providers.value.length === 1) throw Error('At least 1 provider is required.');

        const foundIndex = providers.value.findIndex((p) => p.key === key);
        if (foundIndex !== -1) providers.value.splice(foundIndex, 1);
    }

    return { providers, add, update, remove, seedDefaultProvider };
}, {
    persist: true,
});
