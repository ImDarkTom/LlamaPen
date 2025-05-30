import { useConfigStore } from '@/stores/config';
import { authedFetch } from './auth';
import { tryCatch } from './tryCatch';
import { Readable } from 'readable-stream';
import type { ReadableOf } from '@/types/util';

const DEFAULT_TITLE_GENERATION_PROMPT = (historyText: string) => `Create a concise, 3-5 word title as a title for the chat history, in the given language. RESPOND ONLY WITH THE TITLE TEXT.

Examples of titles:
📉 Stock Market Trends
🍪 Perfect Chocolate Chip Recipe
Evolution of Music Streaming
Remote Work Productivity Tips
Artificial Intelligence in Healthcare
🎮 Video Game Development Insights

<chat_history>
${historyText}
</chat_history>`;

export type ChatIteratorError = {
	error: {
		type: '401-parse-fail' | 'no-response-body' | 'user-not-premium' | 'user-not-authed' | 'unknown-401'
		message?: string;
	};
}

export type ChatIteratorDone = {
	stream_done: boolean;
	reason?: 'stream-done' | 'user-aborted';
}

class OllamaAPI {
	private modelList: ModelList = [];

	constructor() {}

	async generateChatTitle(messages: ChatMessage[]): Promise<string> {
		if (useConfigStore().developer.mockRequests) {
			return 'Mock Chat Title';
		}

		const messagesFormatted = messages.map((message) => {
			const hasAttachments = message.attachments && message.attachments.length > 0;
			return `${message.type === 'user' ? 'User' : 'Assistant'}: ${hasAttachments ? `<${message.attachments?.length} Attachments>` : ''} ${message.content}`;
		}).join('\n');

		const generationPrompt = DEFAULT_TITLE_GENERATION_PROMPT(messagesFormatted);

		const response = await authedFetch(useConfigStore().apiUrl('/api/generate'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: useConfigStore().selectedModel,
				prompt: generationPrompt,
				stream: false,
			})
		});

		const data = await response.json();

		const generatedTitle = data.response;
		
		return generatedTitle;
	}

	async sendMessageRequest(messages: {role: string, content: string}[], abortSignal: AbortSignal): Promise<Response> {
		if (useConfigStore().developer.mockRequests) {
			// Simulated chunks
			const chunks = [
				{ model: "mockmodel1", message: { role: "assistant", content: "Hello" }, done: false },
				{ model: "mockmodel1", message: { role: "assistant", content: " there,", done: false } },
				{ model: "mockmodel1", message: { role: "assistant", content: " how can I help?", done: false } },
			];

			const encoder = new TextEncoder();
			let i = 0;

			const stream = new ReadableStream({
				start(controller) {
					function pushChunk() {
						if (i < chunks.length) {
							if (abortSignal.aborted) {
								controller.close();
								return;
							}

							const jsonChunk = JSON.stringify(chunks[i]) + '\n';
							controller.enqueue(encoder.encode(jsonChunk));
							i++;
							setTimeout(pushChunk, 1000); // simulate delay between chunks
						} else {
							controller.close();
						}
					}

					pushChunk();
				}
			});

			return new Response(stream, {
				headers: {
					'Content-Type': 'text/event-stream'
				}
			});
		}

		return authedFetch(useConfigStore().apiUrl('/api/chat'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: useConfigStore().selectedModel,
				messages,
			}),
			signal: abortSignal,
		});
	}

	async* chatIterator(messages: OllamaMessage[], abortSignal: AbortSignal, modelOverride?: string): AsyncGenerator<OllamaChatResponseChunk, ChatIteratorError | ChatIteratorDone | undefined, unknown> {
		const response = await authedFetch(useConfigStore().apiUrl('/api/chat'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: modelOverride ?? useConfigStore().selectedModel,
				messages,
			}),
			signal: abortSignal,
		});

		if (!response.body) {
			return { error: { type: 'no-response-body' } };
		}
		
		if (response.status === 401) {
			const { data, error } = await tryCatch<{ error: { text: string, type: string } }>(await response.json());

			if (error || !data.error) {
				return { error: { type: '401-parse-fail' } };
			}

			if (data.error.type === 'premium') {
				return { error: { type: 'user-not-premium' } };
			} else if (data.error.type === 'auth') {
				return { error: { type: 'user-not-authed' } }
			} else {
				return { error: { type: 'unknown-401' } }
			}
		}


		const decoder = new TextDecoder();
		const reader = response.body.getReader();
		
		while (true) {
			if (abortSignal.aborted) return { stream_done: true, reason: 'user-aborted' };

			const { done, value } = await reader.read();
			if (done) return { stream_done: true, reason: 'stream-done' };

			const chunkText = decoder.decode(value).trim().split('\n');

			for (const chunk of chunkText) {
				console.log(chunk);
				const { data, error } = await tryCatch<OllamaChatResponseChunk>(JSON.parse(chunk));

				if (error) {
					console.error('Error parsing message chunk', error);
					continue;
				}

				yield data;
			}
		}
	}

	chat(messages: OllamaMessage[], abortSignal: AbortSignal, modelOverride?: string): ReadableOf<OllamaChatResponseChunk | ChatIteratorError | ChatIteratorDone> {
		return Readable.from(this.chatIterator(messages, abortSignal, modelOverride)) as ReadableOf<OllamaChatResponseChunk | ChatIteratorError | ChatIteratorDone>;
	}

	async getModels() {
		if (this.modelList.length !== 0) return this.modelList;

		const response = await fetch(useConfigStore().apiUrl('/api/tags'));
		const responseJson: { models: ModelList } = await response.json();

		this.modelList = responseJson.models;

		return this.modelList;
	}
}

const ollamaApi = new OllamaAPI();

export default ollamaApi;