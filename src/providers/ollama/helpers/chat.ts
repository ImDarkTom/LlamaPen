import type { ReadableOf } from "@/types/util";
import { Readable } from "readable-stream";
import { useModelList } from "@/composables/useModelList";
import { useConfigStore } from "@/stores/config";
import { appToolsToOllama } from "../converters/appToolsToOllama";
import type { ChatIteratorChunk, ChatOptions } from "@/providers/base/types";
import { ollamaWrapper } from "../OllamaWrapper";
import type { ChatRequest } from "ollama";
import * as Ollama from 'ollama/browser';

/**
 * 
 * @param messages Ollama messages to use as context.
 * @param abortSignal Abort signal to cancel generation.
 * @param additionalOptions Client-side generation options
 * @returns Yields chunks normally. Throws if control flow error.
 */
async function* chatIterator(
    messages: Ollama.Message[],
    abortSignal: AbortSignal,
    options: ChatOptions
): AsyncGenerator<ChatIteratorChunk, ChatIteratorChunk | undefined, unknown> {
    const { selectedModelCapabilities } = useModelList();
    const config = useConfigStore();

    const chatOptions: ChatRequest = {
        model: options.model,
        messages,
        think: options.reasoningEnabled || false,
        stream: true,
        options: config.chat.messageOptionsEnabled ? config.chat.messageOptions : undefined,
    };

    if (selectedModelCapabilities.value.supportsFunctionCalling) {
        chatOptions['tools'] = appToolsToOllama();
    }

    const response = await ollamaWrapper.streamedChat(chatOptions, abortSignal);

    // TODO: handle these before starting streaming (or maybe higher up in call stack?)
    // if (!response.ok) {
    //     const { data, error: parseError } = await tryCatch<CustomErrorResponse>(await response.json());

    //     if (parseError || !data.error) {
    //         throw { type: 'error', error: { type: 'app:parse-fail', message: parseError?.message || `Failed to parse response error: ${parseError}` } };
    //     }

    //     if (response.status === 401 && data.error.type === 'auth:not-authed') {
    //         throw { type: 'error', error: { type: 'app:not-authed', message: 'You need to be signed in to send messages.' } };
    //     } else if (response.status === 404 && !config.cloud.enabled) {
    //         throw { type: 'error', error: { type: 'app:model-not-found', message: data.error as unknown as string } };
    //     }

    //     throw data;
    // }

    try {
        for await (const chunk of response) {
            if (abortSignal.aborted) {
                return { type: 'done', reason: 'cancelled' };
            }

            // // From llamapen cloud
            // if ('error' in data) {
            //     yield data;
            //     continue;
            // }

            if (chunk.done) {
                // Process final chunk
                yield { type: 'message', data: chunk };

                yield { 
                    type: 'done', 
                    reason: 'completed', 
                    stats: {
                        evalCount: chunk.eval_count,
                        evalDuration: chunk.eval_duration,
                        loadDuration: chunk.load_duration,
                        promptEvalCount: chunk.prompt_eval_count,
                        promptEvalDuration: chunk.prompt_eval_duration,
                        totalDuration: chunk.total_duration
                    }
                };
                continue;
            }

            yield { type: 'message', data: chunk };
        }
    } catch (e) {
        throw e;
    }
}

export function chat(messages: Ollama.Message[], abortSignal: AbortSignal, options: ChatOptions): ReadableOf<ChatIteratorChunk> {
    return Readable.from(chatIterator(messages, abortSignal, options)) as ReadableOf<ChatIteratorChunk>;
}