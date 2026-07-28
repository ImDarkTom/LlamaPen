<script setup lang="ts">
import router from '@/lib/router';
import useToolsStore from '@/stores/useToolsStore';
import {
    BiCheckCircle,
    BiDotsVerticalRounded,
    BiMinusCircle,
    BiPencil,
    BiPlus,
    BiRefresh,
    BiTrash,
} from 'vue-icons-plus/bi';
import { RouterLink } from 'vue-router';

const toolsStore = useToolsStore();

function newTool() {
    let newToolName = prompt('Enter new tool name: (lowercase & no spaces): ');
    if (!newToolName) return;

    newToolName = newToolName.toLowerCase().replace(/ /g, '_');

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
        },
    };

    router.push(`/tools/${newToolName}`);
}

const toolsActions: MenuEntry[] = [
    {
        type: 'text',
        text: () => (toolsStore.toggled.length > 0 ? 'Disable all' : 'Enable all'),
        onClick: toggleAll,
        icon: BiRefresh,
        category: 'general',
    },
    {
        type: 'divider',
    },
    {
        type: 'text',
        text: 'Reset to default',
        onClick: resetToDefault,
        icon: BiTrash,
        category: 'danger',
    },
];

function toggleAll() {
    if (toolsStore.toggled.length > 0) {
        toolsStore.toggled = [];
    } else {
        toolsStore.toggled = Object.entries(toolsStore.tools).map(([name, _tool]) => name);
    }
}

function resetToDefault() {
    if (!confirm('Are you sure you want to delete all custom tools (page will refresh)?')) return;
    toolsStore.resetToDefault();
    location.reload();
}

const itemActions: MenuEntry<string>[] = [
    {
        type: 'text',
        text: 'Toggle tool',
        onClick: toggleTool,
        icon: BiRefresh,
    },
    {
        type: 'text',
        text: 'Rename',
        onClick: renameItem,
        icon: BiPencil,
    },
    {
        type: 'text',
        text: 'Delete',
        onClick: deleteItem,
        icon: BiTrash,
        category: 'danger',
    },
];

function toggleTool(toolName: string) {
    if (toolsStore.toggled.includes(toolName)) {
        toolsStore.toggled = toolsStore.toggled.filter((tool) => tool !== toolName);
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

    newToolName = newToolName.toLowerCase().replace(/ /g, '_');

    const allTools = toolsStore.tools;
    const oldTool = allTools[toolName];

    if (!oldTool) return;

    allTools[newToolName] = oldTool;
    delete toolsStore.tools[toolName];

    if (toolsStore.toggled.includes(toolName)) {
        toolsStore.toggled = toolsStore.toggled.map((tool) => (tool === toolName ? newToolName : tool));
    }

    router.push(`/tools/${newToolName}`);
}
</script>

<template>
    <div class="h-4/12 md:h-full w-full md:w-96 flex flex-col gap-2 p-2 relative overflow-y-auto">
        <div class="flex flex-row gap-2 justify-between text-base-300 *:hover:text-base-100">
            <ButtonPrimary
                class="grow shrink"
                color="tertiary"
                text="New Tool"
                :icon="BiPlus"
                @click="newTool" />
            <FloatingActionMenu
                :actions="toolsActions"
                anchored="left">
                <ButtonPrimary
                    color="tertiary"
                    text="More"
                    class="p-2"
                    :hideText="true"
                    :icon="BiDotsVerticalRounded" />
            </FloatingActionMenu>
        </div>

        <UITextDivider text="Added Tools" />
        <RouterLink
            v-for="toolName in Object.keys(toolsStore.tools)"
            :to="`/tools/${toolName}`"
            exactActiveClass="*:bg-base-950! [&_span]:text-base-100">
            <div
                class="flex flex-row justify-between items-center hover:bg-base-800 p-1.5 pl-2 rounded-md transition-colors duration-dynamic"
                :class="{ 'opacity-75': !toolsStore.toggled.includes(toolName) }">
                <div class="flex flex-row gap-2 items-center">
                    <BiCheckCircle v-if="toolsStore.toggled.includes(toolName)" />
                    <BiMinusCircle v-else />
                    <span class="text-sm font-medium">{{ toolName }}</span>
                </div>
                <FloatingActionMenu
                    :passArgs="toolName"
                    :actions="itemActions"
                    anchored="left">
                    <button
                        @click.prevent
                        class="hover:bg-base-600 group-[.active]:bg-base-600 group-[.active]:text-base-100 p-1.5 rounded-sm cursor-pointer">
                        <BiDotsVerticalRounded />
                    </button>
                </FloatingActionMenu>
            </div>
        </RouterLink>
    </div>
</template>
