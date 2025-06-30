import type { ChatMessageRole } from '~/lib/dexie';
import { streamer } from '~/util/streamer';

export type APIConnectionStatus = 'waiting' | 'connected' | 'failed' | 'uninitialized';

export type ChatStreamChunk = {
    type: 'data';
    value: {
        model: string;
        created_at: string;
        message: {
            role: ChatMessageRole;
            content: string;
            images?: unknown;
        };
        done: false;
    } | {
        done: true;
        model: string;
        created_at: string;
        message: {
            role: ChatMessageRole;
            content: '';
        };
        total_duration: number;
        load_duration: number;
        prompt_eval_count: number;
        prompt_eval_duration: number;
        eval_count: number;
        eval_duration: number;
    };
} | {
    type: 'error';
    error: Error;
};

class ChatAPI {
    private connectionStatus: APIConnectionStatus = 'uninitialized';

    public async* chat(): AsyncGenerator<ChatStreamChunk> {
        const messages = useChatsStore().openedChatMessages;

        const formattedMessages = messages.map((message) => {
            return {
                role: message.role,
                content: message.content,
            };
        });

        const controller = new AbortController();

        const response = await fetch(`${useConfigStore().api.url}/api/chat`, {
            body: JSON.stringify({
                model: 'llama3.2:1b',
                messages: formattedMessages,
            }),
            signal: controller.signal,
        });

        if (!response.ok || !response.body) {
            yield { type: 'error', error: new Error(`HTPP Error: ${response.status}`) };
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;
        }

        yield 'test';
    }

    public getConnectionStatus() {
        if (this.connectionStatus !== 'uninitialized') return this.connectionStatus;

        this.connectionStatus = 'waiting';

        const url = useConfigStore().api.url;
        fetch(url)
            .then(async (response) => {
                const text = await response.text();
                if (text === 'Ollama is running') {
                    this.connectionStatus = 'connected';
                }
                else {
                    this.connectionStatus = 'failed';
                }
                return this.connectionStatus;
            })
            .catch(() => {
                this.connectionStatus = 'failed';
                return this.connectionStatus;
            });
    }
}

const chatAPI = new ChatAPI();

export default chatAPI;
