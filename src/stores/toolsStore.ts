import logger from '@/lib/logger';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import Mustache from 'mustache';
import { tryCatch } from '@/utils/core/tryCatch';

const webSearchResponseFormatting = `
{
  "query": "{{query}}",
  "results": [
    {{#results}}
    {
      "title": "{{title}}",
      "content": "{{content}}",
      "publishedDate": "{{publishedDate}}"
    }{{^last}},{{/last}}
    {{/results}}
  ]
}
`;

const useToolsStore = defineStore('tools', () => {
    const tools = ref<AppTools>({
        'web_search': {
            description: 'Search the internet for a query',
            userConfirmation: false,
            userHint: 'Web search is intended to be used with a SearXNG instance. For a guide, see: https://github.com/ImDarkTom/LlamaPen-Search',
            requestOptions: {
                method: 'GET',
                accept: 'application/json',
                contentType: 'application/json',
                userAgent: 'LlamaPen/1.0 (user tool call)',
            },
            params: [
                {
                    name: 'query',
                    type: 'string',
                    description: 'The query to search for.'
                },
                {
                    name: 'categories',
                    type: 'string',
                    description: 'The search category.',
                    enum: ['general', 'news']
                },
                {
                    name: 'time_range',
                    type: 'string',
                    description: 'Limit results to a timeframe. Leave blank for no limit.',
                    enum: ['day', 'month', 'year']
                },
            ],
            required: ['query'],
            url: 'http://localhost:8080/search?q={{query}}&categories={{categories}}&language=all&time_range={{time_range}}&safesearch=0&format=json',
            responseFormatting: webSearchResponseFormatting
        }
    });

    async function runToolCall(tool: NonNullable<ModelChatMessage['toolCalls']>[number], toCall: AppTools[string]): Promise<string> {
        if (
            toCall.userConfirmation &&
            !confirm(`AI wants to use the '${tool.function.name}'. OK to allow. Cancel to deny.`)
        ) {
            return 'User denied tool call request.';
        }

        // Replace each item in the url with the arg
        const completedUrl = toCall.url.replace(/{{(.*?)}}/g, (_, key) => {
            const argValue = tool.function.arguments[key];
            return encodeURIComponent(argValue ?? '')
        });

        let completedBody: string | null = null;
        if (toCall.requestOptions.body) {
            completedBody = toCall.requestOptions.body.replace(/{{(.*?)}}/g, (_, key) => {
                return encodeURIComponent(tool.function.arguments[key] ?? '');
            });
        }

        const reqOptions = toCall.requestOptions;

        const fetchOptions: RequestInit = {
            method: reqOptions.method,
            credentials: 'omit',
            referrer: 'no-referrer',
            headers: {
                'Accept': reqOptions.accept,
                'User-Agent': reqOptions.userAgent,
                'Content-Type': reqOptions.contentType,
                ...(reqOptions.authorization && { 'Authorization': reqOptions.authorization }),
            },
            ...(reqOptions.body && { body: completedBody }),
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        let response: Response;
        try {
            response = await fetch(completedUrl, { ...fetchOptions, signal: controller.signal });
            clearTimeout(timeout);

            if (!response.ok) {
                return `HTTP error ${response.status}: ${response.statusText || 'Unknown Error'}`;
            }
        } catch (error: any) {
            if ('name' in error && error.name === 'AbortError') {
                return 'Tool request timeout.';
            }

            return `Network error: ${error.message || 'Unknown error occured'}`
        } finally {
            clearTimeout(timeout);
        }

        let content = await response.text();
        let formatted = '';

        if (toCall.responseFormatting && toCall.responseFormatting.trim() !== '') {
            const { data: responseAsJson, error } = await tryCatch(JSON.parse(content));
            if (error) {
                formatted = content;
                throw new Error('Failed to parse response as JSON for formatting.');
            }

            formatted = Mustache.render(toCall.responseFormatting, responseAsJson);
        } else {
            formatted = content;
        }

        return formatted;
    }

    /**
     * 
     * @param toolCalls The tool calls to run
     * @returns The tool called along with the response.
     */
    async function handleToolCalls(toolCalls: ModelChatMessage['toolCalls']): Promise<{toolName: string, content: string}[] | null> {
        if (!toolCalls || toolCalls.length === 0) return null;
        logger.info('Tools Store', 'Processing tool calls', toolCalls);

        const responses: { toolName: string, content: string }[] = [];
        
        const promises = toolCalls.map(async (tool) => {
            const toCall = tools.value[tool.function.name];
            if (!toCall) throw new Error(`Tool not found when calling '${tool.function.name}'`);

            const response = await runToolCall(tool, toCall);

            responses.push({toolName: tool.function.name, content: response });
        });

        await Promise.all(promises);

        return responses;
    }

    const toggled = ref<string[]>([]);

    return {
        tools,
        toggled,
        handleToolCalls,
        runToolCall
    };

},
    {
        persist: {
            storage: localStorage
        }
    });

export default useToolsStore;