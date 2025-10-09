<script lang="ts" setup>
import { useModelList } from '@/composables/useModelList';
import { useConfigStore } from '@/stores/config';
import { computed } from 'vue';
import { BiCloud, BiLinkExternal } from 'vue-icons-plus/bi';
import { RouterLink } from 'vue-router';

const { models } = useModelList();
const loadedModelsAmount = computed(() => models.value.filter(model => model.loadedInMemory).length);
const config = useConfigStore();

const commitHashFull = __COMMIT_HASH__;
const commitHashShort = __COMMIT_HASH__.slice(0, 7);
const appVersion = __APP_VERSION__;

function getGreetingMessage() {
    const hours = new Date().getHours();

    if (hours < 5) {
        return "Good late-night";
    } else if (hours < 12) {
        return "Good morning";
    } else if (hours < 18) {
        return "Good afternoon";
    } else if (hours < 22) {
        return "Good evening";
    } else {
        return "Good late-night";
    }
}
</script>

<template>
    <div class="flex flex-col justify-center md:justify-end items-center w-full h-full md:h-2/5 mb-12">
        <span class="text-xl md:text-2xl">{{ getGreetingMessage() }},</span>
        <span class="text-2xl md:text-4xl font-semibold text-center text-text">What can I help you with?</span>
        <span class="pt-2 text-text-muted/80 flex flex-wrap gap-1.5 justify-center">
            <template v-if="!config.cloud.enabled">
                <RouterLink to="/models">
                    <span class="bg-background-light/80 hover:bg-surface p-2 rounded-full box-content hover:text-text cursor-pointer transition-colors duration-dynamic">
                        {{ models.length }} Models Available | {{ loadedModelsAmount }} Loaded
                    </span>
                </RouterLink>
                &middot;
                <a :href="`https://github.com/ImDarkTom/LlamaPen/tree/${commitHashFull}`" target="_blank">
                    <span :title="commitHashFull" class="bg-background-light/80 hover:bg-surface p-2 rounded-full box-content hover:text-text cursor-pointer transition-colors duration-dynamic">
                        <span class="align-middle">v{{ appVersion }} ({{ commitHashShort }})</span>
                        <BiLinkExternal class="inline size-4 ml-1" />
                    </span>
                </a>
            </template>
            <template v-else>
                <RouterLink to="/account">
                    <span class="bg-background-light/80 hover:bg-surface p-2 rounded-full box-content hover:text-text cursor-pointer transition-colors duration-dynamic">
                        <BiCloud class="inline mr-2" />
                        <span class="items-center">LlamaPen Cloud</span>
                    </span>
                </RouterLink>
            </template>
        </span>
    </div>
</template>