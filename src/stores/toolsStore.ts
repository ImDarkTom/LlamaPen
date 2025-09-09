import logger from '@/lib/logger';
import { defineStore } from 'pinia';
import { ref } from 'vue';

const useToolsStore = defineStore('tools', () => {
    const tools = ref<AppTools>({
        'web_search': {
            description: 'Search the internet for a query',
            params: {
                'query': {
                    type: 'string',
                    description: 'The query to search for.'
                },
                'categories': {
                    type: 'string',
                    description: 'The search category.',
                    enum: ['general', 'news']
                },
                'time_range': {
                    type: 'string',
                    description: 'Limit results to a timeframe. Leave blank for no limit.',
                    enum: ['day', 'month', 'year']
                },
            },
            required: ['query'],
            url: 'http://localhost:8080/search?q={{query}}&categories={{categories}}&language=all&time_range={{time_range}}&safesearch=0&format=json',
        }
    });

    async function handleToolCalls(toolCalls: ModelChatMessage['toolCalls']): Promise<{toolName: string, content: string}[] | null> {
        if (!toolCalls || toolCalls.length === 0) return null;
        logger.info('Tools Store', 'Processing tool calls', toolCalls);

        const responses: { toolName: string, content: string }[] = [];
        
        const promises = toolCalls.map(async (tool) => {
            const toCall = tools.value[tool.function.name];
            if (!toCall) throw new Error(`Tool not found when calling '${tool.function.name}'`);

            // Replace each item in the url with the arg
            const completedUrl = toCall.url.replace(/{{(.*?)}}/g, (_, key) => {
                return encodeURIComponent(tool.function.arguments[key] ?? '')
            });

            const response = await fetch(completedUrl, {
                credentials: 'omit',
                referrer: 'no-referrer'
            });

            let content = await response.text();

            try {
                const parsed = JSON.parse(content);

                content = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
            } catch { }

            responses.push({toolName: tool.function.name, content });
        });

        await Promise.all(promises);

        return responses;
    }

    const toggled = ref<string[]>([]);

    return {
        tools,
        toggled,
        handleToolCalls
    };

},
    {
        persist: {
            storage: localStorage
        }
    });

export default useToolsStore;