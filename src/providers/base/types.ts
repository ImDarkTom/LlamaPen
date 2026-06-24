import type { LpCloudPricing } from "../lpcloud/types";

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
	content: string;
	thinking?: string;
	tool_calls?: ToolCall[];
};

export interface ToolCall {
	id?: string;
    function: {
        name: string;
        arguments: Record<string, string | number | boolean>;
    };
}

export type ProviderMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type ProviderMessage = {
	role: ProviderMessageRole;
	content: string;
	thinking?: string;
	images?: string[]; // base64-encoded images
	tool_calls?: ToolCall[];
} | {
	role: 'tool';
	tool_name: string;
	content: string;
};

export type ChatOptions = {
	model: string;
	reasoningEnabled?: boolean;
}

export type ProviderMetadata = 
	| { provider: 'ollama', data: OllamaMetadata }
	| { provider: 'lpcloud', data: LPCloudMetadata }
	| { provider: 'openai', data: OpenAIMetadata }

export type OllamaMetadata = {
	size: number;
	parameterSize: string;
	quantization?: string;
	family?: string;
	modifiedAt?: Date;
}

export type LPCloudMetadata = {
	providerName: string;
	priceTier: LpCloudPricing;
	premium: boolean;
	tags?: string[]
}

export type OpenAIMetadata = {
	created: Date;
	ownedBy: string;
	allInfo?: Record<any, any>;
}