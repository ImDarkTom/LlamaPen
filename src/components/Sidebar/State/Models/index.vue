<script setup lang="ts">
import { BiData, BiDownload } from 'vue-icons-plus/bi';

</script>

<template>
    <div class="flex flex-col px-2">
        <SidebarStateBackHeader />
        <SidebarMenuLink
            text="Installed"
            :icon="BiData"
            :to="{ path: '/models/installed' }"/>

        <SidebarMenuLink
            text="Downloads"
            :icon="BiDownload"
            :to="{ path: '/models/downloads' }" />
    </div>
</template>