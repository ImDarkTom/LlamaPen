<script setup lang="ts">
import ActionMenu, { type MenuEntry } from '@/components/FloatingMenu/ActionMenu.vue';
import TextDivider from '@/components/TextDivider/TextDivider.vue';
import router from '@/lib/router';
import useToolsStore from '@/stores/toolsStore';
import { BiCheckCircle, BiDotsVerticalRounded, BiMinusCircle, BiPencil, BiPlus, BiRefresh, BiTrash } from 'vue-icons-plus/bi';
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

const toolsActions: MenuEntry[] = [
    {
        text: 'Reset to default',
        onClick: resetToDefault,
        icon: BiRefresh,
        category: 'danger'
    }
];

function resetToDefault() {
    if (!confirm("Are you sure you want to delete all custom tools (page will refresh)?")) return;

    localStorage.removeItem('tools');
    toolsStore.toggled = [];
}

const itemActions: MenuEntry[] = [
    {
        text: 'Toggle tool',
        onClick: toggleTool,
        icon: BiRefresh,
    },
    {
        text: 'Rename',
        onClick: renameItem,
        icon: BiPencil
    },
    {
        text: 'Delete',
        onClick: deleteItem,
        icon: BiTrash,
        category: 'danger'
    }
];

function toggleTool(toolName: string) {
    if (toolsStore.toggled.includes(toolName)) {
        toolsStore.toggled = toolsStore.toggled.filter(tool => tool !== toolName);
    } else {
        toolsStore.toggled.push(toolName);
    }
}

function deleteItem(toolName: string) {
    if (!confirm(`Are you sure you want to delete the '${toolName}' tool?`)) return;

    delete toolsStore.tools[toolName];
    router.push('/tools');
}

function renameItem(toolName: string) {
    let newToolName = prompt('Rename tool to (lowercase & no spaces): ', toolName);
    if (!newToolName) return;
    
    newToolName = newToolName
        .toLowerCase()
        .replace(/ /g, '_');

    toolsStore.tools[newToolName] = toolsStore.tools[toolName];
    delete toolsStore.tools[toolName];

    router.push(`/tool/${newToolName}`);
}

</script>

<template>
    <div class="h-4/12 md:h-full w-full md:w-1/3 bg-background-light rounded-lg flex flex-col gap-2 p-2 relative overflow-y-auto md:border-r-1 border-border md:rounded-r-none">
        <div class="flex flex-row gap-2 justify-between *:text-primary *:hover:text-text">
            <button class="bg-surface p-2 rounded-md cursor-pointer grow shrink" @click="newTool">
                <BiPlus class="inline mr-1" />
                <span class="align-middle">New Tool</span>
            </button>
            <ActionMenu :actions="toolsActions" anchored="left">
                <button class="btn-ghost">
                    <BiDotsVerticalRounded />
                </button>
            </ActionMenu>
        </div>
        <TextDivider text="Added Tools" />
        <RouterLink 
            v-for="toolName in Object.keys(toolsStore.tools)"
            :to="`/tools/${toolName}`"
            exactActiveClass="*:bg-surface *:ring-1 [&_span]:text-text">
            <div
                class="flex flex-row justify-between items-center hover:bg-surface ring-highlight ring-inset p-1.5 pl-2 pointer-coarse:py-4 rounded-md transition-colors duration-dynamic"
                :class="{ 'opacity-75': !toolsStore.toggled.includes(toolName) }">
                <div class="flex flex-row gap-2">
                    <BiCheckCircle v-if="toolsStore.toggled.includes(toolName)" />
                    <BiMinusCircle v-else />
                    <span>{{ toolName }}</span>
                </div>
                <ActionMenu :passArgs="toolName" :actions="itemActions" anchored="left">
                    <button @click.prevent class="hover:bg-surface-light group-[.active]:bg-surface-light group-[.active]:text-text p-1.5 rounded-sm cursor-pointer">
                        <BiDotsVerticalRounded />
                    </button>
                </ActionMenu>
            </div>
        </RouterLink>
    </div>
</template>