<script setup lang="ts">
import { type ModelCapability } from '@/composables/useProviderManager';
import type { ProviderMetadata } from '@/providers/base/types';
import type { LpCloudPricing } from '@/providers/lpcloud/types';
import useCloudUserStore from '@/stores/useCloudUserStore';
import { BiBox, BiBrain, BiHeart, BiLock, BiQuestionMark, BiShow, BiStar, BiWrench } from 'vue-icons-plus/bi';

const cloudUserStore = useCloudUserStore();

const props = defineProps<{
    providerMetadata?: ProviderMetadata;
    capabilities: ModelCapability[];
    isFavorited: boolean;
}>();

const lpCloudMetadata = computed(() => props.providerMetadata?.provider === 'lpcloud' ? props.providerMetadata : null);

const lpCloudPriceTier = computed<LpCloudPricing | null>(() => lpCloudMetadata.value?.data.priceTier ?? null);

const alwaysReasons = computed(() => lpCloudMetadata.value?.data.tags?.includes('alwaysReasons') ?? props.capabilities.includes('always-reasons') ?? false);

const lpCloudPricingMap: Record<LpCloudPricing, string> = {
	"0": '¢',
	"1": "$",
	"2": "$$",
	"3": "$$$",
	"4": "$$$+",
};

const lpCloudPricingMapNames: Record<LpCloudPricing, string> = {
	"0": 'Very low cost',
	"1": "Low cost",
	"2": "Medium cost",
	"3": "High cost",
	"4": "Very high cost",
};
</script>

<template>
    <div
        class="flex flex-row gap-2 shrink-0 min-w-fit">
        <template v-if="lpCloudMetadata">
            <Tooltip 
                size="small"
                :text="lpCloudPriceTier !== null ? lpCloudPricingMapNames[lpCloudPriceTier] : ''">
                <span
                    class="text-xs font-medium flex items-center pl-2 min-w-max"
                    :class="{
                        'text-lpcloudpricing-verylow': lpCloudPriceTier === 0,
                        'text-lpcloudpricing-low': lpCloudPriceTier !== null && [1,2].includes(lpCloudPriceTier),
                        'text-lpcloudpricing-moderate': lpCloudPriceTier === 3,
                        'text-lpcloudpricing-high': lpCloudPriceTier === 4,
                    }">
                    {{ lpCloudPriceTier !== null ? lpCloudPricingMap[lpCloudPriceTier] : '' }}
                </span>
            </Tooltip>
        </template>
        <!-- Favorited badge -->
        <div 
            v-if="isFavorited"
            class="bg-red-400/25 rounded-sm ring-1 ring-red-400 p-0.5"
            title="Favorited model">
            <BiHeart class="text-red-400 size-4" />
        </div>

        <!-- LlamaPen Cloud badges -->
        <template v-if="lpCloudMetadata">
            <div 
                v-if="lpCloudMetadata.data.premium && !cloudUserStore.isPremium"
                class="bg-yellow-400/25 rounded-sm ring-1 ring-yellow-400 p-0.5"
                title="Premium model - requires LlamaPen Cloud Premium">
                <BiStar class="text-yellow-400 size-4" />
            </div>
            <div 
                v-if="lpCloudMetadata.data.tags?.includes('closedSource')"
                class="bg-orange-400/25 rounded-sm ring-1 ring-orange-400 p-0.5"
                title="Proprietary model - closed-source model that is not open-source.">
                <BiBox class="text-orange-400 size-4" />
            </div>
        </template>

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