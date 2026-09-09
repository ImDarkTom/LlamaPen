import logger from "@/lib/logger";
import type { LLMProvider } from "./base/ProviderInterface";
import { OllamaProvider } from "./ollama/OllamaProvider";
import type { KeyedCustomProvider } from "@/stores/useCustomProvidersStore";
import { OpenAIProvider } from "./openai/OpenAIProvider";

export class ProviderFactory {
    private providers = new Map<string, LLMProvider>();
    private selectedProvider = localStorage.getItem('selectedProvider') || this.providers.keys().next().value;

    private getFallbackProviderKey() {
        return this.providers.keys().next().value;
    }

    register(provider: KeyedCustomProvider) {
        let instance: LLMProvider;

        if (provider.format === 'ollama') {
            instance = new OllamaProvider(provider.name, provider);
        } else if (provider.format === 'openai') {
            instance = new OpenAIProvider(provider.name, provider);
        } else {
            // Legacy provider instances without a `format` property were always OpenAI
            instance = new OpenAIProvider(provider.name, provider);
        }

        this.providers.set(provider.key, instance);
    }

    getProviders(): Map<string, LLMProvider> {
        return this.providers;
    }

    setSelectedProvider(providerKey: string) {
        const provider = this.providers.get(providerKey);
        if (provider !== undefined) {
            this.selectedProvider = providerKey;
        } else {
            logger.error('ProviderFactory:setSelectedProvider', 'Invalid provider key', providerKey);
            const fallbackProviderKey = this.getFallbackProviderKey();
            if (!fallbackProviderKey) {
                localStorage.removeItem('selectedProvider');
                return;
            }

            this.selectedProvider = fallbackProviderKey;
        }

        localStorage.setItem('selectedProvider', this.selectedProvider);
    }

    getSelectedProviderId() {
        return this.selectedProvider;
    }

    getSelectedProvider(): LLMProvider {
        const provider = this.selectedProvider ? this.providers.get(this.selectedProvider) : this.providers.values().next().value;
        if (!provider) {
            const fallbackProviderKey = this.getFallbackProviderKey();
            if (!fallbackProviderKey) {
                throw new Error('No providers registered');
            }

            logger.warn('ProviderFactory:getSelectedProvider', `Provider '${this.selectedProvider}' not found, falling back to ${fallbackProviderKey}`);
            this.setSelectedProvider(fallbackProviderKey);
            return this.providers.get(fallbackProviderKey)!;
        }
        return provider;
    }
}

export const providerFactory = new ProviderFactory();
