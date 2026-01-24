import logger from "@/lib/logger";
import supabase from "@/lib/supabase";
import { useConfigStore } from "@/stores/config";
import { getSessionToken } from "@/stores/user";
import { tryCatch } from "@/utils/core/tryCatch";
import { Ollama, type ChatRequest } from "ollama";
import * as OllamaTypes from "ollama/browser";

namespace LPCloudTypes {
    export type ListResponse = { 
        models: (OllamaTypes.ModelResponse & {
            capabilities: ('completion' | 'tools' | 'thinking' | 'vision' | 'insert' | 'embedding' | 'search')[];
            llamapenMetadata: {
                creator: string;
                premium?: boolean;
                tags?: ('closedSource' | 'alwaysReasons')[];
            }
        })[];
    };
}

/**
 * Wrapper for LlamaPen Cloud interactions.
 */
class LPCloudWrapper {
    private async sendRequest(url: string, options?: RequestInit) {
        if (!supabase) {
            return tryCatch(fetch(useConfigStore().cloud.apiUrl + url, options));
        }
    
        if (!options) {
            options = {} as RequestInit;
        }
    
        const reqHeaders = options?.headers ? new Headers(options.headers) : new Headers();
    
        const token = await getSessionToken();
    
        if (token) {
            reqHeaders.set('Authorization', `Bearer ${token}`);
        }
    
        options.headers = reqHeaders;
        return tryCatch(fetch(useConfigStore().cloud.apiUrl + url, options));
    }

    async checkConnection() {
        const { error } = await this.sendRequest('/api/version');
                
        if (error) {
            logger.warn('LPCloudWrapper:checkConnection', 'Error sending version request:', error);
        }

        return error;
    }

    async list() {
        const { data, error } = await this.sendRequest('/api/tags');
                
        if (error) {
            logger.warn('LPCloudWrapper:list', 'Error getting model list:', error);
            return [];
        }

        const { data: parsed, error: parseError } = await tryCatch<LPCloudTypes.ListResponse>(await data.json());
        if (parseError) {
            logger.warn('LPCloudWrapper:list', 'Error parsing model list:', parseError);
            return [];
        }

        return parsed.models;
    }

    private async createOllamaInstance(abortSignal?: AbortSignal) {
        const headers = new Headers();
        const token = await getSessionToken();
    
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        // If we give an abort controller, we need to create a new Ollama instance with a
        // fetch that uses that signal that way we can cancel the request if triggered.
        return new Ollama({
            host: useConfigStore().cloud.apiUrl,
            fetch: (url, init) => {
                return fetch(url, {
                    ...init,
                    headers: {
                        ...init?.headers,
                        ...Object.fromEntries(headers),
                    },
                    signal: abortSignal,
                });
            }
        });
    }
    
    async chat(request: ChatRequest, abortSignal?: AbortSignal) {
        const ollamaInstance = await this.createOllamaInstance(abortSignal);
        return ollamaInstance.chat({ ...request, stream: false });
    }

    async streamedChat(request: ChatRequest, abortSignal?: AbortSignal) {
        const ollamaInstance = await this.createOllamaInstance(abortSignal);
        return ollamaInstance.chat({ ...request, stream: true });
    }
}

export const lpCloudWrapper = new LPCloudWrapper();