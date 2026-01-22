import logger from "@/lib/logger";
import { getMessageAttachments } from "@/utils/core/getMessageAttachments";
import type { OllamaMessage, OllamaMessageRole } from "../types";
import * as Ollama from "ollama";

async function getMessageAttachmentBase64(messageId: number): Promise<string[]> {
    const attachments = await getMessageAttachments(messageId);

    if (attachments.length === 0) return [];

    return Promise.all(attachments.map(attachment => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.readAsDataURL(attachment.content);
            reader.onload = () => resolve(reader.result?.toString().split(',')[1] as string);
            reader.onerror = (error) => reject(error);
        });
    }));
}

export async function appMesagesToOllama(chatMessages: ChatMessage[]): Promise<OllamaMessage[]> {
    const sortedMessages = chatMessages.sort((a, b) => a.created.getTime() - b.created.getTime());

    const formattedMessages = sortedMessages.map(async (message) => {
        if (message.type === 'tool') {
            return {
                role: 'tool' as const,
                tool_name: message.toolName,
                content: message.content,
            }
        }

        // TODO: handle system messages properly
        const role: OllamaMessageRole = (() => {
            switch (message.type) {
                case 'user':
                    return 'user';
                case 'model':
                    return 'assistant';
                default:
                    return 'user';
            }
        })();

        const builtMessage: Ollama.Message = {
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

    logger.info('Coverter:appMessageToOllama', 'Formatted messages into Ollama format', formattedMessages.length);

    return Promise.all(formattedMessages);
}