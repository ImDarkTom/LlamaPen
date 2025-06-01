<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    title: string;
    noBodyStyling?: boolean;
}>();

const showingFull = ref<boolean>(false);
</script>

<template>
    <div class="w-full mb-6">
        <div class="flex flex-row w-full cursor-pointer bg-primary-200 p-1 rounded-lg gap-2"
            @click="showingFull = !showingFull">
            <span class="text-3xl w-full select-none">{{ title }}</span>
        </div>
        <div v-if="showingFull">
            <slot v-if="noBodyStyling"></slot>
            <pre v-else class="prose prose-invert w-full min-w-full whitespace-pre-wrap break-all"><slot></slot></pre>
        </div>
    </div>
</template>