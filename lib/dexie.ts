import Dexie, { type EntityTable } from 'dexie';

export interface Chat {
    id: number;
    title: string;
    createdAt: number;
    updatedAt: number;
    pinned: 0 | 1; // Dexie doesn't let us save booleans
}

export type ChatMessageRole = 'user' | 'assistant';

export interface ChatMessage {
    id: number;
    chatId: number;
    role: ChatMessageRole;
    thinking?: string; // The thought text
    content: string;
    createdAt: number;
    attachments?: number[]; // List of ids for the file attachments
}

export interface MessageAttachments {
    id: number;
    fileName: string;
    fileType: string; // Mime type
    blob: Blob;
    metadata?: unknown;
}

export const db = new Dexie('llamapenDatabase') as Dexie & {
    chats: EntityTable<Chat, 'id'>;
    chatMessages: EntityTable<ChatMessage, 'id'>;
    messageAttachments: EntityTable<MessageAttachments, 'id'>;
};

db.version(1).stores({
    chats: '++id, title, createdAt, updatedAt, pinned',
    chatMessages: '++id, chatId, role, content, createdAt, attachments',
    messageAttachments: '++id, fileName, fileType, blob',
});
