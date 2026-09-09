<script setup lang="ts">
import { useProviderManager } from '@/composables/useProviderManager';
import useDownloadsStore from '@/stores/useDownloadsStore';
import { BiCheck, BiCloud, BiData, BiDownload } from 'vue-icons-plus/bi';
import { computed } from 'vue';

const { currentProvider } = useProviderManager();
const downloadStore = useDownloadsStore();

const installedCount = computed<string | undefined>(() => {
    const installedCount = currentProvider.value.getAllModelIds().length;
    return installedCount === 0 ? undefined : String(installedCount);
});

const downloadCount = computed<string | undefined>(() => {
    const downloads = Object.keys(downloadStore.progressChunks).length;
    return downloads === 0 ? undefined : String(downloads);
});

const canDownloadModels = computed(() => currentProvider.value.features.modelDownload !== undefined);
</script>

<template>
    <div class="flex flex-col p-2 gap-px w-full">
        <SidebarStateBackHeader />

        <SidebarMenuLink
            :text="canDownloadModels ? 'Installed' : 'Available'"
            :icon="canDownloadModels ? BiData : BiCheck"
            :to="{ path: '/models/installed' }"
            :badge="installedCount" />

        <template v-if="canDownloadModels">
            <SidebarMenuLink
                text="Browse"
                :icon="BiCloud"
                :to="{ path: '/models/browse' }" />

            <SidebarMenuLink
                text="Downloads"
                :icon="BiDownload"
                :to="{ path: '/models/downloads' }"
                :badge="downloadCount" />
        </template>
    </div>
</template>
