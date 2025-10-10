<script setup lang="ts">
import { BiDotsHorizontalRounded, BiWrench } from 'vue-icons-plus/bi';
import useToolsStore from '@/stores/toolsStore';
import { computed, ref } from 'vue';
import { useModelList } from '@/composables/useModelList';
import { useConfigStore } from '@/stores/config';
import FloatingMenu from '@/components/FloatingMenu/FloatingMenu.vue';

const toolsStore = useToolsStore();
const config = useConfigStore();
const { loading, selectedModelCapabilities } = useModelList();

const searchQuery = ref<string>('');

const selectedModelCanCallTools = computed(() => selectedModelCapabilities.value.includes('tools'));

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
            toggleSelection(searchedTools.value[0][0]);
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
            'opacity-50': loading,
            'hidden': (config.ui.messageInput.hideUnusedButtons && !selectedModelCanCallTools) && !loading
        }"
        title="Toggle available tools">
        <template #button>
            <span>
                <BiWrench class="p-1 inline" />
                <span class="align-middle">Tools ({{ toolsStore.toggled.length }})</span>
            </span>
        </template>
        <template #menu>
            <div class="flex flex-col">
                <div class="flex flex-row gap-2 mb-2">
                    <input
                        class="border-2 border-primary focus:border-border w-full rounded-lg h-6 box-content p-3 outline-0" 
                        type="text" 
                        placeholder="Search tools..."
                        v-model="searchQuery"
                        @keydown="onKeyDown">
                    <RouterLink
                        to="/tools"
                        class="p-3 btn-primary!">
                        <span class="align-middle">
                            Manage
                        </span>
                    </RouterLink>
                </div>
                <div 
                    v-for="[toolName, tool] in searchedTools" 
                    :key="toolName"
                    class="hover:bg-surface-light transition-quick rounded-md">
                    <label class="cursor-pointer">
                        <div class="flex flex-row items-center ml-3 select-none ">
                            <input
                                class="size-5 accent-primary hover:accent-secondary transition-quick"
                                type="checkbox" 
                                :checked="toolsStore.toggled.includes(toolName)" 
                                @change="toggleSelection(toolName)">
                            <div class="flex flex-col ml-3">
                                <span class="text-text font-medium">{{ toolName }}</span>
                                <span>{{ tool.description || '<blank description>' }}</span>
                            </div>
                            <RouterLink :to="`/tools/${toolName}`" class="ml-auto">
                                <div class="ring-border hover:ring-primary ring-1 p-2 rounded-md transition-quick ">
                                    <BiDotsHorizontalRounded />
                                </div>
                            </RouterLink>
                        </div>
                    </label>
                </div>
            </div>
        </template>
    </FloatingMenu>
</template>