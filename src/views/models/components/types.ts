import type { ShowResponse } from "ollama/browser";

export type ModelViewInfo =
 | { state: 'data'; model: ShowResponse; isLoaded: boolean }
 | { state: 'loading' }
 | { state: 'error'; message: string }
 | { state: 'unselected' };
