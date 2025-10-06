import db from '@/lib/db';
import Dexie, { liveQuery } from 'dexie';
import { defineStore } from 'pinia';
import { ref, toRaw, watch, type Ref } from 'vue';
import useChatsStore from './chatsStore';
import logger from '@/lib/logger';
import { emitter } from '@/lib/mitt';
import ollamaApi, { type ChatIteratorChunk, type ChatIteratorError } from '@/utils/ollama';
import { useConfigStore } from './config';
import { filesAsBase64 } from '@/utils/core/filesAsBase64';
import { useUiStore } from './uiStore';
import setPageTitle from '@/utils/core/setPageTitle';
import { getMessageAttachmentBlobs } from '@/utils/core/getMessageAttachments';
import useToolsStore from './toolsStore';

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
		const config = useConfigStore();
		const chatsStore = useChatsStore();

		let shouldGenerateTitle = false;

		logger.info('Messages Store', 'Sending message', content, attachments);

		if (openedChatId.value === null) {
			// If there was no opened chat, create a new line
			const newChatId = await chatsStore.createNewChat();
			openedChatId.value = newChatId;

			if (config.chat.titleGenerationStyle === 'generate') {
				shouldGenerateTitle = true;
			} else if (config.chat.titleGenerationStyle === 'firstMessage') {
				const firstMessageTitle = content.length > 50 ? content.slice(0, 47) + '...' : content;
				chatsStore.renameChat(newChatId, firstMessageTitle);
			} else if (config.chat.titleGenerationStyle === 'chatId') {
				chatsStore.renameChat(newChatId, `Chat #${newChatId}`);
			} else if (config.chat.titleGenerationStyle === 'dynamic') {
				const questionRegex = /^(who|what|when|where|why|how|which|whose|is|are|do|does|did|can|could|would|should|will)\b.*\?$/i;
				
				if (questionRegex.test(content.trim())) {
					const firstMessageTitle = content.length > 50 ? content.slice(0, 47) + '...' : content;
					chatsStore.renameChat(newChatId, firstMessageTitle);
				} else {
					shouldGenerateTitle = true;
				}
			}

			logger.info('Messages Store', 'No opened chat, created new with ID', openedChatId.value);
		}

		const messageData = {
			chatId: openedChatId.value,
			content,
			created: new Date(),
			type: 'user' as 'user' | 'model',
		};

		const messageId = await db.messages.add(messageData);

		const allAttachments = toRaw(attachments);
		const attachmentMap: Omit<UserAttachment, 'id'>[] = allAttachments.map((attachment) => {
			return {
				content: attachment,
				created: new Date(),
				messageId,
			}
		})

		await db.attachments.bulkAdd(attachmentMap);

		await db.chats.update(openedChatId.value, { lastestMessageDate: new Date() });
		logger.info('Messages Store', 'Added message', messageData);

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
			const attachmentBlobsInMessage = await getMessageAttachmentBlobs(message.id);

			if (message.type === 'tool') {
				return {
					role: 'tool' as const,
					tool_name: message.toolName,
					content: message.content,
				}
			}

			const role: MessageRole = message.type === 'model' ? 'assistant' : 'user';

			const builtMessage: OllamaMessage = {
				role: role,
				content: message.content,
				images: await filesAsBase64(attachmentBlobsInMessage),
			};

			if (message.type === 'model' && message.toolCalls) {
				builtMessage['tool_calls'] = message.toolCalls;
			}

			return builtMessage;
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
	async function getOllamaResponse(options?: {
		modelOverride?: string
		messageIdOverride?: number,
		generateTitle?: boolean,
	}) {
		logger.info('Messages Store', 'Get ollama response with options', options);
		const messageSaveInterval = useConfigStore().chat.tokenSaveInterval;

		// Helpers
		const setMessageStatus = async (newStatus: ModelMessageStatus) => {
			await db.messages.update(ollamaMessageId, { status: newStatus } as Partial<ModelChatMessage>);
		}

		const addMessagePostGenInfo = async (lastChunk: Partial<Extract<ChatIteratorChunk, { type: 'done' }>>) => {
			await db.messages.update(ollamaMessageId, {
				stats: {
					evalCount: lastChunk.stats?.evalCount,
					evalDuration: lastChunk.stats?.evalDuration,
					loadDuration: lastChunk.stats?.loadDuration,
					promptEvalCount: lastChunk.stats?.promptEvalCount,
					promptEvalDuration: lastChunk.stats?.promptEvalDuration,
					totalDuration: lastChunk.stats?.totalDuration,
				}
			} as Partial<ModelChatMessage>)
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
			abortController.abort("message generation cancelled by user.");
		}

		emitter.on('stopChatGeneration', cancelHandler);
		logger.info('Messages Store', 'Added stop chat generation emit listener');

		const chatMessageList = await getMessagesInOllamaFormat(chatId);

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

		let isGenerating = false;
		let messageSaveCounter = 0;
		for await (const chunk of ollamaApi.chat(chatMessageList, abortController.signal, { modelOverride: selectedModel })) {
			// First, check if the chunk is an error or done indicator.
			if (chunk.type === 'error') {
				handleMessageChunkError(chunk);
				break;
			} else if (chunk.type === 'done') {
				syncMessageToDb();

				const status = chunk.reason === 'completed' ? 'finished' : 'cancelled';
				setMessageStatus(status);

				addMessagePostGenInfo(chunk);

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
		openChat,
		sendMessage,
		editMessage,
		regenerateMessage,
		clearAllMessages,
		deleteMessage
	};
});

export default useMessagesStore;