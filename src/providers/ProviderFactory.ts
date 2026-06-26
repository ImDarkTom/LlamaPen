import logger from "@/lib/logger";
import type { LLMProvider } from "./base/ProviderInterface";
import { OllamaProvider } from "./ollama/OllamaProvider";

class ProviderFactory {
    private providers = new Map<string, LLMProvider>();
    private selectedProvider = localStorage.getItem('selectedProvider') || "ollama";

    register(name: string, provider: LLMProvider) {
        this.providers.set(name, provider);
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
providerFactory.register('ollama', new OllamaProvider());
