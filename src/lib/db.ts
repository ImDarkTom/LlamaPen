import Dexie, { type EntityTable } from 'dexie';

const db = new Dexie('LlamapenDB') as Dexie & {
	chats: EntityTable<Chat, 'id'>,
	messages: EntityTable<ChatMessage, 'id'>
	notes: EntityTable<Note, 'id'>
};

db.version(1).stores({
	chats: '++id,title,createdAt,lastestMessageDate,pinned',
	messages: '++id,chatId,created,[chatId+id]',
	notes: '++id,title,createdAt,lastEdited,pinned,content',
});

export default db;