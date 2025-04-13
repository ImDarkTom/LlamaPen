interface Chat {
	id: number;
	title: string;
	createdAt: Date;
	lastestMessageDate?: Date;
	isGenerating?: boolean;
	pinned: 0 | 1;
}

type ChatMessage = BaseChatMessage;
// type ChatMessage = ModelChatMessage | UserChatMessage;

interface BaseChatMessage {
	id: number;
	chatId: number;
	content: string;
	created: Date;
	attachments?: Blob[];
	type: 'model' | 'user';
	model?: string;
	status?: 'waiting' | 'generating' | 'finished' | 'cancelled';
}

interface ModelChatMessage extends BaseChatMessage {
	type: 'model';
	model: string;
	status: 'waiting' | 'generating' | 'finished';
}

interface UserChatMessage extends BaseChatMessage {
	type: 'user';
}