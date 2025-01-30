// https://github.com/ollama/ollama/blob/main/docs/api.md?plain=1#L502
type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

interface OllamaMessage {
    role: MessageRole;
    content: string;
}