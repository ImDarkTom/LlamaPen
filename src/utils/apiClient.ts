interface ApiStatus {
	code: number; 
	message: string; 
	error?: string;
	errorMessage?: string;
}

class ApiClient {
	private baseUrl: string = localStorage.getItem('apiUrl') ?? 'http://localhost:11434';
	private isConnected: boolean = false;

	constructor() {}

	get status(): Promise<ApiStatus> {
		const errorsMap: { [key: string]: string } = {
			'TypeError': 'Network error. Please check your connection & Ollama URL.'
		};

		return fetch(this.baseUrl)
			.then(async response => {
				const message = await response.text() || '';

				return { code: response.status, message: message };
			})
			.catch((e: Error) => {
				console.log(e.message, e.name, e.stack);

				return {
					code: -1,
					message: '',
					error: e.message,
					errorMessage: errorsMap[e.name] || 'An unexpected error occurred.'
				}
			});
	}

	get connected(): boolean {
		return this.isConnected;
	}
	
	get getBaseUrl() {
		return this.baseUrl;
	}

	/**
	 * Refreshes the `isConnected` value.
	 * @param statusCheck (Optional) If provided, doesnt sent a new request, and instead uses that as the API Status check.
	 */
	async refreshConnectionCheck(statusCheck?: ApiStatus) {
		try {
			const status = statusCheck ?? await this.status;

			if (status.code === 200) {
				this.isConnected = true;
			} else {
				this.isConnected = false;
			}
		} catch {
			this.isConnected = false;
		}
	}

	setBaseUrl(url: string) {
		if (url.endsWith('/')) {
			this.baseUrl = url.slice(0, -1);
		} else {
			this.baseUrl = url;
		}
	}

	get models(): Promise<{models: ModelList}> {
		return fetch(this.baseUrl + '/api/tags')
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

const apiClient = new ApiClient();

export default apiClient;