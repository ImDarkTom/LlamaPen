<script setup lang="ts">
import UtilSidebarItem from '@/components/UtilSidebar/UtilSidebarItem.vue';
import { useConfigStore } from '@/stores/config';
import { BiCog, BiHelpCircle, BiUserCircle, BiWrench } from 'vue-icons-plus/bi';
import { BsKeyboard } from 'vue-icons-plus/bs';
import { TbListDetails } from 'vue-icons-plus/tb';

const config = useConfigStore();
</script>

<template>
    <div class="flex flex-row gap-2 h-svh w-full md:bg-base-900">
        <aside class="w-52 mx-4 py-6 shrink-0 h-full hidden md:flex flex-col p-2 gap-2">
            <UtilSidebarItem to="/settings" text="Settings" :icon="BiCog" />
            <UtilSidebarItem to="/models" text="Models" :icon="TbListDetails" />
            <UtilSidebarItem to="/tools" text="Tools" :icon="BiWrench" />
            <div class="grow"></div>
            <UtilSidebarItem v-if="config.cloud.enabled" to="/account" text="My Account" :icon="BiUserCircle" />
            <UtilSidebarItem to="/shortcuts" text="Shortcuts" :icon="BsKeyboard" />
            <UtilSidebarItem to="/guide" text="Guide" :icon="BiHelpCircle" />
        </aside>
        <nav class="fixed bottom-0 left-0 right-0 z-10 bg-base-800 flex md:hidden justify-between items-center p-2 ring-base-600 ring-1 rounded-t-lg" >
            <UtilSidebarItem to="/settings" :icon="BiCog" />
            <UtilSidebarItem to="/models" :icon="TbListDetails" />
            <UtilSidebarItem to="/tools" :icon="BiWrench" />
            <UtilSidebarItem v-if="config.cloud.enabled" to="/account" :icon="BiUserCircle" />
            <UtilSidebarItem class="hidden md:block" to="/shortcuts" :icon="BsKeyboard" />
            <UtilSidebarItem to="/guide" :icon="BiHelpCircle" />
        </nav>
        <main class="w-full pb-14 p-2 md:pb-0 md:p-0">
            <RouterView v-slot="{ Component }">
                <Transition name="page-switch" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </RouterView>
        </main>
    </div>
</template>