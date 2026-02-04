<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
    <div class="w-full h-full flex flex-col md:flex-row gap-2 md:gap-0 box-border overflow-y-auto">
        <ToolsPageList />

        <UIViewerContainer>
            <ToolsPageEditor v-if="$route.params.tool" :tool="(route.params.tool as string)" />
            <div v-else class="w-full h-full flex items-center justify-center">
                Create a new tool or select an existing one to edit.
            </div>
        </UIViewerContainer>
    </div>
</template>