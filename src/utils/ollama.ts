import { useConfigStore } from '@/stores/config';

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

class OllamaAPI {
	constructor() {}

	async generateChatTitle(messages: ChatMessage[]): Promise<string> {
		if (useConfigStore().developer.mockRequests) {
			return 'Mock Chat Title';
		}

		const messagesFormatted = messages.map((message) => {
			return `${message.type === 'user' ? 'User' : 'Assistant'}: ${message.content}`;
		}).join('\n');

		const generationPrompt = DEFAULT_TITLE_GENERATION_PROMPT(messagesFormatted);

		const response = await fetch(useConfigStore().apiUrl('/api/generate'), {
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

	async sendMessageRequest(messages: {role: string, content: string}[]): Promise<Response> {
		if (useConfigStore().developer.mockRequests) {
			// Simulated chunks
			const chunks = [
				{ model: "mockmodel1", message: { role: "assistant", content: "Hello" }, done: false },
				{ role: "mockmodel1", message: { role: "assistant", content: " there,", done: false } },
				{ role: "mockmodel1", message: { role: "assistant", content: " how can I help?", done: false } },
			];

			const encoder = new TextEncoder();
			let i = 0;

			const stream = new ReadableStream({
				start(controller) {
					function pushChunk() {
						if (i < chunks.length) {
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

		return fetch(useConfigStore().apiUrl('/api/chat'), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: useConfigStore().selectedModel,
				messages,
			})
		});
	}
}

const ollamaApi = new OllamaAPI();

export default ollamaApi;