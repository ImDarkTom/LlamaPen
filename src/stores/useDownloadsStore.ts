import { useProviderManager } from '@/composables/useProviderManager';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

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
    const progressChunks = computed(() => {
        return useProviderManager().currentProvider.value.features.modelDownload?.progress.value ?? {};
    });

    async function downloadModel(modelId: string): Promise<{ success: boolean, reason?: string }> {
        const feature = useProviderManager().currentProvider.value.features.modelDownload;

        if (!feature) {
            return { success: false, reason: 'Current provider does not support model downloading.' };
        }

        return feature.download(modelId);
    }

    function cancelDownload(modelId: string) {
        useProviderManager().currentProvider.value.features.modelDownload?.cancel(modelId);
    }

    return {
        inputValue,
        progressChunks,
        downloadModel,
        cancelDownload,
    };
});

export default useDownloadsStore;
