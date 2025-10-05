<script setup lang="ts">
import TextDivider from '@/components/TextDivider/TextDivider.vue';
import router from '@/lib/router';
import useToolsStore from '@/stores/toolsStore';
import { BiPlus } from 'vue-icons-plus/bi';
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
        userConfirmation: false,
        params: [],
        required: [],
        url: '',
        requestOptions: {
            method: 'GET',
            accept: '*/*',
            contentType: 'application/json',
            userAgent: 'LlamaPen/1.0 (user tool call)',
        }
    }

    router.push(`/tools/${newToolName}`);
}
</script>

<template>
    <div class="h-4/12 md:h-full w-full md:w-1/3 bg-background-light rounded-lg flex flex-col gap-2 p-2 relative overflow-y-auto">
        <div class="flex flex-col gap-2 justify-between">
            <button class="bg-surface p-2 rounded-md text-primary hover:text-text cursor-pointer grow shrink" @click="newTool">
                <BiPlus class="inline mr-1" />
                <span class="align-middle">New Tool</span>
            </button>
        </div>
        <TextDivider text="Added Tools" />
        <RouterLink 
            v-for="toolName in Object.keys(toolsStore.tools)"
            :to="`/tools/${toolName}`"
            class="rounded-md hover:bg-surface! text-text transition-quick"
            exactActiveClass="bg-surface-light!">
            <div
                class="p-2 pointer-coarse:py-4">
                <span>{{ toolName }}</span>
            </div>
        </RouterLink>
    </div>
</template>