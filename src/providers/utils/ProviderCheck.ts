import type { LLMProvider } from "../base/ProviderInterface";
import { OllamaProvider } from "../ollama/OllamaProvider";

export const isOllamaProvider = (provider: LLMProvider): provider is OllamaProvider => 
    provider instanceof OllamaProvider;
