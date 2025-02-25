import { defineStore } from 'pinia';
import { useAllChatsStore } from '../stores/allChats';

interface ApiStatus {
	code: number; 
	message: string; 
	error?: string;
	errorMessage?: string;
}

export const useApiStore = defineStore('api', {
	state: () => ({
		baseUrl: localStorage.getItem('apiUrl') ?? 'http://localhost:11434',
		isConnected: false,
	}),

	getters: {
		connected: (state) => state.isConnected,
		getBaseUrl: (state) => state.baseUrl,
	},

	actions: {
		/**
		 * Sends a request to the base url to check if we can connect to it.
		 * @returns An API status check object.
		 */
		async getStatus(): Promise<ApiStatus> {
			const errorsMap: { [key: string]: string } = {
				'TypeError': 'Network error. Please check your connection & Ollama URL.',
			};

			try {
				const response = await fetch(this.getBaseUrl);
				const message = await response.text();

				return { code: response.status, message };
			} catch (e: unknown) {
				const err = e as Error;

				return {
					code: -1,
					message: '',
					error: err.message,
					errorMessage: errorsMap[err.name] || 'An unknown error occurred.',
				};
			}
		},

		/**
		 * Refreshes the value for `isConnected`. 
		 * @param statusCheck (Optional) Status check to use instead of sending a new request.
		 */
		async refreshConnectionCheck(statusCheck?: ApiStatus) {
			try {
				const status = statusCheck ?? await this.getStatus();
	
				if (status.code === 200) {
					this.isConnected = true;
				} else {
					this.isConnected = false;
				}
			} catch {
				this.isConnected = false;
			}
		},

		setBaseUrl(url: string) {
			this.baseUrl = url;
		},
	
		/**
		 * Gets model list from `/api/tags`.
		 * @returns A `ModelListResponse` promise or throws an error.
		 */
		getModels(): Promise<ModelListResponse> {
			return fetch(this.getBaseUrl + '/api/tags')
				.then(async response => {
					if (!response.ok) {
						throw new Error(`❌ [API Client] Non-ok response code getting model list: ${response.status} ${response.statusText}`);
					}
	
					return response.json();
				})
				.catch((e: unknown) => {
					throw new Error(`❌ [API Client] Error getting model list: ${(e as Error).message}`);
				});
		},

		async generateCompletion(requestBody: { prompt: string}): Promise<CompletionResponse> {
			const response = await fetch(this.baseUrl + '/api/generate', {
				method: 'POST',
				body: JSON.stringify({
					...requestBody,
					model: useAllChatsStore().selectedModel,
					stream: false,
				})
			});
			
			const json = await response.json();

			return json;
		},

		async *generateChatCompletion(messages: OllamaMessage[]) {
			const controller = new AbortController();
            const signal = controller.signal;

            const response = await fetch(this.baseUrl + '/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
					model: useAllChatsStore().selectedModel,
					messages: messages,
				}),
                signal: signal,
            });

            if (!response.body) {
                throw new Error(`No response body recieved from sendMessage request, response code: ${response.status}`);
            }

            const reader = response.body.getReader();
            const textDecoder = new TextDecoder();

            this.isGenerating = true;

            while (true) {
                const { done, value } = await reader.read();

                if (done || !this.isGenerating) {
                    controller.abort('Cancelled response.');

                    this.isGenerating = false; // Ensure false if we stop generating normally
                    this.saveToLocalStorage();
                    this.generateChatTitle(chatId);
                    break;
                }

                const chunkText = textDecoder.decode(value).trim().split('\n');

                for (const chunk of chunkText) {
                    try {
                        const chunkJson = JSON.parse(chunk);
                        const messageChunk = chunkJson.message.content;

                        this.modifyMessage(responseMessageId, messageChunk, 'append');
                    } catch (error: unknown) {
                        console.error('Error parsing response chunk', error);
                    }
                }
            }
		}
	}
});