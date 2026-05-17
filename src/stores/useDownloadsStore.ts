import logger from '@/lib/logger';
import { ollamaWrapper } from '@/providers/ollama/OllamaWrapper';
import type { ProgressResponse } from 'ollama';
import { defineStore } from 'pinia';
import { ref } from 'vue';

// example chunk:
// {
//     'deepseek granite-embedding:30m': {
//         status: "pulling 27d24c87a53d",
//         digest: "sha256:27d24c87a53d110b95abecbff83f966206857a9dc0ba1efd336d08dbd0afc833",
//         total: 62523136,
//         completed: 9641984
//     }
// }

const useDownloadsStore = defineStore('downloads', () => {
    const inputValue = ref('');

    const abortControllerMap: Map<string, AbortController> = new Map();
    const progressChunks = ref<Record<string, ProgressResponse>>({});
    
    async function downloadModel(modelId: string): Promise<{ success: boolean, reason?: string }> {
        if (progressChunks.value[modelId]) return { success: false, reason: `Already downloading '${modelId}'` };

        const abortController = new AbortController();
        abortControllerMap.set(modelId, abortController);
        
        const { data: stream, error } = await ollamaWrapper.pull({ model: modelId, stream: true }, abortController);
        
        if (error) {
            abortControllerMap.delete(modelId);
            return { success: false, reason: 'Failed to download model.' }; // We already log the error
        }

        try {
            for await (const progress of stream) {
                progressChunks.value[modelId] = progress;

                if (progress.status === 'success') {
                    logger.info('Download Manager', `Model ${modelId} downloaded successfully.`);
                    delete progressChunks.value[modelId];
                    return { success: true }
                }
            }
        } catch (e) {
            delete progressChunks.value[modelId];
            if (e === 'userRequestCancel') {
                return { success: false };
            }

            return { success: false, reason: `Error while downloading: ${e instanceof Error ? e.message : String(e)}` };
        } finally {
            abortControllerMap.delete(modelId);
        }
        
        return { success: false, reason: 'Unknown error occurred during download.' };
    }

    function cancelDownload(model: string) {
        if (!progressChunks.value[model]) return;

        const abortController = abortControllerMap.get(model);
        abortController?.abort('userRequestCancel');
    }

    return {
        inputValue,
        progressChunks,
        downloadModel,
        cancelDownload,
    };
});

export default useDownloadsStore;