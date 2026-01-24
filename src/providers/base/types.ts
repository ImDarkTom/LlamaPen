export type ChatIteratorChunk = {
	type: 'error',
	error: {
		type: string;
		message: string;
	};
} | {
	type: 'done',
	reason: 'completed' | 'cancelled' | 'error',
	stats?: ModelChatMessage['stats']
} | {
	type: 'message',
	data: {
		model: string;
		created_at: Date;
		message: Message;
		done: boolean;
		done_reason: string;
		total_duration?: number;
		load_duration?: number;
		prompt_eval_count?: number;
		prompt_eval_duration?: number;
		eval_count?: number;
		eval_duration?: number;
	};
};

type Message = {
    role: string;
    content: string;
    thinking?: string;
    images?: Uint8Array[] | string[];
    tool_calls?: ToolCall[];
    tool_name?: string;
}

interface ToolCall {
    function: {
        name: string;
        arguments: {
            [key: string]: any;
        };
    };
}

export type ChatOptions = {
	model: string;
	reasoningEnabled?: boolean;
}

export type ModelCapabilities = {
	supportsReasoning: boolean;
	supportsVision: boolean;
	supportsFunctionCalling: boolean;
}

// Shared app model
export type Model = {
	name: string; // Pretty name
	id: string; // Internal identifier
	capabilities: ModelCapabilities;
}