<script setup lang="ts">
import { type ModelCapability } from '@/composables/useProviderManager';
import type { ProviderMetadata } from '@/providers/base/types';
import { BiBrain, BiHeart, BiLock, BiQuestionMark, BiShow, BiWrench } from 'vue-icons-plus/bi';

const props = defineProps<{
    providerMetadata?: ProviderMetadata;
    capabilities: ModelCapability[];
    isFavorited: boolean;
}>();

const alwaysReasons = computed(() => props.capabilities.includes('always-reasons') ?? false);
</script>

<template>
    <div
        class="flex flex-row gap-2 shrink-0 min-w-fit">
        <!-- Favorited badge -->
        <div 
            v-if="isFavorited"
            class="bg-red-400/25 rounded-sm ring-1 ring-red-400 p-0.5"
            title="Favorited model">
            <BiHeart class="text-red-400 size-4" />
        </div>

        <!-- Capability badges -->
        <div
            v-if="capabilities.includes('unavailable')"
            class="bg-slate-400/25 rounded-sm ring-1 ring-slate-400 p-0.5"
            title="Capabilities unknown - Provider has not listed capabilities for this model">
            <BiQuestionMark class="text-slate-400 size-4" />
        </div>
        <template v-else>
            <div 
                v-if="capabilities.includes('vision')"
                class="bg-capability-vision/25 rounded-sm ring-1 ring-capability-vision p-0.5"
                title="Vision - can process images">
                <BiShow class="text-capability-vision size-4" />
            </div>
            <div 
                v-if="capabilities.includes('reasoning')"
                class="bg-capability-reasoning/25 rounded-sm ring-1 ring-capability-reasoning p-0.5 flex flex-row"
                :title="alwaysReasons 
                    ? 'Locked reasoning - always uses reasoning capabilities' 
                    : 'Thinking - toggleable enhanced reasoning capabilities'" >
                <BiBrain class="text-capability-reasoning size-4" />
                <BiLock 
                    v-if="alwaysReasons" 
                    class="text-capability-reasoning size-4" />
            </div>
            <div 
                v-if="capabilities.includes('tools')"
                class="bg-capability-tools/25 rounded-sm ring-1 ring-capability-tools p-0.5"
                title="Tools - can use external tools">
                <BiWrench class="text-capability-tools size-4" />
            </div>
        </template>
    </div>
</template>