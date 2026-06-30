import logger from "@/lib/logger";
import type { LLMProvider } from "./base/ProviderInterface";
import { OllamaProvider } from "./ollama/OllamaProvider";
import type { KeyedCustomProvider } from "@/stores/useCustomProvidersStore";
import { OpenAIProvider } from "./openai/OpenAIProvider";

class ProviderFactory {
    private providers = new Map<string, LLMProvider>();
    private selectedProvider = localStorage.getItem('selectedProvider') || "ollama";

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
            this.selectedProvider = "ollama";
        }

        localStorage.setItem('selectedProvider', this.selectedProvider);
    }

    getSelectedProviderId() {
        return this.selectedProvider;
    }

    getSelectedProvider(): LLMProvider {
        const provider = this.providers.get(this.selectedProvider);
        if (!provider) {
            logger.warn('ProviderFactory:getSelectedProvider', `Provider '${this.selectedProvider}' not found, falling back to ollama`);
            this.setSelectedProvider('ollama');
            return this.providers.get('ollama')!;
        }
        return provider;
    }
}

export const providerFactory = new ProviderFactory();
providerFactory.register({
    key: 'ollama',
    format: 'ollama',
    name: 'Ollama',
    baseURL: import.meta.env.VITE_DEFAULT_OLLAMA ?? 'http://localhost:11434',
    apiKey: 'ollama',
});
