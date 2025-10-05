<script setup lang="ts">
import PopupLoader from '@/components/Popups/PopupLoader.vue';
import Sidebar from '@/components/Sidebar/Sidebar.vue';
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();
</script>

<template>
    <div class="flex w-full min-h-[100svh]">
        <Sidebar />

        <Transition
            enter-active-class="transition-opacity duration-dynamic"
            leave-active-class="transition-opacity duration-dynamic"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="config.showSidebar"
                class="fixed inset-0 bg-black/50 z-28 md:hidden"
                @click="config.showSidebar = !config.showSidebar"
            ></div>
        </Transition>
            

        <main 
            class="flex-1 transition-discrete duration-dynamic"
            :class="{ 'md:pl-72': config.showSidebar }">
            <RouterView />
        </main>

        <PopupLoader />
    </div>
</template>