import type { ModelInfo } from "@/composables/useProviderManager";
import type { ShowResponse } from "ollama";

export type ModelViewInfo =
 | { state: 'data', model: ShowResponse, isLoaded: boolean, type: 'ollama' }
 | { state: 'data', model: ModelInfo, isLoaded: boolean, type: 'generic' }
 | { state: 'loading' }
 | { state: 'error', message: string }
 | { state: 'unselected' };
