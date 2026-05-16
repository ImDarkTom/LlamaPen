<script setup lang="ts">
import { useProviderManager } from '@/composables/useProviderManager';
import useDownloadsStore from '@/stores/useDownloadsStore';
import { BiCloud, BiData, BiDownload } from 'vue-icons-plus/bi';

const providerStore = useProviderManager();
const downloadStore = useDownloadsStore();

const installedCount = computed<string | undefined>(() => {
    const installedCount = providerStore.allModelIds.value.length;
    return installedCount === 0 ? undefined : String(installedCount);
});

const downloadCount = computed<string | undefined>(() => {
    const downloads = Object.keys(downloadStore.progressChunks).length;
    return downloads === 0 ? undefined : String(downloads);
});
</script>

<template>
    <div class="flex flex-col p-2 gap-px w-full">
        <SidebarStateBackHeader />

        <SidebarMenuLink
            text="Installed"
            :icon="BiData"
            :to="{ path: '/models/installed' }"
            :badge="installedCount"/>

        <template v-if="providerStore.currentProviderId.value === 'ollama'">
            <SidebarMenuLink
                text="Browse"
                :icon="BiCloud"
                :to="{ path: '/models/browse' }"/>
            
            <SidebarMenuLink
                text="Downloads"
                :icon="BiDownload"
                :to="{ path: '/models/downloads' }"
                :badge="downloadCount" />
        </template>
    </div>
</template>