import Dexie, { type EntityTable } from 'dexie';

const db = new Dexie('LlamapenDB') as Dexie & {
	chats: EntityTable<Chat, 'id'>,
	messages: EntityTable<ChatMessage, 'id'>,
	attachments: EntityTable<UserAttachment, 'id'>,
};

// 09-04-2025 - Initial Dexie DB.
db.version(1).stores({
	chats: '++id,title,createdAt,lastestMessageDate,pinned',
	messages: '++id,chatId,created,[chatId+id]',
	attachments: '++id,messageId,created'
});

// 29-10-2025 - Refactor waiting/generating state into in-memory record.
db.version(2).stores({
	chats: '++id,title,createdAt,lastestMessageDate,pinned',
	messages: '++id,chatId,created,[chatId+id]',
	attachments: '++id,messageId,created'
}).upgrade(async transaction => {
	await transaction.table('messages').toCollection().modify((message: ChatMessage) => {
		if (message.type === 'model') {
			if (['waiting', 'generating'].includes(message.status)) {
				message.status = 'inProgress';
			}
		}
	});
	
	return console.log('[DB] Upgraded to v2 schema.');
});

export default db;