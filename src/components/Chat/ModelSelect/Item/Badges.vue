<script setup lang="ts">
import { useProviderManager, type ModelCapability, type ModelInfo } from '@/composables/useProviderManager';
import { BiBrain, BiHeart, BiLock, BiQuestionMark, BiShow, BiWrench } from 'vue-icons-plus/bi';

const props = defineProps<{
    model: ModelInfo;
    capabilities: ModelCapability[];
    isFavorited: boolean;
}>();

const { getModel } = useProviderManager();

const hasReasoning = computed(() => getModel(props.model.info.id).supportsParameter('reasoning'));

const alwaysReasons = computed(() => props.capabilities.includes('always-reasons') ?? false);
</script>

<template>
    <div class="flex flex-row gap-2 shrink-0 min-w-fit">
        <!-- Favorited badge -->
        <Tooltip
            v-if="isFavorited"
            class="bg-red-400/25 rounded-sm p-0.5"
            text="Favorite model"
            size="tiny">
            <BiHeart class="text-red-400 size-4" />
        </Tooltip>

        <!-- Capability badges -->
        <Tooltip
            v-if="capabilities.includes('unavailable')"
            class="bg-slate-400/25 rounded-sm p-0.5"
            text="Capabilities unknown - Provider has not listed capabilities for this model"
            size="tiny">
            <BiQuestionMark class="text-slate-400 size-4" />
        </Tooltip>
        <template v-else>
            <Tooltip
                v-if="capabilities.includes('vision')"
                class="bg-capability-vision/25 rounded-sm p-0.5"
                text="Vision - can process images"
                size="tiny">
                <BiShow class="text-capability-vision size-4" />
            </Tooltip>
            <Tooltip
                v-if="hasReasoning"
                class="bg-capability-reasoning/25 rounded-sm p-0.5"
                size="tiny"
                :text="
                    alwaysReasons
                        ? 'Locked reasoning - always uses reasoning capabilities'
                        : 'Thinking - toggleable enhanced reasoning capabilities'
                ">
                <div class="flex flex-row">
                    <BiBrain class="text-capability-reasoning size-4" />
                    <BiLock
                        v-if="alwaysReasons"
                        class="text-capability-reasoning size-4" />
                </div>
            </Tooltip>
            <Tooltip
                v-if="capabilities.includes('tools')"
                class="bg-capability-tools/25 rounded-sm p-0.5"
                text="Tools - can use external tools"
                size="tiny">
                <BiWrench class="text-capability-tools size-4" />
            </Tooltip>
        </template>
    </div>
</template>
