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
	openedChatMessages: RefReturn<ChatMessage[]>,
	openedChatIdRef: Ref<number | null, number | null>
) {
	if (liveSyncInitialised) return;
	liveSyncInitialised = true;

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
	const openedChatId = ref<number | null>(null);
	const openedChatMessages = ref<ChatMessage[]>([]);
	const chatsGeneratingTitles = ref<number[]>([]);

	initLiveSync(openedChatMessages, openedChatId);

	async function sendMessage(content: string, attachments: File[] = []) {
		if (content.length === 0) return;
		let shouldGenerateTitle = false;

		logger.info('Messages Store', 'Sending message', content, attachments);

		if (openedChatId.value === null) {
			const newChatId = await useChatsStore().createNewChat();
			openedChatId.value = newChatId;
			shouldGenerateTitle = true;

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

		await getOllamaResponse();
		if (shouldGenerateTitle) {
			const chatTitle = await generateChatTitle();
			setPageTitle(`${chatTitle} | Chat`);
		}
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

	function getSelectedModel(modelOverride?: string) {
		// TODO: Validate that the selected model is valid by comparing to
		// a list of available models.
		if (modelOverride) {
			return modelOverride;
		}

		const configStore = useConfigStore();
		const selectedModel = configStore.selectedModel;

		return selectedModel;
	}

	async function addModelMessageToChat(model: string, chatId: number): Promise<number> {
		const ollamaMessageId = await db.messages.add({
			chatId,
			content: '',
			created: new Date(),
			type: 'model',
			model,
			status: 'waiting',
			attachments: [],
		} as Omit<ModelChatMessage, 'id'>);

		logger.info('Messages Store', 'Added blank ollama message', ollamaMessageId);
		return ollamaMessageId;
	}

	function handleMessageChunkError(chunk: ChatIteratorError) {
		switch (chunk.error.type) {
			case '401-parse-fail':
				alert(`Error parsing 401 response: ${chunk.error.message}`);
				break;
			case 'no-response-body':
				alert('No response body found for message chunk');
				break;
			case 'unknown-401':
				alert(`Unknown 401 error: ${chunk.error.message}`);
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
			case 'parse-fail':
				alert(`Failed to parse message chunk.`);
				break;
			default:
				alert(`Unknown error when generating message: ${chunk.error.message}`);
		}

		emitter.emit('stopChatGeneration');
	}

	/**
	 * Formats messages from the database into the format expected by Ollama.
	 * 
	 * @returns An array of messages formatted for Ollama.
	 */
	async function getMessagesInOllamaFormat(chatId: number): Promise<OllamaMessage[]> {
		const sortedMessages = await db.messages
			.where('chatId')
			.equals(chatId)
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

	/**
	 * Handles getting a response from the Ollama API for the current opened chat.
	 * This should be refactored into smaller functions as it handles a lot of logic.
	 * 
	 * @param modelOverride Optional model to override the current selected model.
	 */
	async function getOllamaResponse(modelOverride?: string) {
		const messageSaveInterval = useConfigStore().chat.tokenSaveInterval;

		// Helpers
		const setMessageStatus = async(newStatus: ModelMessageStatus) => {
			await db.messages.update(ollamaMessageId, { status: newStatus } as Partial<ModelChatMessage>);
		}

		const syncMessageToDb = async () => {
			const updateData: Partial<ModelChatMessage> = { content: generatedContent };
			if (generatedThoughts) {
				updateData.thinking = generatedThoughts;
			}

			await db.messages.update(ollamaMessageId, updateData);
		}

		// 1. Ensure there is an opened chat ID.
		if (!openedChatId.value) {
			logger.warn('Messages Store', 'No opened chat ID found when trying to get Ollama response.');
			return;
		}
		const chatId = openedChatId.value;

		const selectedModel = getSelectedModel(modelOverride);

		// 2. Add a blank model message to the chat to put the response in.
		const ollamaMessageId = await addModelMessageToChat(selectedModel, chatId);
		// Update the chat's lastestMessageDate to now.
		await db.chats.update(chatId, { lastestMessageDate: new Date() });

		const abortController = new AbortController();

		const cancelHandler = async () => {
			setMessageStatus('cancelled');
			abortController.abort("message generation cancelled by user.");
		}

		emitter.on('stopChatGeneration', cancelHandler);
		logger.info('Messages Store', 'Added stop chat generation emit listener');

		const chatMessageList = await getMessagesInOllamaFormat(chatId);

		let generatedContent = "";
		let generatedThoughts = ""; 
		let isGenerating = false;
		let messageSaveCounter = 0;
		for await (const chunk of ollamaApi.chat(chatMessageList, abortController.signal, selectedModel)) {
			// First, check if the chunk is an error or done indicator.
			if (chunk.type === 'error') {
				handleMessageChunkError(chunk);
				break;
			} else if (chunk.type === 'done') {
				syncMessageToDb();

				const status = chunk.reason === 'completed' ? 'finished' : 'cancelled';
				setMessageStatus(status);

				logger.info('Messages Store', 'Finished generating response with status', status);
				break;
			}

			// If not, process the message chunk.

			// If message is not an error or stream end chunk.
			if (!isGenerating) {
				isGenerating = true;
				setMessageStatus('generating');
			}

			const messageChunk = chunk.data.message.content;
			const thoughtsChunk = chunk.data.message.thinking || '';

			const messageIndex = openedChatMessages.value.findIndex(message => message.id === ollamaMessageId);
			if (messageIndex !== -1) {
				generatedContent += messageChunk;
				generatedThoughts += thoughtsChunk;
				openedChatMessages.value[messageIndex] = {
					...openedChatMessages.value[messageIndex] as ModelChatMessage,
					content: generatedContent,
					thinking: generatedThoughts
				};
			}

			messageSaveCounter++;
			if (messageSaveCounter >= messageSaveInterval) {
				messageSaveCounter = 0;
				syncMessageToDb();
			}
		}

		// Clean up
		emitter.off('stopChatGeneration', cancelHandler);
	}

	/**
	 * Generates a title for the opened chat.
	 * @returns The generated title for the opened chat, or the current title if it is not "New Chat".
	 */
	async function generateChatTitle(): Promise<string> {
		const chatId = openedChatId.value;
		if (!chatId) {
			throw new Error('No opened chatID found when generating title');
		}

		chatsGeneratingTitles.value.push(chatId);
		logger.info('Messages Store', 'Generating chat title for opened chat', chatId);

		const chatMessages = openedChatMessages.value;
		const newChatTitle = await ollamaApi.generateChatTitle(chatMessages);

		useChatsStore().renameChat(chatId, newChatTitle);
		chatsGeneratingTitles.value = chatsGeneratingTitles.value.filter(id => id !== chatId);

		return newChatTitle;
	}

	/**
	 * Regenerates a message by deleting all messages from the opened chat after the specified message ID
	 * and then calling getOllamaResponse to generate the response again.
	 * 
	 * @param id The ID of the message to regenerate.
	 * @param model The model to use for regeneration. If empty, uses the selected model.
	 */
	async function regenerateMessage(id: number, model: string) {
		await db.messages
			.where('[chatId+id]')
			.between([openedChatId.value, id - 1], [openedChatId.value, Dexie.maxKey], false, true)
			.delete();
		logger.info('Messages Store', 'Deleted messages after message to be regenerated', id);

		const modelToUse = model === '' ? undefined : model;
		getOllamaResponse(modelToUse);
	}

	/**
	 * Clears all messages from the database.
	 */
	async function clearAllMessages() {
		await db.messages.clear();
	}

	return {
		openedChatMessages,
		openedChatId,
		chatsGeneratingTitles,
		openChat,
		sendMessage,
		editMessage,
		regenerateMessage,
		clearAllMessages,
	};
});

export default useMessagesStore;