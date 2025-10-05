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
        <aside class="w-52 shrink-0 bg-background-light h-full flex flex-col rounded-lg p-2 ring-border ring-1 gap-2">
            <UtilSidebarItem to="/chat" text="Back to Chat" :icon="BiArrowBack" />
            <UtilSidebarItem to="/settings" text="Settings" :icon="BiCog" />
            <UtilSidebarItem to="/models" text="Models" :icon="TbListDetails" />
            <UtilSidebarItem to="/tools" text="Tools" :icon="BiWrench" />
            <div class="grow"></div>
            <UtilSidebarItem v-if="config.api.enabled" to="/account" text="My Account" :icon="BiUserCircle" />
            <UtilSidebarItem to="/shortcuts" text="Shortcuts" :icon="BsKeyboard" />
            <UtilSidebarItem to="/guide" text="Guide" :icon="BiHelpCircle" />
        </aside>
        <main class="w-full">
            <RouterView v-slot="{ Component }">
                <Transition name="page-switch" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </RouterView>
        </main>
    </div>
</template>