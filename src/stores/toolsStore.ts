import { defineStore } from 'pinia';
import { ref } from 'vue';

// type RefReturn<T> = ReturnType<typeof ref<T>>;

const useToolsStore = defineStore('tools', () => {
    const tools = ref<AppTools>({
        'web_search': {
            description: 'Search the internet for a query',
            params: {
                'query': {
                    type: 'string',
                    description: 'The query to search for.'
                }
            },
            required: ['query']
        }
    });

    const toggled = ref<string[]>([]);

    return {
        tools,
        toggled
    };

},
    {
        persist: {
            storage: localStorage
        }
    });

export default useToolsStore;