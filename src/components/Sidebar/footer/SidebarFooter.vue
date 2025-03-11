<script setup lang="ts">
import StatusText from './StatusText.vue';
import { BiHelpCircle, BiSolidHelpCircle } from 'vue-icons-plus/bi';
import { AiFillGithub } from 'vue-icons-plus/ai';
import { IoSettings, IoSettingsOutline } from 'vue-icons-plus/io';
import SidebarRouterLink from '../SidebarRouterLink.vue';

const buttonClasses = 'w-full border-none p-1.5 m-0 box-border rounded-lg h-8 bg-primary-300 cursor-pointer hover:shadow-sm shadow-black/50 hover:bg-primary-200 transition-colors duration-100 hover:ring';
</script>

<template>
    <div class="flex flex-col max-w-full">
        <StatusText />
        <div class="flex flex-row gap-2">
            <SidebarRouterLink to="/guide" class="flex-1 p-0 m-0" v-slot="{ isActive }">
                <BiSolidHelpCircle v-if="isActive" :class="buttonClasses" />
                <BiHelpCircle v-else :class="buttonClasses" />
            </SidebarRouterLink>
            <a href="https://github.com/ImDarkTom/LlamaPen" target="_blank" class="flex-1 p-0 m-0">
                <AiFillGithub :class="buttonClasses" />
            </a>
            <SidebarRouterLink to="/settings" class="flex-1 p-0 m-0" v-slot="{ isActive }">
                <IoSettings v-if="isActive" :class="buttonClasses" />
                <IoSettingsOutline v-else :class="buttonClasses" />
            </SidebarRouterLink>
        </div>
    </div>
</template>