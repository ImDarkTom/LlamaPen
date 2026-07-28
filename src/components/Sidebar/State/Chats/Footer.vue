<script setup lang="ts">
import { BiCog, BiHelpCircle, BiLogoGithub } from 'vue-icons-plus/bi';
</script>

<template>
    <div class="flex flex-col max-w-full gap-2 pt-2 px-2">
        <SidebarFooterStatusBanner />

        <div class="flex flex-row gap-2">
            <SidebarStateChatsFooterButton to="/guide">
                <BiHelpCircle class="size-5" />
            </SidebarStateChatsFooterButton>
            <SidebarStateChatsFooterButton
                component="a"
                href="https://github.com/ImDarkTom/LlamaPen"
                target="_blank">
                <BiLogoGithub class="size-5" />
            </SidebarStateChatsFooterButton>
            <SidebarStateChatsFooterButton to="/settings">
                <BiCog class="size-5" />
            </SidebarStateChatsFooterButton>
        </div>
    </div>
</template>
