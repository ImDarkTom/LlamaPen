<script setup lang="ts">
import type { ModelViewInfo } from './types';
import { TabsRoot, TabsList, TabsContent, TabsTrigger } from 'reka-ui';

const props = defineProps<{
    modelFromParams: string | null;
    selectedModel: Extract<ModelViewInfo, { state: 'data' }>;
}>();

const attributeEntries = computed(() => Object.entries(props.selectedModel.attributes));
const defaultTab = computed(() => `tab-${Object.keys(props.selectedModel.attributes)[0]}`);
</script>

<template>
    <UIViewerContainer>
        <div class="flex flex-col h-full gap-2">
            <div class="flex flex-row gap-1.5 mb-2">
                <IconModel
                    :name="modelFromParams ?? 'Unknown'"
                    class="size-13 p-0.5" />
                <div class="flex flex-col">
                    <span class="text-base-200 text-lg font-bold">
                        {{ selectedModel.modelName }}
                    </span>
                    <span class="text-base-300">
                        {{ modelFromParams }}
                    </span>
                </div>
            </div>

            <ModelsPageCapabilitiesList :model-capabilities="selectedModel.capabilities" />

            <div class="relative flex-1 min-h-0">
                <TabsRoot
                    class="flex flex-col w-full h-full shadow-sm rounded-lg border border-base-800"
                    :default-value="defaultTab">
                    <TabsList class="relative shrink-0 flex border-b border-base-700 p-2 gap-2">
                        <TabsTrigger
                            v-for="[key] in attributeEntries"
                            :value="`tab-${key}`"
                            :key
                            class="text-sm! font-medium data-[state=active]:bg-base-700 hover:bg-base-800 px-2 py-1 rounded-md cursor-pointer transition-colors duration-dynamic">
                            {{ key }}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        v-for="[key, value] in attributeEntries"
                        :value="`tab-${key}`"
                        :key
                        class="flex-1 min-h-0 overflow-y-auto">
                        <ModelsPageInfoSection
                            v-if="typeof value === 'string'"
                            :content="value" />
                        <ModelsPageInfoSection
                            v-else-if="typeof value === 'object' && value !== null"
                            :kv-list="value as Record<string, unknown>" />
                        <div
                            v-else
                            class="p-2 italic">
                            No data.
                        </div>
                    </TabsContent>
                </TabsRoot>
            </div>
        </div>
    </UIViewerContainer>
</template>
