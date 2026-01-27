import { Ollama, type ChatRequest } from "ollama";
import * as OllamaTypes from "ollama/browser";

import logger from "@/lib/logger";
import supabase from "@/lib/supabase";
import { useConfigStore } from "@/stores/config";
import { getSessionToken } from "@/stores/user";
import { tryCatch } from "@/utils/core/tryCatch";

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
        const { error } = await this.sendRequest('/api/v2/health');
                
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

    async generateTitle(messages: { role: string, content: string }[]): Promise<string> {
        const FALLBACK_TITLE = 'New Chat';

        const { data, error } = await this.sendRequest('/api/v2/generate-title', {
            body: JSON.stringify({ messages }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
                
        if (error) {
            logger.warn('LPCloudWrapper:generateTitle', 'Error generating chat title:', error);
            return FALLBACK_TITLE;
        }

        const title = await data.text()
        return title;
    }

    async streamedChat(request: ChatRequest, abortSignal?: AbortSignal) {
        const headers = new Headers();
        const token = await getSessionToken();
    
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        // If we give an abort controller, we need to create a new Ollama instance with a
        // fetch that uses that signal that way we can cancel the request if triggered.
        const ollamaInstance = new Ollama({
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

        return ollamaInstance.chat({ ...request, stream: true });
    }
}

export const lpCloudWrapper = new LPCloudWrapper();