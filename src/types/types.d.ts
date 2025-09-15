// https://github.com/ollama/ollama/blob/f9d2d8913554d78b1cae47c5eaa9cbbd0ea79273/docs/api.md#L502
type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

type OllamaToolCall = {
    function: {
        name: string;
        arguments: Record<string, string | number | boolean>,
    }
};

type OllamaMessage = {
    role: MessageRole;
    content: string;
    thinking?: string; // Thinking models' thinking text.
    images?: string[];
    tool_calls?: OllamaToolCall[]; // List of tools the model wants to use
} | {
    role: 'tool';
    tool_name: string;
    content: string;
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
