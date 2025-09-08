import { useConfigStore } from '@/stores/config';
import { authedFetch } from './core/authedFetch';
import { tryCatch } from './core/tryCatch';
import { Readable } from 'readable-stream';
import type { ReadableOf } from '@/types/util';
import logger from '../lib/logger';
import ollamaRequest from './ollamaRequest';
import db from '@/lib/db';
import useToolsStore from '@/stores/toolsStore';

const chatTitleExamples = `\nExamples of titles:\n📉 Stock Market Trends\n🍪 Perfect Chocolate Chip Recipe\nEvolution of Music Streaming\nRemote Work Productivity Tips\nArtificial Intelligence in Healthcare\n🎮 Video Game Development Insights`;

export type ChatIteratorChunk = {
	type: 'error',
	error: {
		type: '401-parse-fail' | 'no-response-body' | 'user-not-premium' | 'user-not-authed' | 'rate-limit' | 'unknown-401' | 'parse-fail' | 'custom-error';
		message?: string;
	};
} | {
	type: 'done',
	reason: 'completed' | 'cancelled' | 'error',
} | {
	type: 'message',
	data: OllamaChatResponseChunk;
};

export type ChatIteratorError = Extract<ChatIteratorChunk, { type: 'error' }>;

class OllamaAPI {
	private modelList: ModelList = [];

