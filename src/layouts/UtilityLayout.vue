<script setup lang="ts">
import UtilSidebarItem from '@/components/UtilSidebar/UtilSidebarItem.vue';
import { useConfigStore } from '@/stores/config';
import { BiArrowBack, BiCog, BiHelpCircle, BiUserCircle, BiWrench } from 'vue-icons-plus/bi';
import { BsKeyboard } from 'vue-icons-plus/bs';
import { TbListDetails } from 'vue-icons-plus/tb';

const config = useConfigStore();
</script>

<template>
    <div class="p-2 flex flex-row gap-2 min-h-[100svh] w-full">
        <aside class="w-52 shrink-0 bg-background-light h-full hidden md:flex flex-col rounded-lg p-2 ring-border ring-1 gap-2">
            <UtilSidebarItem to="/chat" text="Back to Chat" :icon="BiArrowBack" />
            <UtilSidebarItem to="/settings" text="Settings" :icon="BiCog" />
            <UtilSidebarItem to="/models" text="Models" :icon="TbListDetails" />
            <UtilSidebarItem to="/tools" text="Tools" :icon="BiWrench" />
            <div class="grow"></div>
            <UtilSidebarItem v-if="config.api.enabled" to="/account" text="My Account" :icon="BiUserCircle" />
            <UtilSidebarItem to="/shortcuts" text="Shortcuts" :icon="BsKeyboard" />
            <UtilSidebarItem to="/guide" text="Guide" :icon="BiHelpCircle" />
        </aside>
        <nav class="fixed bottom-0 left-0 right-0 z-10 bg-background-light flex md:hidden justify-between items-center p-2 ring-border ring-1 rounded-t-lg" >
            <UtilSidebarItem to="/chat" :icon="BiArrowBack" />
            <UtilSidebarItem to="/settings" :icon="BiCog" />
            <UtilSidebarItem to="/models" :icon="TbListDetails" />
            <UtilSidebarItem to="/tools" :icon="BiWrench" />
            <UtilSidebarItem v-if="config.api.enabled" to="/account" :icon="BiUserCircle" />
            <UtilSidebarItem class="hidden md:block" to="/shortcuts" :icon="BsKeyboard" />
            <UtilSidebarItem to="/guide" :icon="BiHelpCircle" />
        </nav>
        <main class="w-full pb-10 md:pb-0">
            <RouterView v-slot="{ Component }">
                <Transition name="page-switch" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </RouterView>
        </main>
    </div>
</template>