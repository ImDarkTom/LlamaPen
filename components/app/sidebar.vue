<script setup lang="ts">
import Row from '../row.vue';

const uiStore = useUiStore();
const chatsStore = useChatsStore();
</script>

<template>
    <div
        class="absolute size-10 p-1.5 rounded-lg box-border cursor-pointer hover:bg-background-light m-1"
        @click="uiStore.sidebarOpen = !uiStore.sidebarOpen"
    >
        <Icon
            v-if="uiStore.sidebarOpen"
            name="hugeicons:sidebar-left-01"
            class="w-full! h-full!"
        />
        <Icon
            v-else
            name="hugeicons:sidebar-left"
            class="w-full! h-full!"
        />
    </div>
    <aside
        v-show="uiStore.sidebarOpen"
        class="bg-background-dark min-h-full w-[90vw] sm:w-[33vw] lg:w-[20vw] p-2 box-border"
    >
        <Row>
            <div class="size-12" /> <!-- spacer for the icon -->
            <NuxtLink
                to="/"
                class="size-10"
            >
                <img
                    src="/favicon.svg"
                    alt="LlamaPen Logo"
                >
            </NuxtLink>
        </Row>
        <ul>
            <li
                v-for="chat in chatsStore.chats"
                :key="chat.id"
            >
                <SidebarListItem
                    :chat
                    :opened="chatsStore.openedChatId === chat.id"
                />
            </li>
        </ul>
    </aside>
</template>
