<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import ToolsList from './ToolsList.vue';
import ToolEdit from './ToolEdit.vue';

const config = useConfigStore();
</script>

<template>
    <div class="w-full h-full flex flex-col md:flex-row gap-2 p-2 box-border overflow-y-auto"
        :class="{ 'pt-14 md:pt-2 md:pl-14': !config.showSidebar }">
        <ToolsList />

        <div class="p-2 bg-background-light w-full rounded-lg">
            <ToolEdit v-if="$route.params.tool" :tool="($route.params.tool as string)" />
            <div v-else class="w-full h-full flex items-center justify-center">
                Edit an existing tool or create a new one
            </div>
        </div>
    </div>
</template>