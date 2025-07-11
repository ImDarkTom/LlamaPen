interface Chat {
	id: number;
	title: string;
	createdAt: Date;
	lastestMessageDate?: Date;
	isGenerating?: boolean;
	isGeneratingTitle?: boolean;
	pinned: 0 | 1;
}


type ChatMessage = ModelChatMessage | UserChatMessage;

type BaseChatMessage = {
	id: number;
	chatId: number;
	content: string;
	created: Date;
	attachments?: Blob[];
};

interface ModelChatMessage extends BaseChatMessage {
	type: 'model';
	model: string;
	thinking?: string;
	status: ModelMessageStatus;
}

type ModelMessageStatus = 'waiting' | 'generating' | 'finished' | 'cancelled';

interface UserChatMessage extends BaseChatMessage {
	type: 'user';
}