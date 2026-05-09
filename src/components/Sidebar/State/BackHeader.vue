<script setup lang="ts">
import { BiArrowBack } from 'vue-icons-plus/bi';

</script>

<template>
    <div class="pb-4 flex flex-row gap-2">
        <div class="size-10"></div>
        <SidebarRouterLink 
            to="/"
            class="w-full">
            <div class="flex flex-row items-center gap-2 px-4 text-base-300 hover:text-base-200 hover:bg-base-800 active:bg-base-700 h-full rounded-lg">
                <BiArrowBack class="size-4" />
                <span class="font-medium text-sm">Back</span>
            </div>
        </SidebarRouterLink>
    </div>
</template>