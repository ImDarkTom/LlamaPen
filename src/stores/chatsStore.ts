import db from '@/utils/db';
import { liveQuery } from 'dexie';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import useMessagesStore from './messagesStore';
import logger from '@/utils/logger';
import router from '@/router';

// Init
let liveSyncInitialised = false;

type RefReturn<T> = ReturnType<typeof ref<T>>;

function initLiveSync(
	chats: RefReturn<Chat[]>,
	pinnedChats: RefReturn<Chat[]>,
	unpinnedChats: RefReturn<Chat[]>
) {
	if (liveSyncInitialised) return;

	liveSyncInitialised = true;

	// Chats
	liveQuery(() => db.chats.toArray()).subscribe({
		next: data => {
			chats.value = data;
		},
		error: (e) => {
			console.error('Error during liveQuery for chats', e)
		}
	});

	// Pinned Chats
	liveQuery(() => db.chats.where('pinned').equals(1).toArray()).subscribe({
		next: data => {
			pinnedChats.value = data;
		},
		error: (e) => {
			console.error('Error during liveQuery for pinned chats', e)
		}
	});

	// Non-Pinned Chats
	liveQuery(() => db.chats.where('pinned').equals(0).toArray()).subscribe({
		next: data => {
			unpinnedChats.value = data;
		},
		error: (e) => {
			console.error('Error during liveQuery for non-pinned chats', e)
		}
	});

	logger.info('Chats Store', 'Initialized live sync for chats store.');
}

/**
 * Handles chats, but not messages, that is handled in messagesStore.
 */
const useChatsStore = defineStore('chats', () => {
	const chats = ref<Chat[]>([]);

	const pinnedChats = ref<Chat[]>([]);
	const hasPinnedChats = computed<boolean>(() => pinnedChats.value.length !== 0);
	const unpinnedChats = ref<Chat[]>([]);

	initLiveSync(chats, pinnedChats, unpinnedChats);

	async function createNewChat(): Promise<number> {
		const newChatId = await db.chats.add({
			title: 'New Chat',
			createdAt: new Date(),
			pinned: 0,
		});

		router.push(`/chat/${newChatId}`);

		return newChatId;
	}

	async function deleteChat(id: number) {
		await db.chats.delete(id);
	}

	async function renameChat(id: number, newTitle: string) {
		await db.chats.update(id, { title: newTitle });
	}

	async function setPinned(id: number, pinned: boolean) {
		await db.chats.update(id, { pinned: pinned ? 1 : 0 });
	}

	function isOpened(id: number) {
		return useMessagesStore().openedChatId === id;
	}

	async function clearChats() {
		db.chats.clear();
	}

	async function getChatTitle(id: number) {
		const foundChat = await db.chats.where('id').equals(id).first();

		if (!foundChat) {
			throw new Error(`Chat with id ${id} was not found when getting chat title`);
		}

		return foundChat.title;
	}

	async function getChat(id: number) {
		return await db.chats.get(id);
	}

	const pinnedChatsByRecent: ReturnType<typeof ref<Chat[]>> = computed((oldValue) => {
		if (oldValue === unpinnedChats.value) return oldValue;

		logger.info('Chats Store', 'Updating computed pinned chats...')
		return pinnedChats.value.sort((a, b) => (b.lastestMessageDate?.getTime() || 0) - (a.lastestMessageDate?.getTime() || 0));
	});

	const unpinnedChatsByRecent: ReturnType<typeof ref<Chat[]>> = computed((oldValue) => {
		if (oldValue === unpinnedChats.value) return oldValue;

		logger.info('Chats Store', 'Updating computed unpinned chats...');
		return unpinnedChats.value.sort((a, b) => (b.lastestMessageDate?.getTime() || 0) - (a.lastestMessageDate?.getTime() || 0));
	});

	return {
		chats,
		pinnedChats,
		hasPinnedChats,
		unpinnedChats,
		pinnedChatsByRecent,
		unpinnedChatsByRecent,
		createNewChat,
		deleteChat,
		renameChat,
		setPinned,
		isOpened,
		clearChats,
		getChatTitle,
		getChat
	};
});

export default useChatsStore;