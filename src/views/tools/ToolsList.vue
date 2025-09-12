<script setup lang="ts">
import useToolsStore from '@/stores/toolsStore';
import { BiLeftArrowAlt, BiPlus } from 'vue-icons-plus/bi';
import { RouterLink } from 'vue-router';

const toolsStore = useToolsStore();

</script>

<template>
    <div class="w-1/3 bg-background-light p-2 rounded-lg">
        <div class="flex flex-row justify-between mb-2">
            <RouterLink to="/settings" class="bg-surface! p-2 rounded-md text-primary! hover:text-text!">
                <BiLeftArrowAlt class="inline mr-1" />
                <span class="align-middle">Back to settings</span>
            </RouterLink>
            <RouterLink to="/new-tool" class="bg-surface! p-2 rounded-md text-primary! hover:text-text!">
                <BiPlus class="inline mr-1" />
                <span class="align-middle">New Tool</span>
            </RouterLink>
        </div>
        <RouterLink v-for="toolName in Object.keys(toolsStore.tools)" :to="`/tools/${toolName}`">
            <div
                class="flex flex-col text-text px-2 py-4 hover:bg-surface transition-colors duration-dynamic hover:duration-0 rounded-md">
                <span>{{ toolName }}</span>
            </div>
        </RouterLink>
    </div>
</template>