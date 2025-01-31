// https://github.com/ollama/ollama/blob/main/docs/api.md?plain=1#L502
type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

interface OllamaMessage {
    role: MessageRole;
    content: string;
}

type Chat = {
    id: string;
    label: string;
    messages: AppMessage[];
}

interface AppMessage extends OllamaMessage {
    id: string;
}