// https://github.com/ollama/ollama/blob/f9d2d8913554d78b1cae47c5eaa9cbbd0ea79273/docs/api.md#L502
export type OllamaMessageRole = 'system' | 'user' | 'assistant' | 'tool';

type OllamaToolCall = {
    function: {
        name: string;
        arguments: Record<string, string | number | boolean>,
    }
};

export type OllamaMessage = {
    role: OllamaMessageRole;
    content: string;
    thinking?: string; // Thinking models' thinking text.
    images?: string[];
    tool_calls?: OllamaToolCall[]; // List of tools the model wants to use
} | {
    role: 'tool';
    tool_name: string;
    content: string;
}