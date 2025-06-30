<script setup lang="ts">
import { AiOutlineSearch } from 'vue-icons-plus/ai';
import { useUiStore } from '../../stores/uiStore';
import SidebarRouterLink from './SidebarRouterLink.vue';

const uiStore = useUiStore();

function newBlank(): string {
    if (uiStore.mode === 'chat') {
        return '/';
    } else {
        return '/note';
    }
}

function search() {
    alert('to be added...');
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex flex-row p-0 box-border justify-between items-center">
            <div class="size-10 p-1"></div><!-- sidebar toggle space holder -->
            <SidebarRouterLink :to="newBlank()"
                class="max-h-10 w-1/2 flex justify-center items-center hover:brightness-75 hover:scale-90 active:scale-110 transition-all duration-100">
                <img src="/favicon.svg" alt="LlamaPen Logo" class="size-10 p-1" />
            </SidebarRouterLink>
            <AiOutlineSearch aria-label="Search"
                class="h-6 w-auto cursor-pointer p-2 box-content rounded-lg hover:bg-background-light hover:shadow-xs shadow-black/50"
                @click="search" />
        </div>
    </div>
</template>