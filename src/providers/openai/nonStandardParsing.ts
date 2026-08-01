import type { ModelCapability, ModelInputModalities, ModelOutputModalities, ModelParameters, ModelReasoningOptions } from "@/composables/useProviderManager";
import type { ProviderMetadata } from "../base/types";
import { numberToNumeral } from "@/utils/core/numberToNumeral";

type OpenAIProviderMetadata = Extract<ProviderMetadata, { provider: 'openai' }>;
type OllamaProviderMetadata = Extract<ProviderMetadata, { provider: 'ollama' }>;

const isOpenAIMetadata = (providerMetadata: ProviderMetadata): providerMetadata is OpenAIProviderMetadata =>
    providerMetadata.provider === 'openai';

const isOllamaMetadata = (providerMetadata: ProviderMetadata): providerMetadata is OllamaProviderMetadata =>
    providerMetadata.provider === 'ollama';

export class CapabilityParser {
    public static attemptParseModelCapabilities(providerMetadata: ProviderMetadata): ModelCapability[] {
        if (!isOpenAIMetadata(providerMetadata)) return [];

        // Try parse as OpenRouter
        const paramsFromOpenRouter = CapabilityParser.attemptParseOpenRouter(providerMetadata);
        if (paramsFromOpenRouter !== null) return paramsFromOpenRouter;

        return ['unavailable'];
    }

    private static attemptParseOpenRouter(providerMetadata: OpenAIProviderMetadata): ModelCapability[] | null {
        const allInfo = providerMetadata.data.allInfo;

        if (!allInfo?.pricing) return null; // Not OpenRouter

        const capabilityBuilder: ModelCapability[] = [];

        const inputModalities: string[] | undefined = allInfo?.architecture?.input_modalities;

        if (inputModalities) {
            if (inputModalities.includes('image')) {
                capabilityBuilder.push('vision');
            }
        }

        if (allInfo?.reasoning) {
            capabilityBuilder.push('reasoning');

            if (allInfo?.reasoning.mandatory) {
                capabilityBuilder.push('always-reasons');
            }
        }

        const supportedParameters: string[] | undefined = allInfo?.supported_parameters;
        if (supportedParameters) {
            if (supportedParameters.includes('tools')) {
                capabilityBuilder.push('tools');
            }
        }

        return capabilityBuilder;
    }
}

export class SubtitleParser {
    public static getSubtitleForModel(providerMetadata?: ProviderMetadata): string {
        if (!providerMetadata) return 'No info';

        if (isOpenAIMetadata(providerMetadata)) {
            // Try parse as OpenRouter
            const subtitleFromOpenRouter = SubtitleParser.attemptParseOpenRouter(providerMetadata);
            if (subtitleFromOpenRouter !== null) return subtitleFromOpenRouter;

            return `Owner: ${providerMetadata.data.ownedBy}`;
        } else if (isOllamaMetadata(providerMetadata)) {
            return [
                providerMetadata.data.context_length
                    ? `${numberToNumeral(providerMetadata.data.context_length, 0)} ctx`
                    : null,
                providerMetadata.data.parameterSize,
                providerMetadata.data.quantization]
                .filter(Boolean)
                .join(' ⸱ ');
        }

        return 'No info';
    }

    private static attemptParseOpenRouter(providerMetadata: OpenAIProviderMetadata): string | null {
        const allInfo = providerMetadata.data.allInfo;

        let subtitle = '';

        if (allInfo?.context_length) {
            subtitle += `${numberToNumeral(allInfo.context_length, 0)} ctx`;
        }

        if (allInfo?.pricing?.prompt && allInfo.pricing.completion) {
            const promptPrice = getPricingPerMillion(allInfo.pricing.prompt);
            const completionPrice = getPricingPerMillion(allInfo.pricing.completion);

            if (!promptPrice || !completionPrice) return 'Pricing unavailable';

            subtitle += ` | $${promptPrice}/M in - $${completionPrice}/M out`;
        }

        return subtitle.length > 0 ? subtitle : null;
    }
}

export class NameParser {
    public static getNameForModel(providerMetadata: ProviderMetadata | undefined, fallback: string): string {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return fallback;

        // Try parse as OpenRouter
        const nameFromOpenRouter = NameParser.attemptParseOpenRouter(providerMetadata);
        if (nameFromOpenRouter !== null) return nameFromOpenRouter;

        return fallback;
    }

    private static attemptParseOpenRouter(providerMetadata: OpenAIProviderMetadata): string | null {
        const allInfo = providerMetadata.data.allInfo;

        if (allInfo?.name) {
            const name: string = allInfo.name;
            if (name.split(': ').length > 1) {
                return name.split(': ')[1];
            } else {
                return name;
            }
        }

        return null;
    }
}

export class OpenRouterParser {
    public static getExternalLink(providerMetadata: ProviderMetadata | undefined): string | null {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return null;

        const huggingFaceId = providerMetadata.data.allInfo?.hugging_face_id;

        if (huggingFaceId) return `https://huggingface.co/${huggingFaceId}`;
        else return null;
    }

    public static getDescription(providerMetadata: ProviderMetadata | undefined): string | null {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return null;

        return providerMetadata.data.allInfo?.description ?? null;
    }

    public static getContextLength(providerMetadata: ProviderMetadata | undefined): number | null {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return null;

        return providerMetadata.data.allInfo?.context_length ?? null;
    }

    public static getReasoning(providerMetadata: ProviderMetadata | undefined): { reasoning: ModelReasoningOptions } | undefined {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return undefined;


        return { reasoning: providerMetadata.data.allInfo?.reasoning };
    }

    public static getKnowledgeCutoff(providerMetadata: ProviderMetadata | undefined): string | null {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return null;

        return providerMetadata.data.allInfo?.knowledge_cutoff;
    }

    public static getModerationStatus(providerMetadata: ProviderMetadata | undefined): boolean | null {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return null;

        return providerMetadata.data.allInfo?.top_provider.is_moderated;
    }

    public static getTopProviderMaxCompletionTokens(providerMetadata: ProviderMetadata | undefined): number | null {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return null;

        return providerMetadata.data.allInfo?.top_provider.max_completion_tokens;
    }

    public static getPromptPricing(providerMetadata: ProviderMetadata | undefined): number {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return -1;

        return providerMetadata.data.allInfo?.pricing.prompt;
    }

    public static getCompletionPricing(providerMetadata: ProviderMetadata | undefined): number {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return -1;

        return providerMetadata.data.allInfo?.pricing.completion;
    }

    public static getInputModalities(providerMetadata: ProviderMetadata | undefined): ModelInputModalities[] {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return ['unknown-modalities'];

        return providerMetadata.data.allInfo?.architecture.input_modalities;
    }

    public static getOutputModalities(providerMetadata: ProviderMetadata | undefined): ModelOutputModalities[] {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return ['unknown-modalities'];

        return providerMetadata.data.allInfo?.architecture.output_modalities;
    }

    public static getSupportedParameters(providerMetadata: ProviderMetadata | undefined): ModelParameters[] {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return [];

        return providerMetadata.data.allInfo?.supported_parameters;
    }

    public static getDefaultParameters(providerMetadata: ProviderMetadata | undefined): Partial<Record<ModelParameters, unknown | null>> {
        if (!providerMetadata || !isOpenAIMetadata(providerMetadata)) return {};

        return providerMetadata.data.allInfo?.default_parameters;
    }
}

function getPricingPerMillion(pricing: string): string | null {
    const parsed = Number(pricing);
    if (isNaN(parsed)) return null;

    return (parsed * 1_000_000).toFixed(2);
}