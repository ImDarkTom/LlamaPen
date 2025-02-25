import { defineStore } from 'pinia';

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
		}
	}
});