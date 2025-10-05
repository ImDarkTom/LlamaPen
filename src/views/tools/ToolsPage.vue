<script setup lang="ts">
import ToolsList from './ToolsList.vue';
import ToolEdit from './ToolEdit.vue';
import ViewerContainer from '../models/components/ViewerContainer.vue';
</script>

<template>
    <div class="w-full h-full flex flex-col md:flex-row gap-2 box-border overflow-y-auto">
        <ToolsList />

        <ViewerContainer>
            <ToolEdit v-if="$route.params.tool" :tool="($route.params.tool as string)" />
            <div v-else class="w-full h-full flex items-center justify-center">
                Edit an existing tool or create a new one
            </div>
        </ViewerContainer>
    </div>
</template>