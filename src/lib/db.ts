import Dexie, { type EntityTable } from 'dexie';

const db = new Dexie('LlamapenDB') as Dexie & {
	chats: EntityTable<Chat, 'id'>,
	messages: EntityTable<ChatMessage, 'id'>
};

db.version(1).stores({
	chats: '++id,title,createdAt,lastestMessageDate,pinned',
	messages: '++id,chatId,created,[chatId+id]',
});

export default db;