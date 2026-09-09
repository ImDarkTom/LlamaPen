import type { ChatIteratorChunk, ChatOptions, ToolCall } from "@/providers/base/types";
import useToolsStore from "@/stores/useToolsStore";
import type OpenAI from "openai";
import { convertMessagesToOpenAI, convertToolsToOpenAI } from "./openAIConverters";

type OpenAIToolCall = OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall;
type OpenAIToolCallDelta = OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall;

class ToolCallProcessor {
    private toolCalls = new Map<number, OpenAIToolCall>();

    public processToolCallDelta(delta: OpenAIToolCallDelta) {
        const index = delta.index;
        const existingToolCall = this.toolCalls.get(index);

        if (delta.id) {
            if (!delta.function?.name) throw Error('No tool name provided during call.');

            this.toolCalls.set(index, {
                type: 'function',
                id: delta.id,
                function: {
                    name: delta.function.name,
                    arguments: delta.function.arguments ?? "",
                }
            });

            return;
        }

        if (!existingToolCall) {
            throw Error(`No active tool call at index ${index}.`);
        }

        if (delta.function?.arguments) {
            existingToolCall.function.arguments += delta.function.arguments;
        }

        if (delta.function?.name) {
            existingToolCall.function.name = delta.function.name;
        }
    }

    public closeAndReturnToolCalls(): ToolCall[] {
        if (this.toolCalls.size === 0) throw new Error('No tool calls to return.');

        const toolCalls = [...this.toolCalls.entries()]
            .sort(([a], [b]) => a - b)
            .map(([_index, toolCall]) => this.convertToolCall(toolCall));

        this.toolCalls.clear();

        return toolCalls;
    }

    private convertToolCall(toolCall: OpenAIToolCall): ToolCall {
        return {
            id: toolCall.id,
            function: {
                name: toolCall.function.name,
                arguments: JSON.parse(toolCall.function.arguments || '{}'),
            }
        }
    }
}

/** Reasoning deltas are non-standard: OpenRouter sends `reasoning`, DeepSeek-style servers `reasoning_content`. */
function reasoningFromDelta(delta: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta): string {
    const { reasoning, reasoning_content } = delta as { reasoning?: string; reasoning_content?: string; };

    return reasoning ?? reasoning_content ?? '';
}

/**
 * 
 * @param messages Messages to use as context.
 * @param abortSignal Abort signal to cancel generation.
 * @param additionalOptions Client-side generation options
 * @returns Yields chunks normally. Throws if control flow error.
 */
export async function* chatHelper(
    messages: ChatMessage[],
    abortSignal: AbortSignal,
    options: ChatOptions,
    instance: OpenAI,
): AsyncGenerator<ChatIteratorChunk, ChatIteratorChunk | undefined, unknown> {
    const toolsStore = useToolsStore();
    const toolCallProcessor = new ToolCallProcessor();

    const response = await instance.chat.completions.create({
        model: options.model,
        messages: convertMessagesToOpenAI(messages),
        stream: true,
        ...options.params,
        // OpenRouter's shape, the only source the app gets reasoning info from.
        // It rejects effort and max_tokens together, and the UI offers max tokens as the override.
        ...(options.reasoningEnabled !== undefined && {
            reasoning: {
                enabled: options.reasoningEnabled,
                ...(options.reasoningMaxTokens
                    ? { max_tokens: options.reasoningMaxTokens }
                    : options.reasoningEffort && { effort: options.reasoningEffort }),
            },
        }),
        ...(toolsStore.toggled.length > 0 &&
            { tools: convertToolsToOpenAI(toolsStore.tools, toolsStore.toggled) }
        ),
    } as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming, {
        signal: abortSignal,
    });

    for await (const chunk of response) {
        if (abortSignal.aborted) {
            return { type: 'done', reason: 'cancelled' };
        }

        if (!chunk.choices.length) continue;

        if (chunk.choices[0].finish_reason) {
            if (chunk.choices[0].finish_reason === 'tool_calls') {
                const toolCalls = toolCallProcessor.closeAndReturnToolCalls();

                yield {
                    type: 'message',
                    content: '',
                    tool_calls: toolCalls,
                }

                yield {
                    type: 'done',
                    reason: 'completed',
                };

                continue;
            }

            yield {
                type: 'message',
                content: chunk.choices[0].delta.content || '',
                thinking: reasoningFromDelta(chunk.choices[0].delta),
            };

            yield {
                type: 'done',
                reason: chunk.choices[0].finish_reason === 'stop' ? 'completed' : 'error',
            };

            continue;
        }

        if (chunk.choices[0].delta.tool_calls) {
            for (const toolCall of chunk.choices[0].delta.tool_calls) {
                toolCallProcessor.processToolCallDelta(toolCall);
            }
        }

        yield {
            type: 'message',
            content: chunk.choices[0].delta.content || '',
            thinking: reasoningFromDelta(chunk.choices[0].delta),
        };
    }
}
