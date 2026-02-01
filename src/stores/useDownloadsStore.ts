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
    const abortControllerMap: Map<string, AbortController> = new Map();
    const progressChunks = ref<Record<string, ProgressResponse>>({});
    
    async function downloadModel(modelId: string): Promise<{ success: boolean, reason?: string }> {
        const abortController = new AbortController();

        const { data: stream, error } = await ollamaWrapper.pull({ model: modelId, stream: true }, abortController);
        if (error) return { success: false, reason: 'Failed to download model.' }; // We already log the error

        abortControllerMap.set(modelId, abortController);

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
                return { success: false, reason: `Cancelled downloading '${modelId}'.` };
            }

            return { success: false, reason: `Error while downloading: ${e}` };
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
        progressChunks,
        downloadModel,
        cancelDownload,
    };
});

export default useDownloadsStore;