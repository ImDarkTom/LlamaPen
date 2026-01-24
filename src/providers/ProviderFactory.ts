import type { LLMProvider } from "./base/ProviderInterface";
import { LPCloudProvider } from "./lpcloud/LPCloudProvider";
import { OllamaProvider } from "./ollama/OllamaProvider";

class ProviderFactory {
    private providers = new Map<string, LLMProvider>();

    register(name: string, provider: LLMProvider) {
        this.providers.set(name, provider);
    }

    get(name: string): LLMProvider | undefined {
        return this.providers.get(name);
    }

    getCurrentProvider(): LLMProvider {
        // For now, always return OllamaProvider
        const provider = this.providers.get('lpcloud');
        if (!provider) {
            throw new Error("No provider registered under 'ollama'");
        }
        return provider;
    }
}

export const providerFactory = new ProviderFactory();
providerFactory.register('ollama', new OllamaProvider());
providerFactory.register('lpcloud', new LPCloudProvider());