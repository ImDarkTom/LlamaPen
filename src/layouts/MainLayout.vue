<script setup lang="ts">
import PopupLoader from '@/components/Popups/PopupLoader.vue';
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();
</script>

<template>
    <div class="flex">
        <Sidebar />
    </div>

    <div v-if="config.showSidebar"
        class="fixed inset-0 bg-black/50 z-28 md:hidden"
        @click="config.showSidebar = !config.showSidebar"
    ></div>
        

    <div class="flex-1 min-h-[100svh] pl-0 transition-all duration-dynamic overflow-y-auto"
        :class="{ 'md:pl-72': config.showSidebar }">
        <main class="h-full">
            <RouterView v-slot="{ Component }">
                <Transition name="page-switch" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </RouterView>
        </main>
    </div>

    <PopupLoader />
</template>