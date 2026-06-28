import type { LLMProvider, ModelMemoryFeature } from "../base/ProviderInterface";

export const hasModelMemoryFeature = (
    provider: LLMProvider
): provider is LLMProvider & { features: { modelMemory: ModelMemoryFeature } } => {
    return provider.features.modelMemory !== undefined;
}
