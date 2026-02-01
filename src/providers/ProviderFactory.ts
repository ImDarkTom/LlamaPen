import logger from "@/lib/logger";
import type { LLMProvider } from "./base/ProviderInterface";
import { LPCloudProvider } from "./lpcloud/LPCloudProvider";
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
        // For now, always return OllamaProvider
        const provider = this.providers.get(this.selectedProvider);
        if (!provider) {
            throw new Error(`No provider registered under '${this.selectedProvider}'`);
        }
        return provider;
    }
}

export const providerFactory = new ProviderFactory();
providerFactory.register('ollama', new OllamaProvider());
providerFactory.register('lpcloud', new LPCloudProvider());