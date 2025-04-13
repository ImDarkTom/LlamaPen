import db from '@/utils/db';
import Dexie, { liveQuery } from 'dexie';
import { defineStore } from 'pinia';
import { ref, toRaw, watch, type Ref } from 'vue';
import useChatsStore from './chatsStore';
import logger from '@/utils/logger';
import { emitter } from '@/mitt';
import ollamaApi from '@/utils/ollama';
import { useConfigStore } from './config';
import { filesAsBase64 } from '@/utils/conversion';
import { useUiStore } from './uiStore';

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
	

	function openChat(id: number) {
		logger.info('Messages Store', 'Opening chat with id', id);

		openedChatId.value = id || null;
		useUiStore().setScrollingDown(true);
	}

	// -----
	// Utils
	// -----

	async function getOllamaResponse() {
		// TODO: Reduce function complexity by splitting into smaller functions.
		// TODO: make this know that openedChatId is not null.

		const TOTAL_MESSAGE_SAVE_INTERVAL = 5; // 5 tokens/chunks.
		let saveCounter = 5;
	
		// We have verified that openedChatId is not null by this point
	
		const selectedModel = useConfigStore().selectedModel;
	
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
		});

		await db.chats.update(openedChatId.value!, { lastestMessageDate: new Date() });
		logger.info('Messages Store', 'Added ollama message', ollamaMessageId);

		const abortController = new AbortController();
		let aborted = false;
		
		const cancelHandler = async () => {
			await db.messages.update(ollamaMessageId, { status: 'cancelled' });
			aborted = true;
			abortController.abort("message generation cancelled by user.");
		}

		emitter.on('stopChatGeneration', cancelHandler);
		logger.info('Messages Store', 'Added stop chat generation emit listener');
		
		const response = await ollamaApi.sendMessageRequest(listBeforeModelMessage, abortController.signal);

		if (!response.body) {
			throw new Error('No response body found for Ollama message response.')
		}

		const reader = response.body.getReader();
		const textDecoder = new TextDecoder();

		await db.messages.update(ollamaMessageId, { status: 'generating' });

		let updatedMessage = ""; 
		while (true) {
			if (aborted) {
				logger.info('Messages Store', 'Message generation cancelled.');
				break;
			}

			const { done, value } = await reader.read();

			if (done) {
				updateOllamaMessageInDB(ollamaMessageId, updatedMessage);
				await db.messages.update(ollamaMessageId, { status: 'finished' });
				logger.info('Messages Store', 'Finished generating response\n==========\n', updatedMessage);

				break;
			}

			const chunkText = textDecoder.decode(value).trim().split('\n');

			for (const chunk of chunkText) {
				try {
					const chunkJson = JSON.parse(chunk);
					const messageChunk = chunkJson.message.content;


					openedChatMessages.value = openedChatMessages.value.map((message) => {
						if (message.id === ollamaMessageId) {
							updatedMessage = message.content + messageChunk;
							
							return {
								...message,
								content: updatedMessage,
							};
						}

						return message;
					});

					saveCounter--;

					if (saveCounter <= 0) {
						updateOllamaMessageInDB(ollamaMessageId, updatedMessage);
						saveCounter = TOTAL_MESSAGE_SAVE_INTERVAL;
						logger.info('Messages Store', 'Updated ollama message in DB\n=======\n', updatedMessage);
					}


				} catch (error: unknown) {
					const errorMsg = JSON.parse(chunk).error;
					if (errorMsg) {
						emitter.emit('popup:error', { message: 'Error fetching response message', error: errorMsg });
					}

					console.error('Error parsing response chunk', error);
				}
			}
		}

		// If chat name is not "New Chat", don't generate title.
		if (aborted || !((await db.chats.where('id').equals(openedChatId.value!).first())?.title === 'New Chat')) return;

		emitter.off('stopChatGeneration', cancelHandler);

		logger.info('Messages Store', 'Generating chat title for opened chat', openedChatId.value);

		const chatTitle = await ollamaApi.generateChatTitle(openedChatMessages.value);

		if (openedChatId.value === null) {
			throw new Error('Chat to set generated title for is null');
		}

		useChatsStore().renameChat(openedChatId.value, chatTitle);
	}

	async function updateOllamaMessageInDB(id: number, content: string) {
		await db.messages.update(id, { content });
	}

	async function getMessagesInOllamaFormat() {
		// TODO: Make this include attachments
		const sortedMessages = await db.messages
			.where('chatId')
			.equals(openedChatId.value!)
			.sortBy('created');
		
		const formattedMessages = sortedMessages.map(async (message) => {
			return {
				role: message.type === 'user' ? 'user' : 'assistant',
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

	return { 
		openedChatMessages, 
		openedChatId,
		openChat,
		sendMessage,
		editMessage,
		clearMessages,
	};
});

export default useMessagesStore;