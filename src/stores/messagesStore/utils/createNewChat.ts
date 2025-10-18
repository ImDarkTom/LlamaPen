import logger from "@/lib/logger";
import useChatsStore from "@/stores/chatsStore";
import { useConfigStore } from "@/stores/config";

export async function createNewChat(
    firstMessageContent: string,
) {
    const chatsStore = useChatsStore();
    const titleGenerationStyle = useConfigStore().chat.titleGenerationStyle;
    let shouldGenerateTitle = false;

    const newChatId = await chatsStore.createNewChat();

    if (titleGenerationStyle === 'generate') {
        shouldGenerateTitle = true;
    } else if (titleGenerationStyle === 'firstMessage') {
        const firstMessageTitle = firstMessageContent.length > 50 ?
            firstMessageContent.slice(0, 47) + '...' :
            firstMessageContent;

        chatsStore.renameChat(newChatId, firstMessageTitle);
    } else if (titleGenerationStyle === 'chatId') {
        chatsStore.renameChat(newChatId, `Chat #${newChatId}`);
    } else if (titleGenerationStyle === 'dynamic') {
        const questionRegex = /^(who|what|when|where|why|how|which|whose|is|are|do|does|did|can|could|would|should|will)\b.*\?$/i;

        if (questionRegex.test(firstMessageContent.trim())) {
            const firstMessageTitle = firstMessageContent.length > 50 ? 
                firstMessageContent.slice(0, 47) + '...' :
                firstMessageContent;

            chatsStore.renameChat(newChatId, firstMessageTitle);
        } else {
            shouldGenerateTitle = true;
        }
    }

    logger.info('Messages Store', 'No opened chat, created new with ID', newChatId);
    return { newChatId, shouldGenTitle: shouldGenerateTitle };
}