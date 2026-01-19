import type { ReadableOf } from "@/types/util";
import { Readable } from "readable-stream";
import { useModelList } from "@/composables/useModelList";
import { useConfigStore } from "@/stores/config";
import { authedFetch } from "@/utils/core/authedFetch";
import { tryCatch } from "@/utils/core/tryCatch";
import type { OllamaChatRequest } from "../types";
import { appToolsToOllama } from "../converters/appToolsToOllama";
import type { ChatIteratorChunk } from "@/providers/base/types";

/**
 * 
 * @param messages Ollama messages to use as context.
 * @param abortSignal Abort signal to cancel generation.
 * @param additionalOptions Client-side generation options
 * @returns Yields chunks normally. Throws if control flow error.
 */
async function* chatIterator(
    messages: OllamaMessage[],
    abortSignal: AbortSignal,
    additionalOptions?: {
        modelOverride?: string,
    }
): AsyncGenerator<ChatIteratorChunk, ChatIteratorChunk | undefined, unknown> {
    const { selectedModelCapabilities } = useModelList();
    const config = useConfigStore();

    const reqBody: OllamaChatRequest = {
        model: additionalOptions?.modelOverride ?? config.selectedModel,
        messages,
        think: config.chat.thinking.enabled,
        stream: true,
        options: config.chat.messageOptionsEnabled ? config.chat.messageOptions : undefined,
    };

    if (selectedModelCapabilities.value.includes('tools')) {
        reqBody.tools = appToolsToOllama();
    }

    const response = await authedFetch(config.requestUrl('/api/chat'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
        signal: abortSignal,
    });

    if (!response.body) {
        throw { type: 'error', error: { type: 'app:no-response-body', message: 'Error: No response body.' } };
    }

    if (!response.ok) {
        const { data, error: parseError } = await tryCatch<CustomErrorResponse>(await response.json());

        if (parseError || !data.error) {
            throw { type: 'error', error: { type: 'app:parse-fail', message: parseError?.message || `Failed to parse response error: ${parseError}` } };
        }

        if (response.status === 401 && data.error.type === 'auth:not-authed') {
            throw { type: 'error', error: { type: 'app:not-authed', message: 'You need to be signed in to send messages.' } };
        } else if (response.status === 404 && !config.cloud.enabled) {
            throw { type: 'error', error: { type: 'app:model-not-found', message: data.error as unknown as string } };
        }

        throw data;
    }

    const decoder = new TextDecoder();
    const reader = response.body.getReader();

    while (true) {
        if (abortSignal.aborted) {
            return { type: 'done', reason: 'cancelled' };
        }

        const { done, value } = await reader.read();
        if (done) {
            return { type: 'done', reason: 'completed' };
        }
        
        const chunkText = decoder.decode(value).trim().split('\n');
        
        for (const chunk of chunkText) {
            const { data, error } = await tryCatch<OllamaChatResponseChunk | CustomErrorResponse>(JSON.parse(chunk));

            if (error) {
                console.error('Error parsing message chunk', error);
                yield { type: 'error', error: { type: 'chunk-parse-error', message: 'Error parsing message chunk: ' + error.message } };
                continue;
            }

            if ('error' in data) {
                yield data;
                continue;
            }

            if (data.done) {
                // Process final chunk
                yield { type: 'message', data };

                yield { 
                    type: 'done', 
                    reason: 'completed', 
                    stats: {
                        evalCount: data.eval_count,
                        evalDuration: data.eval_duration,
                        loadDuration: data.load_duration,
                        promptEvalCount: data.prompt_eval_count,
                        promptEvalDuration: data.prompt_eval_duration,
                        totalDuration: data.total_duration
                    }
                };
                continue;
            }

            yield { type: 'message', data };
        }
    }
}

export function chat(messages: OllamaMessage[], abortSignal: AbortSignal, additionalOptions?: { modelOverride?: string }): ReadableOf<ChatIteratorChunk> {
    return Readable.from(chatIterator(messages, abortSignal, additionalOptions)) as ReadableOf<ChatIteratorChunk>;
}