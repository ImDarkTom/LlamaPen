<script setup lang="ts">
import { BiCloud, BiCog, BiHelpCircle, BiLogoGithub } from 'vue-icons-plus/bi';
import useCloudUserStore from '@/stores/useCloudUserStore';
import { useConfigStore } from '@/stores/config';

const cloudUserStore = useCloudUserStore();
const config = useConfigStore();

const buttonClasses = 'w-full border-none p-1.5 m-0 box-border rounded-lg h-8 bg-base-800 cursor-pointer transition-all duration-dynamic hover:ring ring-primary';
</script>

<template>
    <div class="flex flex-col max-w-full gap-2 pt-2 px-2">
        <SidebarFooterStatusBanner v-if="!config.cloud.enabled" />
        <SidebarRouterLink v-else-if="config.cloud.enabled" to="/account">
            <div class="flex w-full h-16 bg-base-800 ring-1 ring-base-500 rounded-xl p-2 hover:ring-primary transition-all duration-dynamic">
                <template v-if="cloudUserStore.isLoading" >
                    <div class="flex items-center mr-3 p-1">
                        <div class="bg-base-300/85 size-10 rounded-full animate-pulse"></div>
                    </div>
                    <div class="flex flex-col grow justify-between">
                        <span class="bg-base-300 w-24 h-6 rounded-sm animate-pulse"></span>
                        <span class="bg-base-300/75 w-12 h-4 rounded-sm animate-pulse"></span>
                    </div>
                </template>
                <template v-else-if="cloudUserStore.isSignedIn">
                    <div class="flex items-center mr-3 p-1">
                        <img :src="cloudUserStore.userInfo.details.pictureUrl" alt="User avatar"
                            class="size-10 rounded-full">
                    </div>
                    <div class="flex flex-col grow">
                        <span class="font-bold">{{ cloudUserStore.userInfo.details.name }}</span>
                        <span class="text-sm">{{cloudUserStore.subName }}</span>
                    </div>
                </template>
                <template v-else>
                    <div class="flex flex-row gap-1 grow items-center justify-center">
                        <BiCloud />
                        <span class="font-semibold">
                            Sign Up/Log In
                        </span>
                    </div>
                </template>
            </div>
        </SidebarRouterLink>
        <div class="flex flex-row gap-2">
            <SidebarRouterLink to="/guide" class="grow">
                <BiHelpCircle :class="buttonClasses" />
            </SidebarRouterLink>
            <a href="https://github.com/ImDarkTom/LlamaPen" target="_blank" class="grow">
                <BiLogoGithub :class="buttonClasses" />
            </a>
            <SidebarRouterLink to="/settings" class="grow">
                <BiCog :class="buttonClasses" />
            </SidebarRouterLink>
        </div>
    </div>
</template>