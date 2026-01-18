import db from "@/lib/db";
import logger from "@/lib/logger";
import { useConfigStore } from "@/stores/config";
import { authedFetch } from "@/utils/core/authedFetch";
import { tryCatch } from "@/utils/core/tryCatch";

const chatTitleExamples = `\nExamples of titles:\n📉 Stock Market Trends\n🍪 Perfect Chocolate Chip Recipe\nEvolution of Music Streaming\nRemote Work Productivity Tips\nArtificial Intelligence in Healthcare\n🎮 Video Game Development Insights`;

export async function generateChatTitle(messages: ChatMessage[]): Promise<string> {
    if (useConfigStore().developer.mockRequests) {
        return 'Mock Chat Title';
    }

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

    const response = await authedFetch(useConfigStore().requestUrl('/api/chat'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: useConfigStore().selectedModel,
            messages: messagesFormatted,
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
            llamapen: {
                intent: 'chat-title-generation'
            }
        })
    });

    const data = await response.json();

    const { data: generatedTitle, error } = await tryCatch<string>(JSON.parse(data.message.content).title);
    if (error) {
        logger.warn('OllamaProvider:helpers:generateChatTitle', 'Error generating chat title:', error);
        return 'New Chat';
    }

    logger.info('OllamaProvider:helpers:generateChatTitle', 'Generated chat title:', generatedTitle);
    return generatedTitle;
}