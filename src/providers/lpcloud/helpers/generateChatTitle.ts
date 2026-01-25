import db from "@/lib/db";
import logger from "@/lib/logger";
import { useConfigStore } from "@/stores/config";
import { tryCatch } from "@/utils/core/tryCatch";
import { lpCloudWrapper } from "../LPCloudWrapper";

export async function generateChatTitle(messages: ChatMessage[]): Promise<string> {
    const messagesFormatted: ChatMessage[] = await Promise.all(
        messages.map(async (message) => {
            if (message.type === 'tool') {
                return {
                    role: 'tool',
                    content: '<Tool Response>',
                }
            }

            let content = message.content;

            const hasAttachments = (await db.attachments
                .where('messageId')
                .equals(message.id)
                .count()) > 0;
            if (hasAttachments) {
                content += '\n<Attachment(s)>';
            }

            if (message.type === 'model' && (message.toolCalls && message.toolCalls.length > 0)) {
                content += '\n<Tool Call(s)>';
            }

            return {
                role: message.type,
                content,
            };
        })
    );

    messagesFormatted.unshift({
        role: 'system',
        content: 'You are a title generator. Your ONLY task is to output a short concise title (3-6 words) for the chat conversation. Rules:\n' +
            '- Output ONLY the title text, nothing else\n' +
            '- No explanations, no preamble, no punctuation at the end\n' +
            '- Do not use quotes around the title\n' +
            '- Do not include phrases like "Title:" or "Here\'s a title:"\n' +
            '- Use the same language as the conversation\n' +
            '- Maximum 8 words\n' +
            'Examples of titles:\n' +
            'Stock Market Trends\n' +
            'Perfect Chocolate Chip Recipe\n' +
            'Evolution of Music Streaming\n' +
            'Remote Work Productivity Tips\n' +
            'Artificial Intelligence in Healthcare\n' +
            'React Hook Best Practices',
    });

    try {
        const response = await lpCloudWrapper.generateTitle(messagesFormatted);

        const { data: generatedTitle, error } = await tryCatch<string>(JSON.parse(response.message.content).title);
        if (error) {
            logger.warn('OllamaProvider:helpers:generateChatTitle', 'Error parsing chat title:', error);
            return 'New Chat';
        }

        logger.info('OllamaProvider:helpers:generateChatTitle', 'Generated chat title:', generatedTitle);
        return generatedTitle;
    } catch (error) {
        logger.warn('OllamaProvider:helpers:generateChatTitle', 'Error generating chat title:', error);
        return 'New Chat';
    }
}