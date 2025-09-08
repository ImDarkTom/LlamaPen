<script setup lang="ts">
import Dropdown from '@/components/Dropdown/Dropdown.vue';
import { BiWrench } from 'vue-icons-plus/bi';
import useToolsStore from '@/stores/toolsStore';

const toolsStore = useToolsStore();

function toggleSelection(item: string) {
    const index = toolsStore.toggled.indexOf(item);
    if (index === -1) {
        toolsStore.toggled.push(item);
    } else {
        toolsStore.toggled.splice(index, 1);
    }
}
</script>

<template>
    <Dropdown direction="up" title="Configure generation parameters">
        <template #button>
            <span>
                <BiWrench class="p-1 inline" />
                <span class="align-middle">Tools ({{ toolsStore.toggled.length }})</span>
            </span>
        </template>
        <template #menu>
            <div class="flex flex-col">
                <div v-for="[toolName, tool] in Object.entries(toolsStore.tools)" :key="toolName">
                    <label>
                        <div class="flex flex-row items-center ml-3 select-none ">
                            <input
                                class="size-5"
                                type="checkbox" 
                                :checked="toolsStore.toggled.includes(toolName)" 
                                @change="toggleSelection(toolName)">
                            <div class="flex flex-col ml-3">
                                <span class="text-text font-medium">{{ toolName }}</span>
                                <span>{{ tool.description }}</span>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </template>
    </Dropdown>
</template>