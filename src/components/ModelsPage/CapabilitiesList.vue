<script setup lang="ts">
import type { IconType } from 'vue-icons-plus';
import { BiBrain, BiMicrophone, BiReflectVertical, BiShow, BiText, BiWrench } from 'vue-icons-plus/bi';
import Unknown from '@/icons/unknown.svg';

defineProps<{
    modelCapabilities: string[];
}>();

const capabilityDetails: Record<string, { icon: IconType, color: string, ring: string }> = {
    'completion': { 
        icon: BiText, color: 'bg-capability-completion/40', ring: 'ring-capability-completion' 
    },
    'tools': { 
        icon: BiWrench, color: 'bg-capability-tools/40', ring: 'ring-capability-tools' 
    },
    'thinking': { 
        icon: BiBrain, color: 'bg-capability-reasoning/40', ring: 'ring-capability-reasoning' 
    },
    'vision': { 
        icon: BiShow, color: 'bg-capability-vision/40', ring: 'ring-capability-vision' 
    },
    'insert': { 
        icon: BiReflectVertical, color: 'bg-capability-completion/40', ring: 'ring-capability-completion' 
    },
    'audio': { 
        icon: BiMicrophone, color: 'bg-capability-audio/40', ring: 'ring-capability-audio' 
    }
};
</script>

<template>
    <div 
        role="list" 
        class="flex flex-row gap-2 overflow-auto">
        <div 
            v-for="capability in modelCapabilities" 
            role="listitem"
            class="flex flex-row items-center text-sm font-medium gap-1.5 text-base-300 p-2 rounded-lg ring-1 ring-inset select-none"
            :class="`${capabilityDetails[capability].color} ${capabilityDetails[capability].ring}`">
            <component 
                :is="capabilityDetails[capability].icon ?? Unknown" 
                class="size-4" />
            <span class="capitalize">{{ capability }}</span>
        </div>
    </div>
</template>