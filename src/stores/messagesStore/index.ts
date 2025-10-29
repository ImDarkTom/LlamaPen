import db from '@/lib/db';
import Dexie from 'dexie';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import logger from '@/lib/logger';
import { emitter } from '@/lib/mitt';
import ollamaApi, { type ChatIteratorChunk } from '@/utils/ollama';
import setPageTitle from '@/utils/core/setPageTitle';
import { useConfigStore } from '../config';
import useChatsStore from '../chatsStore';
import { useUiStore } from '../uiStore';
import useToolsStore from '../toolsStore';
import { initLiveSync } from './initLiveSync';
import { createNewChat } from './utils/createNewChat';
import { addAttachmentsToDB } from './utils/addAttachmentsToDB';
import { getMessagesInOllamaFormat } from './utils/getMessagesInOllamaFormat';

/**
 * Handles messages, opened chat messages, and opened chat ID. Seperate from chatsStore.
 */
const useMessagesStore = defineStore('messages', () => {
	const openedChatId = ref<number | null>(null);
	const openedChatMessages = ref<ChatMessage[]>([]);
	const chatsGeneratingTitles = ref<number[]>([]);
	
	const messageGenerationStates = ref<Record<number, { status: 'waiting' | 'generating' }>>({});

	initLiveSync(openedChatMessages, openedChatId);

	async function sendMessage(content: string, attachments: File[] = []) {
		if (content.length === 0) return;
		logger.info('Messages Store', 'Sending message', content, attachments);

		let shouldGenerateTitle = false;
		if (openedChatId.value === null) {
			const { newChatId, shouldGenTitle } = await createNewChat(content);

			openedChatId.value = newChatId;
			shouldGenerateTitle = shouldGenTitle;
		}

		const messageId = await db.messages.add({
			type: 'user',
			chatId: openedChatId.value,
			content,
			created: new Date(),
		});

		await addAttachmentsToDB(attachments, messageId)

		await db.chats.update(openedChatId.value, { lastestMessageDate: new Date() });
		logger.info('Messages Store', 'Added message', messageId);

		await getOllamaResponse({ generateTitle: shouldGenerateTitle });
	}


	async function editMessage(id: number, content: string, messageType: ChatMessage['type'], continueIfModel?: boolean) {
		if (content.length === 0) return;

		logger.info('Messages Store', 'Editing message', id, content);

		await db.messages.update(id, { content });

		const messageIdsToBeDeleted = await db.messages
			.where('[chatId+id]')
			.between([openedChatId.value, id], [openedChatId.value, Dexie.maxKey], false, true)
			.primaryKeys();

		// Delete all messages with same chatId where id is after the edited message's id 
		await db.messages.bulkDelete(messageIdsToBeDeleted);

		// Delete all attachments associated with deleted messages.
		await db.attachments
			.where('messageId')
			.anyOf(messageIdsToBeDeleted)
			.delete();

		logger.info('Messages Store', 'Deleted messages after edited message', id);

		if (messageType === 'user') {
			getOllamaResponse();
		} else if (continueIfModel) {
			getOllamaResponse({ messageIdOverride: id });
		}
	}

	async function deleteMessage(id: number) {
		await db.messages.delete(id);

		await db.attachments
			.where('messageId')
			.equals(id)
			.delete();

		logger.info('Messages Store', 'Deleted message with ID', id);
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
			status: 'inProgress',
			attachments: [],
		} as Omit<ModelChatMessage, 'id'>);

		logger.info('Messages Store', 'Added blank ollama message', ollamaMessageId);
		return ollamaMessageId;
	}

	async function handleMessageChunkDone(
		chunk: Extract<ChatIteratorChunk, { type: 'done' }>,
		toolCalls: NonNullable<ModelChatMessage['toolCalls']>,
		chatId: number,
		ollamaMessageId: number,
		syncMessageToDb: () => void,
		setMessageStatus: (newStatus: ModelMessageStatus) => void,
		options?: GetResponseOptions,
	) {
		syncMessageToDb();

		const status = chunk.reason === 'completed' ? 'finished' : 'cancelled';
		setMessageStatus(status);

		delete messageGenerationStates.value[ollamaMessageId];

		await db.messages.update(ollamaMessageId, {
			stats: {
				evalCount: chunk.stats?.evalCount,
				evalDuration: chunk.stats?.evalDuration,
				loadDuration: chunk.stats?.loadDuration,
				promptEvalCount: chunk.stats?.promptEvalCount,
				promptEvalDuration: chunk.stats?.promptEvalDuration,
				totalDuration: chunk.stats?.totalDuration,
			}
		} as Partial<ModelChatMessage>);

 		if (toolCalls.length > 0) {
			const toolsStore = useToolsStore();
			const toolMessagesInitialised: Omit<ToolChatMessage, 'id'>[] = toolCalls.map(tool => {
				return {
					type: 'tool',
					created: new Date(),
					chatId,
					content: '',
					toolName: tool.function.name
				}
			});

			const messageIds = await db.messages.bulkPut(toolMessagesInitialised, { allKeys: true });

			const toolResponses = await toolsStore.handleToolCalls(toolCalls);
					
			if (toolResponses && toolResponses.length > 0) {
				await Promise.all(
					toolResponses.map((response, index) =>
						db.messages.update(messageIds[index], {
							content: response.content,
							completed: new Date(),
						} as Partial<ToolChatMessage>)
					)
				);
						
				logger.info('Messages Store', 'Getting response after tools processed');
				getOllamaResponse({ generateTitle: options?.generateTitle });
			}
		} else {
			if (options?.generateTitle) {
				const chatTitle = await generateChatTitle();
				setPageTitle(`${chatTitle} | Chat`);
			}
		}

		logger.info('Messages Store', 'Finished generating response with status', status);
	}

	function isMessageGenerating(
		message: ChatMessage,
	): { generating: true, status: 'waiting' | 'generating' } | { generating: false, status: null } {
		const state = messageGenerationStates.value[message.id];
		if (!state) {
			return { generating: false, status: null };
		}

		return { generating: true, status: state.status };
	}

	/**
	 * Handles getting a response from the Ollama API for the current opened chat.
	 * This should be refactored into smaller functions as it handles a lot of logic.
	 * 
	 * @param modelOverride Optional model to override the current selected model.
	 */
	async function getOllamaResponse(options?: GetResponseOptions) {
		logger.info('Messages Store', 'Get ollama response with options', options);
		const messageSaveInterval = useConfigStore().chat.tokenSaveInterval;

		// Helpers
		const setMessageStatus = async (newStatus: ModelMessageStatus) => {
			await db.messages.update(ollamaMessageId, { status: newStatus } as Partial<ModelChatMessage>);
		}

		const setMessageError = async (errorMessage: string) => {
			await db.messages.update(ollamaMessageId, { errorText: errorMessage, status: 'error' } as Partial<ModelChatMessage>);
		}

		const syncMessageToDb = async () => {
			const updateData: Partial<ModelChatMessage> = { content: generatedContent };
			if (generatedThoughts) {
				updateData.thinking = generatedThoughts;
			}
			if (toolCalls && toolCalls.length > 0) {
				updateData.toolCalls = toolCalls;
			}
			if (thinkStarted || thinkEnded) {
				updateData.thinkStats = {
					started: thinkStarted,
					ended: thinkEnded
				};
			}

			await db.messages.update(ollamaMessageId, updateData);
		}

		// 1. Ensure there is an opened chat ID.
		if (!openedChatId.value) {
			logger.warn('Messages Store', 'No opened chat ID found when trying to get Ollama response.');
			return;
		}
		const chatId = openedChatId.value;

		const selectedModel = getSelectedModel(options?.modelOverride);

		// 2. Add a blank model message to the chat to put the response in or get the overridden one.
		const ollamaMessageId = options?.messageIdOverride ?? await addModelMessageToChat(selectedModel, chatId);
		// Update the chat's lastestMessageDate to now.
		await db.chats.update(chatId, { lastestMessageDate: new Date() });

		const abortController = new AbortController();

		const cancelHandler = async () => {
			setMessageStatus('cancelled');
			abortController.abort("user-cancelled");
		}

		emitter.on('stopChatGeneration', cancelHandler);
		logger.info('Messages Store', 'Added stop chat generation emit listener');

		const chatMessageList = await getMessagesInOllamaFormat(openedChatMessages.value);

		let generatedContent = "";
		let generatedThoughts = "";
		let thinkStarted = -1;
		let thinkEnded = -1;
		const toolCalls: ModelChatMessage['toolCalls'] = [];

		if (options?.messageIdOverride) {
			const message = await db.messages.get(options.messageIdOverride);

			if (!message) {
				throw new Error('Failed to get message with id when editing model message + continuing.');
			}

			generatedContent = message.content;
			generatedThoughts = (message as ModelChatMessage).thinking ?? '';
		}

		messageGenerationStates.value[ollamaMessageId] = { status: 'waiting' };

		let hasAbortTrigger = false;
		let messageSaveCounter = 0;
		try {
			for await (const chunk of ollamaApi.chat(chatMessageList, abortController.signal, { modelOverride: selectedModel })) {
				// First, check if the chunk is an error or done indicator.
				if (chunk.type === 'error') {
					throw chunk;
				} else if (chunk.type === 'done') {
					handleMessageChunkDone(
						chunk,
						toolCalls,
						chatId,
						ollamaMessageId,
						syncMessageToDb,
						setMessageStatus,
						options,
					);
					break;
				}

				// If not, process the message chunk.
				// If message is not an error or stream end chunk.
				if (!hasAbortTrigger) {
					hasAbortTrigger = true;
					messageGenerationStates.value[ollamaMessageId] = { status: 'generating' };
				}

				const messageChunk = chunk.data.message.content;
				const thoughtsChunk = chunk.data.message.thinking || '';

				const messageIndex = openedChatMessages.value.findIndex(message => message.id === ollamaMessageId);
				if (messageIndex !== -1) {
					generatedContent += messageChunk;
					generatedThoughts += thoughtsChunk;

					const updatedMessage = {
						...openedChatMessages.value[messageIndex] as ModelChatMessage,
						content: generatedContent,
						thoughts: generatedThoughts,
					} as ModelChatMessage;

					if ((/<think>/i.test(generatedContent) || generatedThoughts !== '') && thinkStarted === -1) {
						thinkStarted = Date.now();
					}

					if (((/<\/think>/i.test(generatedContent) || (thoughtsChunk === '' && generatedThoughts !== ''))) && thinkEnded === -1) {
						thinkEnded = Date.now();
					}

					if (chunk.data.message.tool_calls) {
						for (const toolCall of chunk.data.message.tool_calls) {
							logger.info('Messages Store', 'Saved tool call to list', toolCall);
							toolCalls.push(toolCall);
						}

						updatedMessage['toolCalls'] = toolCalls;
					}

					openedChatMessages.value[messageIndex] = updatedMessage;
				}

				messageSaveCounter++;
				if (messageSaveCounter >= messageSaveInterval) {
					messageSaveCounter = 0;
					syncMessageToDb();
				}
			}
		} catch (errorObject: CustomErrorResponse | any) {
			delete messageGenerationStates.value[ollamaMessageId];
			if (typeof errorObject === 'string' && errorObject === "user-cancelled") return;

			logger.info('Messages Store', 'Caught error when getting Ollama response', errorObject);
			if (errorObject.type === 'error') {
				setMessageError(errorObject.error.message || 'An error occurred during message generation.');
				emitter.emit('stopChatGeneration');
			} else {
				logger.warn('Messages Store', 'Unknown error when getting Ollama response', errorObject);
				alert(`Unknown error when generating message: ${errorObject.message || errorObject}`);
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
		getOllamaResponse({ modelOverride: modelToUse });
	}

	/**
	 * Clears all messages from the database.
	 */
	async function clearAllMessages() {
		await db.messages.clear();
		await db.attachments.clear();
	}

	return {
		openedChatMessages,
		openedChatId,
		chatsGeneratingTitles,
		isMessageGenerating,
		openChat,
		sendMessage,
		editMessage,
		regenerateMessage,
		clearAllMessages,
		deleteMessage
	};
});

export default useMessagesStore;