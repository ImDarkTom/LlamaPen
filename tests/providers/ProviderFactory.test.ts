import { beforeEach, describe, expect, it } from "vitest";

import { ProviderFactory } from "../../src/providers/ProviderFactory";

describe('ProviderFactory', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('falls back to a registered provider when the selected provider is stale', () => {
        localStorage.setItem('selectedProvider', 'ollama');

        const factory = new ProviderFactory();
        factory.register({
            key: 'custom-1111',
            name: 'OpenAI',
            format: 'openai',
            baseURL: 'https://api.openai.com/v1',
            apiKey: 'sk-test',
        });

        const selectedProvider = factory.getSelectedProvider();

        expect(selectedProvider.name).toBe('OpenAI');
        expect(factory.getSelectedProviderId()).toBe('custom-1111');
        expect(localStorage.getItem('selectedProvider')).toBe('custom-1111');
    });
});
