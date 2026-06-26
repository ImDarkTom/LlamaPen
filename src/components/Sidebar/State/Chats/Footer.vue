<script setup lang="ts">
import { BiCog, BiHelpCircle, BiLogoGithub } from 'vue-icons-plus/bi';

const buttonClasses = 'w-full border-none p-1.5 m-0 box-border rounded-lg h-8 bg-base-800 cursor-pointer transition-all duration-dynamic hover:ring ring-primary';
</script>

<template>
    <div class="flex flex-col max-w-full gap-2 pt-2 px-2">
        <SidebarFooterStatusBanner />

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