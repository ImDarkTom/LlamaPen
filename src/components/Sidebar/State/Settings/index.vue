<script setup lang="ts">
import { emitter } from '@/lib/mitt';
import { useConfigStore } from '@/stores/useConfigStore';
import isOnMobile from '@/utils/core/isOnMobile';
import type { IconType } from 'vue-icons-plus';
import {
    BiData,
    BiMessageRoundedDots,
    BiMobileAlt,
    BiPalette,
    BiServer,
    BiSlider,
    BiSolidKeyboard,
} from 'vue-icons-plus/bi';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const config = useConfigStore();

const headings: Record<string, { text: string; icon: IconType }> = {
    providers: { text: 'Providers', icon: BiServer },
    'provider-options': { text: 'Provider-specific Options', icon: BiSlider },
    appearance: { text: 'Appearance', icon: BiPalette },
    chat: { text: 'Chat', icon: BiMessageRoundedDots },
    'kbd-shortcuts': { text: 'Keyboard Shortcuts', icon: BiSolidKeyboard },
    data: { text: 'Data', icon: BiData },
    pwa: { text: 'PWA', icon: BiMobileAlt },
};

const activeHeading = ref(window.location.hash.slice(1) || 'providers');
let observer: IntersectionObserver | undefined;

onMounted(() => {
    const root = document.querySelector<HTMLElement>('[data-settings-scroll]');

    observer = new IntersectionObserver(
        (entries) => {
            const visibleHeading = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

            if (visibleHeading) activeHeading.value = visibleHeading.target.id;
        },
        { root, rootMargin: '0px 0px -65% 0px', threshold: 0 },
    );

    Object.keys(headings).forEach((id) => {
        const section = document.getElementById(id);
        if (section) observer?.observe(section);
    });
});

onBeforeUnmount(() => observer?.disconnect());

function handleNavigate() {
    if (isOnMobile() && config.closeSidebarOnNavMobile) {
        emitter.emit('hideSidebar');
    }
}
</script>

<template>
    <div class="flex flex-col p-2 gap-px w-full">
        <SidebarStateBackHeader />

        <UITextDivider
            text="Settings"
            class="mb-2" />

        <div class="flex flex-col gap-2">
            <ButtonPrimary
                v-for="[id, item] in Object.entries(headings)"
                color="ghost"
                type="link-external"
                class="p-2 text-left text-sm font-medium"
                :class="{ 'bg-base-700!': activeHeading === id }"
                :text="item.text"
                :icon="item.icon"
                :key="id"
                :href="`/settings#${id}`"
                @mouseup="handleNavigate" />
        </div>
    </div>
</template>
