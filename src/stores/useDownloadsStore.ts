import logger from '@/lib/logger';
import ollamaRequest from '@/utils/ollamaRequest';
import { streamChunks } from '@/utils/streamChunks';
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
    const progressChunks = ref<Record<string, OllamaPullResponseChunk>>({});
    
    async function downloadModel(modelId: string): Promise<{ success: boolean, reason?: string }> {
        const abortController = new AbortController();

        const { data, error } = await ollamaRequest('/api/pull', 'POST', {
            model: modelId
        }, { signal: abortController.signal });

        if (error) {
            throw new Error(`Failed to download model: ${error}`);
        }

        abortControllerMap.set(modelId, abortController);

        for await (const { error, chunk } of streamChunks<OllamaPullResponseChunk>(data)) {
            if (error) {
                if (error.message === 'userRequestCancel') {
                    delete progressChunks.value[modelId];
                    return { success: false, reason: `Cancelled downloading '${modelId}'.` };
                }
                
                return { success: false, reason: `Internal error while downloading: ${error.message}` };
            }

            progressChunks.value[modelId] = chunk;

            if (chunk.error) {
                delete progressChunks.value[modelId];
                return { success: false, reason: `Ollama error while downloading: ${chunk.error}` };
            }

            if (chunk.status === 'success') {
                logger.info('Download Manager', `Model ${modelId} downloaded successfully.`);
                delete progressChunks.value[modelId];
                return { success: true }
            }
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