import db from '@/lib/db';
import Dexie, { liveQuery } from 'dexie';
import { defineStore } from 'pinia';
import { ref, toRaw, watch, type Ref } from 'vue';
import useChatsStore from './chatsStore';
import logger from '@/lib/logger';
import { emitter } from '@/lib/mitt';
import ollamaApi, { type ChatIteratorError } from '@/utils/ollama';
import { useConfigStore } from './config';
import { filesAsBase64 } from '@/utils/core/filesAsBase64';
import { useUiStore } from './uiStore';
import setPageTitle from '@/utils/core/setPageTitle';

// ----
// Init
// ----
let liveSyncInitialised = false;

type RefReturn<T> = ReturnType<typeof ref<T>>;

function initLiveSync(
	messages: RefReturn<ChatMessage[]>,
	openedChatMessages: RefReturn<ChatMessage[]>,
	openedChatIdRef: Ref<number | null, number | null>
) {
	if (liveSyncInitialised) return;

	liveSyncInitialised = true;

	liveQuery(() => db.messages.toArray()).subscribe({
		next: data => {
			messages.value = data;
		},
		error: (e) => {
			console.error('Error during liveQuery for chats', e)
		}
	});

	let openedMessagesSubscription: { unsubscribe: () => void } | null = null;

	watch(openedChatIdRef, (newId) => {
		if (openedMessagesSubscription) {
			openedMessagesSubscription.unsubscribe();
			openedMessagesSubscription = null;
		}

		if (newId === null) {
			openedChatMessages.value = [];
			return;
		}

		openedMessagesSubscription = liveQuery(() => db.messages.where('chatId').equals(newId).toArray()).subscribe({
			next: data => {
				openedChatMessages.value = data;
			},
			error: (e) => {
				console.error('Error during liveQuery for opened chat messages', e)
			}
		});
	});

	logger.info('Messages Store', 'Initialized live sync for messages store.');
}

// -----
// Store
// -----

/**
 * Handles messages, opened chat messages, and opened chat ID. Seperate from chatsStore.
 */