	async generateChatTitle(messages: ChatMessage[]): Promise<string> {
		if (useConfigStore().developer.mockRequests) {
			return 'Mock Chat Title';
		}

		const messagesFormatted = await Promise.all(
			messages.map(async (message) => {
				const hasAttachments = (await db.attachments
					.where('messageId')
					.equals(message.id)
					.count()) > 0;

				const content = hasAttachments ? `${message.content}\n<Attachment(s)>` : message.content;

				return {
					role: message.type === 'user' ? 'user' : 'assistant',
					content,
				};
			})
		);

		messagesFormatted.unshift({
			role: 'system',
			content: 'You are a helpful assistant that generates concise titles for chat histories. Use the following chat to generate a title based on the chat history in the chat\'s language.' + chatTitleExamples,
		})

		const response = await authedFetch(useConfigStore().apiUrl('/api/chat'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: useConfigStore().selectedModel,
				messages: messagesFormatted,
				stream: false,
				format: {
					type: 'object',
					properties: {
						title: {
							type: 'string'
						}
					},
					required: ['title']
				},
				llamapen: {
					intent: 'chat-title-generation'
				}
			})
		});

		const data = await response.json();

		const { data: generatedTitle, error } = await tryCatch<string>(JSON.parse(data.message.content).title);
		if (error) {
			logger.warn('OllamaAPI', 'Error generating chat title:', error);
			return 'New Chat';
		}

		logger.info('OllamaAPI', 'Generated chat title:', generatedTitle);
		return generatedTitle;
	}

	async sendMessageRequest(messages: { role: string, content: string }[], abortSignal: AbortSignal): Promise<Response> {
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

	appToolsToOllama(): unknown[] {
		const toggledToolsNames = useToolsStore().toggled;
		const toggledTools = Object.entries(useToolsStore().tools).filter(data => toggledToolsNames.includes(data[0]));

		const toolsList: unknown[] = [];

		for (const tool of toggledTools) {
			const toolInList = {
				type: 'function',
				function: {
					name: tool[0],
					description: tool[1].description,
					parameters: {
						type: 'object',
						properties: {} as Record<string, ToolSchemas>,
						required: tool[1].required,
					}
				}
			};
			

			for (const item of Object.entries(tool[1].params)) {
				toolInList.function.parameters.properties[item[0]] = item[1];
			}

			toolsList.push(toolInList);
		}

		return toolsList;
	}

	async* chatIterator(
		messages: OllamaMessage[], 
		abortSignal: AbortSignal, 
		additionalOptions?: {
			modelOverride?: string,
			disableTools?: boolean,
		}
	): AsyncGenerator<ChatIteratorChunk, ChatIteratorChunk | undefined, unknown> {
		const response = await authedFetch(useConfigStore().apiUrl('/api/chat'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: additionalOptions?.modelOverride ?? useConfigStore().selectedModel,
				think: useConfigStore().chat.thinking.enabled,
				stream: true,
				tools: this.appToolsToOllama(),
				options: useConfigStore().chat.messageOptionsEnabled ? useConfigStore().chat.messageOptions : undefined,
				messages,
			}),
			signal: abortSignal,
		});

		if (!response.body) {
			return { type: 'error', error: { type: 'no-response-body' } };
		}

		if (response.status === 401) {
			const { data, error } = await tryCatch<{ error: { text: string, type: string } }>(await response.json());

			if (error || !data.error) {
				return { type: 'error', error: { type: '401-parse-fail', message: error?.message || 'Failed to parse 401 response' } };
			}

			if (data.error.type === 'premium') {
				return { type: 'error', error: { type: 'user-not-premium' } };
			} else if (data.error.type === 'auth') {
				return { type: 'error', error: { type: 'user-not-authed' } };
			} else {
				return { type: 'error', error: { type: 'unknown-401', message: data.error.text } };
			}
		}

		if (response.status === 429) {
			return { type: 'error', error: { type: 'rate-limit' } };
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
					yield { type: 'error', error: { type: 'parse-fail' } };
					continue;
				}

				if ('error' in data) {
					yield { type: 'error', error: { type: 'custom-error', message: data.error }};
					continue;
				}

				if (data.done) {
					yield { type: 'done', reason: 'completed' };
					continue;
				}

				yield { type: 'message', data };
			}
		}
	}

	chat(messages: OllamaMessage[], abortSignal: AbortSignal, additionalOptions?: { modelOverride?: string, disableTools?: boolean }): ReadableOf<ChatIteratorChunk> {
		return Readable.from(this.chatIterator(messages, abortSignal, additionalOptions)) as ReadableOf<ChatIteratorChunk>;
	}

	async getModels(force?: boolean) {
		if (this.modelList.length !== 0 && !force) return this.modelList;

		const response = await fetch(useConfigStore().apiUrl('/api/tags'));
		const responseJson: { models: ModelList } = await response.json();

		this.modelList = responseJson.models;

		return this.modelList;
	}

	/**
	 * Loads a model into memory.
	 * @param modelName The name of the model to load into memory.
	 * @returns If the model was successfully loaded into memory.
	 */
	async loadModelIntoMemory(modelName: string): Promise<boolean> {
		const { data: response, error } = await ollamaRequest('/api/generate', 'POST', {
			model: modelName,
		});

		if (error) {
			logger.warn('OllamaAPI', 'Error loading model into memory:', error);
			return false;
		}

		if (response.status !== 200) {
			return false;
		}

		return true;
	}

	async getLoadedModels() {
		const { data: response, error } = await ollamaRequest('/api/ps', 'GET');

		if (error) {
			logger.warn('OllamaAPI', 'Error getting loaded models:', error);
			return null;
		}

		if (response.status !== 200) {
			return null;
		}

		const responseJson = await response.json() as OllamaProcessesResponse;
		return responseJson.models;
	}

	async getLoadedModelIds() {
		const loadedModels = await this.getLoadedModels();
		if (!loadedModels) return [];

		return loadedModels.map(model => model.model);
	}

	async unloadModel(modelName: string): Promise<boolean> {
		const { data: response, error } = await ollamaRequest('/api/generate', 'POST', {
			model: modelName,
			keep_alive: 0
		});

		if (error) {
			logger.warn('OllamaAPI', 'Error unloading model:', error);
			return false;
		}

		if (response.status !== 200) {
			return false;
		}

		return true;
	}

	async getModelCapabilities(model: string): Promise<OllamaCapability[]> {
		const { data: response, error } = await ollamaRequest('/api/show', 'POST', {
			model,
		});

		if (error) {
			logger.warn('OllamaAPI', `Error getting model capabilities for ${model}: ${error}`);
			return [];
		}

		if (response.status !== 200) {
			return [];
		}

		const responseJson = await response.json() as OllamaModelInfoResponse;

		return responseJson.capabilities as OllamaCapability[];
	}
}

const ollamaApi = new OllamaAPI();

export default ollamaApi;