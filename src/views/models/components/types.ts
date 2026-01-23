import type { ModelInfo } from "@/composables/useModelList";
import type { LLMProviderTypes } from "@/providers/base/ProviderInterface";

export type ModelViewInfo =
 | { state: 'data', model: ModelInfo, isLoaded: boolean, type: LLMProviderTypes }
 | { state: 'loading' }
 | { state: 'error', message: string }
 | { state: 'unselected' };
