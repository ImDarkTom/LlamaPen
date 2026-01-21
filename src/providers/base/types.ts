import type { ChatResponse } from "ollama";

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
	data: ChatResponse;
};

export type ChatOptions = {
	model: string;
	reasoningEnabled?: boolean;
}

// previously was: 'completion' | 'tools' | 'thinking' | 'vision' | 'insert' | 'embedding' | 'search'
export type ModelCapabilities = {
	supportsReasoning: boolean;
	supportsVision: boolean;
	supportsFunctionCalling: boolean;
}

// Shared app model
export type Model = {
	name: string; // Pretty name
	id: string; // Internal identifier
	capabilities: ModelCapabilities
}