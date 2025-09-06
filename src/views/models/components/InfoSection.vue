<script setup lang="ts">
import { ref } from 'vue';
import { BiChevronDown, BiChevronUp } from 'vue-icons-plus/bi';

defineProps<{
    title: string;
    content?: string;
    kvList?: Record<string, unknown | null> | null;
}>();

const showingFull = ref<boolean>(false);

function formatValue(value: unknown | null) {
    if (value === null) {
        return 'null';
    }

    if (typeof value === 'string' && value.length === 0) {
        return '<empty string>';
    }

    return value;
}

</script>

<template>
    <div class="w-full mb-6">
        <div class="flex flex-row items-center justify-center w-full cursor-pointer bg-surface hover:bg-surface-light hover:text-text p-2 rounded-lg gap-2"
            @click="showingFull = !showingFull">
            <span class="text-lg md:text-2xl w-full select-none">{{ title }}</span>
            <BiChevronUp class="h-full w-8 p-1" v-if="showingFull" />
            <BiChevronDown class="h-full w-8 p-1" v-else />
        </div>

        <div v-if="showingFull" class="p-2 flex flex-col gap-2">
            <div v-if="kvList" v-for="(value, key) in kvList" class="flex flex-row">
                <div class="bg-surface-light p-2 rounded-l-lg">{{ key }}</div>
                <div class="bg-primary text-background-light p-2 rounded-r-lg" :class="{ 'italic': value === null || (typeof value === 'string' && value.length === 0) }">{{ formatValue(value) }}
                </div>
            </div>

            <!-- although the content should already be sanitized by here, check to make sure if you are implementing it somewhere -->
            <article v-else class="prose prose-app! dark:prose-invert w-full min-w-full whitespace-pre-wrap break-all" v-html="content"></article>
        </div>
    </div>
</template>