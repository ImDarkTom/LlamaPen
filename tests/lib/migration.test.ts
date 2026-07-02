import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "vue";
import { createPinia, setActivePinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import { useConfigStore } from "../../src/stores/useConfigStore";
import { KeyedCustomProvider, useCustomProvidersStore } from "../../src/stores/useCustomProvidersStore";

function setupPinia() {
    const app = createApp({});
    const pinia = createPinia();

    pinia.use(piniaPluginPersistedstate);
    app.use(pinia);
    setActivePinia(pinia);
}

describe('migration tests', () => {
    beforeEach(() => {
        localStorage.clear();
        setupPinia();
    });

    it('migrates v2 config to seeded provider', () => {
        localStorage.setItem('config', JSON.stringify({
            _version: 2,
            ollama: {
                url: 'http://ollama-url.test:11434',
                modelCapabilities: {
                    autoload: true,
                    alwaysAutoload: true,
                },
            },
        }));

        const config = useConfigStore();
        const providerStore = useCustomProvidersStore();

        // We should have auto migrated

        expect(config._version).toBe(3);
        expect((config as any).ollama).toBeUndefined();

        expect(config.provider.ollama).toEqual({
            autoloadCapabilities: true,
            alwaysAutoloadCapabilities: true,
        });

        expect(providerStore.providers.find((p: KeyedCustomProvider) => p.key === 'ollama')).toMatchObject({
            name: 'Ollama',
            apiKey: 'ollama',
            format: 'ollama',
            baseURL: 'http://ollama-url.test:11434',
            seededDefault: true,
        });
    });

    it('migrates v0 ollamaUrl through to seeded provider', () => {
        localStorage.setItem('config', JSON.stringify({
            ollamaUrl: 'http://v0-ollama-url.test:11434',
            ollama: {
                modelCapabilities: {
                    autoload: true,
                    alwaysAutoload: true,
                },
            },
        }));

        const config = useConfigStore();
        const providerStore = useCustomProvidersStore();

        // We should have auto migrated

        expect(config._version).toBe(3);
        expect((config as any).ollamaUrl).toBeUndefined();

        expect(providerStore.providers.find((p: KeyedCustomProvider) => p.key === 'ollama')).toMatchObject({
            name: 'Ollama',
            apiKey: 'ollama',
            format: 'ollama',
            baseURL: 'http://v0-ollama-url.test:11434',
            seededDefault: true,
        });
    });

    it('preserves existing providers when seeding ollama', () => {
        localStorage.setItem('customProvidersStore', JSON.stringify({
            providers: [
                {
                    key: 'custom-1111',
                    name: 'OpenAI',
                    format: 'openai',
                    baseURL: 'https://api.openai.com/v1',
                    apiKey: 'sk-test',
                },
            ],
        }));

        localStorage.setItem('config', JSON.stringify({
            _version: 2,
            ollama: {
                url: 'http://ollama-url.test:11434',
                modelCapabilities: {
                    autoload: true,
                    alwaysAutoload: false,
                },
            },
        }));

        useConfigStore();

        const providers = useCustomProvidersStore().providers;

        expect(providers.some((p: KeyedCustomProvider) => p.key === 'custom-1111')).toBe(true);
        expect(providers.find((p: KeyedCustomProvider) => p.key === 'ollama')).toMatchObject({
            key: 'ollama',
            name: 'Ollama',
            apiKey: 'ollama',
            format: 'ollama',
            baseURL: 'http://ollama-url.test:11434',
            seededDefault: true
        });
    })
});