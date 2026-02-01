import db from "@/lib/db";
import logger from "@/lib/logger";
import { useConfigStore } from "@/stores/config";
import { tryCatch } from "@/utils/core/tryCatch";
import { ollamaWrapper } from "../OllamaWrapper";

const chatTitleExamples = `\nExamples of titles:\n📉 Stock Market Trends\n🍪 Perfect Chocolate Chip Recipe\nEvolution of Music Streaming\nRemote Work Productivity Tips\nArtificial Intelligence in Healthcare\n🎮 Video Game Development Insights`;

export async function generateChatTitle(messages: ChatMessage[]): Promise<string> {
    const messagesFormatted = await Promise.all(
        messages.map(async (message) => {
            if (message.type === 'tool') {
                return {
                    role: 'tool',
                    content: '<Tool Response>',
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

    messagesFormatted.unshift({
        role: 'system',
        content: 'You are a helpful assistant that generates concise titles for chat histories. Use the following chat to generate a title based on the chat history in the chat\'s language.' + chatTitleExamples,
    })

    try {
        const response = await ollamaWrapper.chat({
            model: useConfigStore().selectedModel,
            messages: messagesFormatted,
            think: false,
            stream: false,
            format: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string'
                    }
                },
                required: ['title']
            },
        });

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