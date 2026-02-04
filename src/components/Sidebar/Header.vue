<script setup lang="ts">
import { emitter } from '@/lib/mitt';
import { BiSearchAlt2 } from 'vue-icons-plus/bi';

const logoFile = import.meta.glob('@/icons/llamapen/favicon.svg', { eager: true });
const logo = Object.values(logoFile)[0];

function search() {
    emitter.emit('openSearchbox');
}
</script>

<template>
    <div class="flex flex-col gap-2 pb-2">
        <div class="flex flex-row p-0 box-border justify-between items-center">
            <div class="size-10 p-1"></div><!-- sidebar toggle space holder -->
            <SidebarRouterLink to="/"
                class="max-h-10 w-1/2 flex justify-center items-center hover:brightness-75 hover:scale-90 active:scale-110 transition-all duration-dynamic">
                <logo alt="LlamaPen Logo" class="size-10 p-1 text-text" />
            </SidebarRouterLink>
            <BiSearchAlt2 aria-label="Search"
                class="h-6 w-auto cursor-pointer p-2 box-content rounded-lg text-text hover:bg-background-light hover:shadow-xs shadow-black/50"
                @click="search" />
        </div>
    </div>
</template>