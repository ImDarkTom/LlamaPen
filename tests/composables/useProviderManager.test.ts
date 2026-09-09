import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

import type { ModelInfo } from '../../src/composables/useProviderManager';

const rawModels = ref<ModelInfo[]>([]);

vi.mock('@/providers/ProviderFactory', () => ({
    providerFactory: {
        getProviders: () => [],
        getSelectedProviderId: () => 'test-provider',
        getSelectedProvider: () => ({ rawModels }),
    },
}));

const { useProviderManager } = await import('../../src/composables/useProviderManager');
const { useConfigStore } = await import('../../src/stores/useConfigStore');

function mockModel(overrides: Partial<ModelInfo['info']>): ModelInfo {
    return {
        app: { displayName: 'Test', hidden: false, subtitle: '' },
        info: {
            name: 'Test',
            id: 'test-model',
            external_link: null,
            created: null,
            description: null,
            context_length: null,
            capabilities: [],
            architecture: { input_modalities: ['text'], output_modalities: ['text'] },
            supported_parameters: [],
            default_parameters: {},
            knowledge_cutoff: null,
            ...overrides,
        },
    };
}

describe('useProviderManager selected model', () => {
    beforeEach(() => {
        localStorage.clear();

        const app = createApp({});
        const pinia = createPinia();
        app.use(pinia);
        setActivePinia(pinia);

        useConfigStore().selectedModel = 'test-model';
    });

    it('only sends generation params the model supports', () => {
        rawModels.value = [mockModel({ supported_parameters: ['temperature', 'top_p'] })];

        const config = useConfigStore();
        config.chat.messageOptionsEnabled = true;
        config.chat.messageOptions.temperature = 0.5;

        expect(useProviderManager().getSelectedModel().getGenerationParams()).toEqual({
            temperature: 0.5,
            top_p: config.chat.messageOptions.top_p,
        });
    });

    it('sends no generation params while they are turned off', () => {
        rawModels.value = [mockModel({ supported_parameters: ['temperature'] })];
        useConfigStore().chat.messageOptionsEnabled = false;

        expect(useProviderManager().getSelectedModel().getGenerationParams()).toBeUndefined();
    });

    it('omits reasoning entirely for models that do not support it', () => {
        const config = useConfigStore();
        config.chat.thinking.enabled = true;

        rawModels.value = [mockModel({ supported_parameters: ['temperature'] })];
        expect(useProviderManager().getSelectedModel().getReasoningEnabled()).toBeUndefined();

        rawModels.value = [mockModel({ supported_parameters: ['reasoning'] })];
        expect(useProviderManager().getSelectedModel().getReasoningEnabled()).toBe(true);

        config.chat.thinking.enabled = false;
        expect(useProviderManager().getSelectedModel().getReasoningEnabled()).toBe(false);
    });

    it('drops a reasoning effort the model does not list', () => {
        rawModels.value = [
            mockModel({
                reasoning: { default_enabled: true, supported_efforts: ['low', 'high'] },
            }),
        ];

        const config = useConfigStore();
        const { getSelectedModel } = useProviderManager();

        config.chat.thinking.effort = 'high';
        expect(getSelectedModel().getReasoningEffort()).toBe('high');

        config.chat.thinking.effort = 'xhigh';
        expect(getSelectedModel().getReasoningEffort()).toBeUndefined();
    });

    it('drops max reasoning tokens unless the model supports them', () => {
        useConfigStore().chat.thinking.maxTokens = 2048;

        rawModels.value = [mockModel({ reasoning: { default_enabled: true } })];
        expect(useProviderManager().getSelectedModel().getReasoningMaxTokens()).toBeUndefined();

        rawModels.value = [
            mockModel({
                reasoning: { default_enabled: true, supports_max_tokens: true },
            }),
        ];
        expect(useProviderManager().getSelectedModel().getReasoningMaxTokens()).toBe(2048);
    });
});
