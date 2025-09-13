<script setup lang="ts">
import router from '@/lib/router';
import useToolsStore from '@/stores/toolsStore';
import { BiLeftArrowAlt, BiPlus } from 'vue-icons-plus/bi';
import { RouterLink } from 'vue-router';

const toolsStore = useToolsStore();

function newTool() {
    let newToolName = prompt('Enter new tool name: (lowercase & no spaces): ');
    if (!newToolName) return;
    
    newToolName = newToolName
        .toLowerCase()
        .replace(/ /g, '_');

    toolsStore.tools[newToolName] = {
        description: '',
        params: [],
        required: [],
        url: ''
    }

    router.push(`/tools/${newToolName}`);
}
</script>

<template>
    <div class="w-1/3 bg-background-light p-2 rounded-lg">
        <div class="flex flex-row justify-between mb-2">
            <RouterLink to="/settings" class="bg-surface! p-2 rounded-md text-primary! hover:text-text!">
                <BiLeftArrowAlt class="inline mr-1" />
                <span class="align-middle">Back to settings</span>
            </RouterLink>
            <button class="bg-surface p-2 rounded-md text-primary hover:text-text cursor-pointer" @click="newTool">
                <BiPlus class="inline mr-1" />
                <span class="align-middle">New Tool</span>
            </button>
        </div>
        <RouterLink v-for="toolName in Object.keys(toolsStore.tools)" :to="`/tools/${toolName}`">
            <div
                class="flex flex-col text-text px-2 py-4 hover:bg-surface transition-colors duration-dynamic hover:duration-0 rounded-md">
                <span>{{ toolName }}</span>
            </div>
        </RouterLink>
    </div>
</template>