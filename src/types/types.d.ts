// https://github.com/ollama/ollama/blob/f9d2d8913554d78b1cae47c5eaa9cbbd0ea79273/docs/api.md#L502
type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

interface OllamaMessage {
    role: MessageRole;
    content: string;
    images?: string[];
}

type ChatOld = {
    id: string;
    label: string;
    messages: AppMessage[];
    created: number; // Date in ms
    lastMessage: number; // Date in ms
    pinned?: boolean;
}

interface AppMessage extends OllamaMessage {
    id: string;
}
