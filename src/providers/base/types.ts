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
	data: OllamaChatResponseChunk;
};