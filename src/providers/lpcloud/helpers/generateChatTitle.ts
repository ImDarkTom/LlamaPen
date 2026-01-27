import db from "@/lib/db";
import logger from "@/lib/logger";
import { lpCloudWrapper } from "../LPCloudWrapper";

export async function generateChatTitle(messages: ChatMessage[]): Promise<string> {
    const messagesFormatted = await Promise.all(
        messages.map(async (message) => {
            if (message.type === 'tool') {
                // when we implement tool calling
                return {
                    role: 'assistant',
                    content: 'Tool Call: <Tool Response>',
                }
            }

            const hasAttachments = (await db.attachments
                .where('messageId')
                .equals(message.id)
                .count()) > 0;

            
            let content = message.content;
            
            if (hasAttachments) {
                content += '\n<Attachment(s)>';
            }

            if (message.type === 'model' && (message.toolCalls && message.toolCalls.length > 0)) {
                content += '\n<Tool Call(s)>';
            }

            return {
                role: message.type === 'user' ? 'user' : 'assistant',
                content,
            };
        })
    );

    try {
        const generatedTitle = await lpCloudWrapper.generateTitle(messagesFormatted);

        logger.info('LPCloudProvider:helpers:generateChatTitle', 'Generated chat title:', generatedTitle);
        return generatedTitle;
    } catch (error) {
        logger.warn('LPCloudProvider:helpers:generateChatTitle', 'Error generating chat title:', error);
        return 'New Chat';
    }
}