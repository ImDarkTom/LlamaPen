<script setup lang="ts">
import { BiPencil, BiSolidWrench, BiWrench } from 'vue-icons-plus/bi';
import useToolsStore from '@/stores/useToolsStore';
import { computed, ref } from 'vue';
import { useConfigStore } from '@/stores/useConfigStore';
import { useProviderManager } from '@/composables/useProviderManager';

const toolsStore = useToolsStore();
const config = useConfigStore();
const { getSelectedModel, currentProvider } = useProviderManager();

const searchQuery = ref<string>('');

const selectedModelCanCallTools = computed(() => {
    return getSelectedModel().getCapabilities().includes('tools') || getSelectedModel().getCapabilities().includes('unavailable');
});

function toggleSelection(item: string) {
    const index = toolsStore.toggled.indexOf(item);
    if (index === -1) {
        toolsStore.toggled.push(item);
    } else {
        toolsStore.toggled.splice(index, 1);
    }
}

const searchedTools = computed(() => {
    return Object.entries(toolsStore.tools).filter(item => item[0].includes(searchQuery.value));
});

function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
        if (searchedTools.value.length === 1) {
            const searchedTool = searchedTools.value[0];
            if (!searchedTool) return;

            const searchedToolName = searchedTool[0];
            toggleSelection(searchedToolName);
        }
    }
}

const isOpened = ref(false);
</script>

<template>
    <FloatingMenu
        v-model:is-opened="isOpened"
        preffered-position="top"
        :class="{ 
            'opacity-50': currentProvider.isLoading(),
            'hidden': (config.ui.messageInput.hideUnusedButtons && !selectedModelCanCallTools) && !currentProvider.isLoading()
        }"
        title="Toggle available tools">
        <template #button>
            <span>
                <component
                    :is="toolsStore.toggled.length > 0 ? BiSolidWrench : BiWrench"
                    class="p-1 inline" />
                <span class="align-middle tabular-nums">Tools {{ toolsStore.toggled.length ? `(${toolsStore.toggled.length})` : '' }}</span>
            </span>
        </template>
        <template #menu>
            <div class="flex flex-col">
                <div class="flex flex-row gap-2 mb-2">
                    <input
                        class="border-2 border-primary focus:border-base-400 w-full rounded-md box-content p-2 outline-0" 
                        type="text" 
                        placeholder="Search tools..."
                        v-model="searchQuery"
                        @keydown="onKeyDown">
                    <ButtonPrimary
                        type="link"
                        to="/tools"
                        class="p-2"
                        text="Manage"/>
                </div>
                <div 
                    v-for="[toolName, tool] in searchedTools" 
                    :key="toolName"
                    class="hover:bg-base-600 rounded-md">
                    <label class="cursor-pointer">
                        <div class="flex flex-row gap-3 items-center ml-3 select-none p-1">
                            <input
                                class="size-5 shrink-0 accent-primary hover:accent-primary-hover active:accent-primary-active"
                                type="checkbox" 
                                :checked="toolsStore.toggled.includes(toolName)" 
                                @change="toggleSelection(toolName)">
                            <div class="flex flex-col">
                                <span class="text-base-100 text-sm font-medium">{{ toolName }}</span>
                                <span class="text-xs text-base-300">{{ tool.description || '\<blank description\>' }}</span>
                            </div>
                            <ButtonPrimary
                                type="link"
                                color="ghost"
                                class="ml-auto p-2"
                                text="Edit"
                                :hide-text="true"
                                :to="`/tools/${toolName}`"
                                :icon="BiPencil" />
                        </div>
                    </label>
                </div>
            </div>
        </template>
    </FloatingMenu>
</template>
