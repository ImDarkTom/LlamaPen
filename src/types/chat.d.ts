interface Chat {
	id: number;
	title: string;
	createdAt: Date;
	lastestMessageDate?: Date;
	isGenerating?: boolean;
	pinned: 0 | 1;
}

type UserAttachment = {
	id: number;
	messageId: number;
	created: Date;
	content: Blob;
}

type ChatMessage = ModelChatMessage | UserChatMessage;

type BaseChatMessage = {
	id: number;
	chatId: number;
	content: string;
	created: Date;
};

interface ModelChatMessage extends BaseChatMessage {
	type: 'model';
	model: string;
	thinking?: string;
	status: ModelMessageStatus;
	toolCalls?: {
		function: {
			name: string;
			arguments: Record<string, string | number | boolean>,
		}
	}[];
}

type ModelMessageStatus = 'waiting' | 'generating' | 'finished' | 'cancelled';

interface UserChatMessage extends BaseChatMessage {
	type: 'user';
}