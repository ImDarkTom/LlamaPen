<script setup lang="ts">
import StatusText from './StatusText.vue';
import { BiHelpCircle } from 'vue-icons-plus/bi';
import { AiFillGithub } from 'vue-icons-plus/ai';
import { IoSettingsOutline } from 'vue-icons-plus/io';
import SidebarRouterLink from '../SidebarRouterLink.vue';
import useUserStore from '@/stores/user';
import { useConfigStore } from '@/stores/config';

const userStore = useUserStore();
const config = useConfigStore();

const buttonClasses = 'w-full border-none p-1.5 m-0 box-border rounded-lg h-8 bg-background-light cursor-pointer transition-all duration-dynamic hover:ring ring-primary';
</script>

<template>
    <div class="flex flex-col max-w-full gap-2 pt-2">
        <StatusText v-if="!config.api.enabled" />
        <SidebarRouterLink v-else-if="userStore.user" to="/account">
            <div class="flex w-full h-16 bg-background-light ring-1 ring-border-muted rounded-xl p-2 hover:ring-primary transition-all duration-dynamic">
                <div class="flex items-center mr-3 p-1">
                    <img :src="userStore.user.user_metadata.avatar_url" alt="User avatar"
                        class="size-10 rounded-full">
                </div>
                <div class="flex flex-col grow">
                    <span class="font-bold">{{ userStore.user.user_metadata.name }}</span>
                    <span class="text-sm">{{userStore.subscription.name}}</span>
                </div>
            </div>
        </SidebarRouterLink>
        <div class="flex flex-row gap-2">
            <SidebarRouterLink to="/guide" class="grow">
                <BiHelpCircle :class="buttonClasses" />
            </SidebarRouterLink>
            <a href="https://github.com/ImDarkTom/LlamaPen" target="_blank" class="grow">
                <AiFillGithub :class="buttonClasses" />
            </a>
            <SidebarRouterLink to="/settings" class="grow">
                <IoSettingsOutline :class="buttonClasses" />
            </SidebarRouterLink>
        </div>
    </div>
</template>