import logger from "@/lib/logger";
import { getMessageAttachments } from "@/utils/core/getMessageAttachments";

async function getMessageAttachmentBase64(messageId: number): Promise<string[]> {
	const attachments = await getMessageAttachments(messageId);

    return Promise.all(attachments.map(attachment => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsDataURL(attachment.content);
            reader.onload = () => resolve(reader.result?.toString().split(',')[1] as string);
            reader.onerror = (error) => reject(error);
        });
    }));
}

export async function getMessagesInOllamaFormat(openedChatMessages: ChatMessage[]): Promise<OllamaMessage[]> {
    const sortedMessages = openedChatMessages.sort((a, b) => a.created.getTime() - b.created.getTime());

    const formattedMessages = sortedMessages.map(async (message) => {
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
        };

        const msgImages = await getMessageAttachmentBase64(message.id);
        if (msgImages.length > 0) {
            builtMessage['images'] = msgImages;
        }

        if (message.type === 'model' && message.toolCalls) {
            builtMessage['tool_calls'] = message.toolCalls;
        }

        return builtMessage;
    });

    logger.info('Messages Store', 'Formatted messages into Ollama format', formattedMessages.length);

    return Promise.all(formattedMessages);
}