import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import type OpenAI from 'openai';

import { chatHelper } from '../../src/providers/openai/chatHelper';
import type { ChatOptions } from '../../src/providers/base/types';

function fakeClient() {
    const calls: Record<string, unknown>[] = [];

    const client = {
        chat: {
            completions: {
                create: async (params: Record<string, unknown>) => {
                    calls.push(params);

                    return {
                        async *[Symbol.asyncIterator]() {
                            yield {
                                choices: [
                                    {
                                        delta: { content: 'hi', reasoning: 'because' },
                                        finish_reason: null,
                                    },
                                ],
                            };
                        },
                    };
                },
            },
        },
    } as unknown as OpenAI;

    return { client, calls };
}

async function run(options: ChatOptions) {
    const { client, calls } = fakeClient();
    const chunks = [];

    for await (const chunk of chatHelper([], new AbortController().signal, options, client)) {
        chunks.push(chunk);
    }

    return { body: calls[0], chunks };
}

describe('openai chatHelper', () => {
    beforeEach(() => {
        const app = createApp({});
        const pinia = createPinia();
        app.use(pinia);
        setActivePinia(pinia);
    });

    it('sends only the generation params it was given', async () => {
        const { body } = await run({ model: 'm', params: { temperature: 0.3, top_p: 0.8 } });

        expect(body).toMatchObject({ temperature: 0.3, top_p: 0.8 });
        expect(body).not.toHaveProperty('top_k');
    });

    it('omits reasoning entirely when the model does not support it', async () => {
        const { body } = await run({ model: 'm' });

        expect(body).not.toHaveProperty('reasoning');
    });

    // OpenRouter rejects effort and max_tokens together with a 400.
    it('never sends reasoning effort and max tokens together', async () => {
        const { body } = await run({
            model: 'm',
            reasoningEnabled: true,
            reasoningEffort: 'low',
            reasoningMaxTokens: 200,
        });

        expect(body.reasoning).toEqual({ enabled: true, max_tokens: 200 });
    });

    it('sends effort when no max tokens are set', async () => {
        const { body } = await run({ model: 'm', reasoningEnabled: true, reasoningEffort: 'low' });

        expect(body.reasoning).toEqual({ enabled: true, effort: 'low' });
    });

    it('surfaces streamed reasoning content', async () => {
        const { chunks } = await run({ model: 'm' });

        expect(chunks[0]).toMatchObject({ content: 'hi', thinking: 'because' });
    });
});
