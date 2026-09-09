<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';
import {
    BiBrain,
    BiLock,
    BiMicrophone,
    BiQuestionMark,
    BiReflectVertical,
    BiShow,
    BiText,
    BiWrench,
} from 'vue-icons-plus/bi';
import Unknown from '@/icons/unknown.svg';
import type { ModelCapability } from '@/composables/useProviderManager';

defineProps<{
    modelCapabilities: ModelCapability[];
}>();

const capabilityDetails: Record<ModelCapability, { icon: IconType; color: string; ring: string }> = {
    completion: {
        icon: BiText,
        color: 'bg-capability-completion/40',
        ring: 'ring-capability-completion',
    },
    tools: {
        icon: BiWrench,
        color: 'bg-capability-tools/40',
        ring: 'ring-capability-tools',
    },
    reasoning: {
        icon: BiBrain,
        color: 'bg-capability-reasoning/40',
        ring: 'ring-capability-reasoning',
    },
    vision: {
        icon: BiShow,
        color: 'bg-capability-vision/40',
        ring: 'ring-capability-vision',
    },
    insert: {
        icon: BiReflectVertical,
        color: 'bg-capability-completion/40',
        ring: 'ring-capability-completion',
    },
    audio: {
        icon: BiMicrophone,
        color: 'bg-capability-audio/40',
        ring: 'ring-capability-audio',
    },
    'always-reasons': {
        icon: BiLock,
        color: 'bg-capability-reasoning/40',
        ring: 'ring-capability-reasoning',
    },
    unavailable: {
        icon: BiQuestionMark,
        color: 'bg-gray-400/40',
        ring: 'ring-gray-400',
    },
};
</script>

<template>
    <div
        role="list"
        class="flex flex-row gap-2 overflow-auto">
        <div
            v-for="capability in modelCapabilities"
            role="listitem"
            class="flex flex-row items-center text-sm font-medium gap-1.5 text-base-300 p-2 rounded-lg select-none"
            :class="`${capabilityDetails[capability].color}`">
            <component
                :is="capabilityDetails[capability].icon ?? Unknown"
                class="size-4" />
            <span class="capitalize">{{ capability }}</span>
        </div>
    </div>
</template>
