export function appMessageToOllama(message: ChatMessage): OllamaMessage {
    const role: OllamaMessageRole = (() => {
        switch (message.type) {
            case 'user':
                return 'user';
            case 'model':
                return 'assistant';
            case 'tool':
                return 'tool';
            default:
                return 'user';
        }
    })();

    const baseMessage: OllamaMessage = {
        content: message.content,
        role,
    };

    return baseMessage;
}