const useMessagesStore = defineStore('messages', () => {
	const messages = ref<ChatMessage[]>([]);
	const openedChatMessages = ref<ChatMessage[]>([]);

	const openedChatId = ref<number | null>(null);

	initLiveSync(messages, openedChatMessages, openedChatId);

	async function sendMessage(content: string, attachments: File[] = []) {
		if (content.length === 0) return;

		logger.info('Messages Store', 'Sending message', content, attachments);

		if (openedChatId.value === null) {
			const newChatId = await useChatsStore().createNewChat();
			openedChatId.value = newChatId;

			const newUrl = `/chat/${newChatId}`;

			logger.info('Messages Store', 'No opened chat, created new and navigating to', newUrl);

			logger.info('Messages Store', "Created new chat with id", openedChatId.value);
		}

		const messageData = {
			chatId: openedChatId.value,
			content,
			created: new Date(),
			type: 'user' as 'user' | 'model',
			attachments: toRaw(attachments),
		};

		await db.messages.add(messageData);
		await db.chats.update(openedChatId.value, { lastestMessageDate: new Date() });
		logger.info('Messages Store', 'Added message', messageData);

		getOllamaResponse();
	}


	async function editMessage(id: number, content: string) {
		if (content.length === 0) return;

		logger.info('Messages Store', 'Editing message', id, content);

		await db.messages.update(id, { content });

		// Delete all messages with same chatId where id is after the edited message's id 
		await db.messages
			.where('[chatId+id]')
			.between([openedChatId.value, id], [openedChatId.value, Dexie.maxKey], false, true).delete();

		logger.info('Messages Store', 'Deleted messages after edited message', id);

		getOllamaResponse();
	}


	function openChat(id: number | null) {
		logger.info('Messages Store', 'Opening chat with id', id);

		openedChatId.value = id || null;
		useUiStore().chat.isScrollingDown = true;
	}

	// -----
	// Utils
	// -----

	async function getOllamaResponse(modelOverride?: string | null) {
		// TODO: Reduce function complexity by splitting into smaller functions.
		// TODO: make this know that openedChatId is not null.

		const TOTAL_MESSAGE_SAVE_INTERVAL = 5; // 5 tokens/chunks.
		let saveCounter = 5;

		// We have verified that openedChatId is not null by this point

		const selectedModel = modelOverride ?? useConfigStore().selectedModel;

		if (selectedModel === '') {
			throw new Error('No selected model found.')
		}

		const listBeforeModelMessage = await getMessagesInOllamaFormat();

		const ollamaMessageId = await db.messages.add({
			chatId: openedChatId.value as number,
			content: '',
			created: new Date(),
			type: 'model',
			model: selectedModel,
			status: 'waiting',
			attachments: [],
		} as Omit<ModelChatMessage, 'id'>);

		await db.chats.update(openedChatId.value!, { lastestMessageDate: new Date() });
		logger.info('Messages Store', 'Added ollama message', ollamaMessageId);

		const abortController = new AbortController();

		const cancelHandler = async () => {
			updateMessageStatus(ollamaMessageId, 'cancelled');
			abortController.abort("message generation cancelled by user.");
		}

		emitter.on('stopChatGeneration', cancelHandler);
		logger.info('Messages Store', 'Added stop chat generation emit listener');

		function handleChunkError(chunk: ChatIteratorError) {
			switch (chunk.error.type) {
				case '401-parse-fail':
					alert('Error parsing 401 response');
					break;
				case 'no-response-body':
					alert('No response body found for message chunk');
					break;
				case 'unknown-401':
					alert('Unknown 401 error when recieving message');
					break;
				case 'user-not-authed':
					alert('You need to be signed in to use this model.');
					break;
				case 'user-not-premium':
					alert('You need premium to use this model.');
					break;
				case 'rate-limit': 
					alert('Rate limit reached. Please choose a different model or try again later.');
					break;
				default:
					alert(`Unknown error when generating message: ${chunk.error.message}`);
			}
		}

		let updatedMessage = "";
		let updatedMessageThoughts = ""; 
		let messageGenerating = false;
		for await (const chunk of ollamaApi.chat(listBeforeModelMessage, abortController.signal, selectedModel)) {
			// console.log(chunk);

			if ('error' in chunk) {
				handleChunkError(chunk);
				cancelHandler();
				break;
			}

			if ('stream_done' in chunk) {
				const status = chunk.reason === 'stream-done' ? 'finished' : 'cancelled'

				updateOllamaMessageInDB(ollamaMessageId, updatedMessage);
				updateMessageStatus(ollamaMessageId, status);

				logger.info('Messages Store', 'Got stream_done chunk.');
				break;
			}

			if ('done' in chunk && chunk.done) {
				updateOllamaMessageInDB(ollamaMessageId, updatedMessage);
				updateMessageStatus(ollamaMessageId, 'finished');

				logger.info('Messages Store', 'Finished generating response.');
				break;
			}

			// If message is not an error or stream end chunk.
			if (messageGenerating === false) {
				messageGenerating = true;
				updateMessageStatus(ollamaMessageId, 'generating');
			}

			const messageChunk = chunk.message.content;
			const thoughtsChunk = chunk.message.thinking || '';
			openedChatMessages.value = openedChatMessages.value.map((message) => {
				if (message.id === ollamaMessageId) {
					updatedMessage += messageChunk;
					updatedMessageThoughts += thoughtsChunk;

					return {
						...message,
						content: updatedMessage,
						thinking: updatedMessageThoughts,
					};
				}

				return message;
			});

			saveCounter--;

			if (saveCounter <= 0) {
				updateOllamaMessageInDB(ollamaMessageId, updatedMessage, updatedMessageThoughts);
				saveCounter = TOTAL_MESSAGE_SAVE_INTERVAL;
				// logger.info('Messages Store', 'Updated ollama message in DB\n=======\n', updatedMessage);
			}
		}

		emitter.off('stopChatGeneration', cancelHandler);

		const chatTitle = await attemptGenerateTitle();
		setPageTitle(`${chatTitle} | Chat`);
	}

	async function updateMessageStatus(messageId: number, status: ModelMessageStatus) {
		await db.messages.update(messageId, { status } as Partial<ModelChatMessage>);
	}

	/**
	 * Generates a title for the opened chat if the current title is "New Chat".
	 * @returns The generated title for the opened chat, or the current title if it is not "New Chat".
	 */
	async function attemptGenerateTitle(): Promise<string> {
		const chatId = openedChatId.value;
		if (!chatId) {
			throw new Error('No opened chatID found when generating title');
		}

		const chatsStore = useChatsStore();
		const currentTitle = await chatsStore.getChatTitle(chatId);

		// If chat name is not "New Chat", don't generate title.
		if (currentTitle !== 'New Chat') return currentTitle;

		await db.chats.update(chatId, { isGeneratingTitle: true });

		logger.info('Messages Store', 'Generating chat title for opened chat', chatId);

		const chatMessages = openedChatMessages.value;
		const newChatTitle = await ollamaApi.generateChatTitle(chatMessages);

		useChatsStore().renameChat(chatId, newChatTitle);
		await db.chats.update(chatId, { isGeneratingTitle: false });

		return newChatTitle;
	}

	async function updateOllamaMessageInDB(id: number, content: string, thinking?: string) {
		if (thinking) {
			await db.messages.update(id, { content, thinking } as ModelChatMessage);
			return;
		}

		await db.messages.update(id, { content });
	}

	async function getMessagesInOllamaFormat(): Promise<OllamaMessage[]> {
		const sortedMessages = await db.messages
			.where('chatId')
			.equals(openedChatId.value!)
			.sortBy('created');

		const formattedMessages = sortedMessages.map(async (message) => {
			return {
				role: message.type === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
				content: message.content,
				images: await filesAsBase64(message.attachments || [])
			};
		});

		logger.info('Messages Store', 'Formatted messages into Ollama format', await Promise.all(formattedMessages));

		return Promise.all(formattedMessages);
	}

	async function clearMessages() {
		await db.messages.clear();
	}

	async function regenerateMessage(id: number, model: string) {
		await db.messages
			.where('[chatId+id]')
			.between([openedChatId.value, id - 1], [openedChatId.value, Dexie.maxKey], false, true).delete();

		logger.info('Messages Store', 'Deleted messages after message to be regenerated', id);

		const modelToUse = model === '' ? null : model;

		getOllamaResponse(modelToUse);
	}

	return {
		openedChatMessages,
		openedChatId,
		openChat,
		sendMessage,
		editMessage,
		clearMessages,
		regenerateMessage
	};
});

export default useMessagesStore;