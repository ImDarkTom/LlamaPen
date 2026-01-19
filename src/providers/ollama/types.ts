export type OllamaChatRequest = {
    model: string; // The model name
    messages: OllamaMessage[]; // List of messages
    think?: boolean; // For thinking models only
    tools?: unknown[]; // TODO: add types for this / For tool call models only
    format?: unknown; // TODO: get from api
    stream?: boolean; // Stream or not
    keep_alive?: string; // How long to keep model loaded in memory, default '5m'.
    options?: {
        num_ctx?: number;
        repeat_last_n?: number;
        repeat_penalty?: number;
        temperature?: number;
        seed?: number;
        stop?: string;
        num_predict?: number;
        top_k?: number;
        top_p?: number;
        min_p?: number;
    };
}

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