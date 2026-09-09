<script setup lang="ts">
import { emitter } from '@/lib/mitt';
import { useConfigStore } from '@/stores/useConfigStore';
import isOnMobile from '@/utils/core/isOnMobile';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const config = useConfigStore();

const sections: { sectionPath: string; sectionTitle: string; entries: { entryTitle: string; entryPath: string }[] }[] =
    [
        {
            sectionPath: 'ollama',
            sectionTitle: 'Ollama',
            entries: [
                {
                    entryPath: 'setup',
                    entryTitle: 'Setup',
                },
                {
                    entryPath: 'troubleshooting',
                    entryTitle: 'Troubleshooting',
                },
            ],
        },
        {
            sectionPath: 'openrouter',
            sectionTitle: 'OpenRouter',
            entries: [
                {
                    entryPath: 'free-cloud-models',
                    entryTitle: 'Using free cloud models via OpenRouter',
                },
            ],
        },
    ];

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

    Object.keys(sections).forEach((id) => {
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

        <ButtonPrimary
            color="ghost"
            type="link"
            class="p-2 text-left text-sm font-medium"
            text="Home"
            to="/guide"
            @mouseup="handleNavigate" />

        <UITextDivider
            text="Guides"
            class="mb-2" />

        <ul class="flex flex-col gap-2 w-full">
            <li
                v-for="section in sections"
                :key="section.sectionPath">
                <span>{{ section.sectionTitle }}</span>
                <ul>
                    <li
                        v-for="entry in section.entries"
                        class="w-full flex flex-col"
                        :key="entry.entryPath">
                        <ButtonPrimary
                            color="ghost"
                            type="link"
                            class="p-2 text-left text-sm font-medium"
                            :text="entry.entryTitle"
                            :to="`/guide/${section.sectionPath}/${entry.entryPath}`"
                            @mouseup="handleNavigate" />
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>
