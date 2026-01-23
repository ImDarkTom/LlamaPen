// src/types/ollama.d.ts
import 'ollama/browser';

declare module 'ollama/browser' {
    interface ShowResponse {
        // This merges with the existing interface, overriding just this property
        model_info: Record<string, any>;
    }
}