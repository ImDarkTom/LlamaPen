<script setup lang="ts">
import ModelIcon from '@/components/Icon/ModelIcon.vue';
import router from '@/router';
import { useConfigStore } from '@/stores/config';
import ollamaApi from '@/utils/ollama';
import setPageTitle from '@/utils/title';
import { Marked } from 'marked';
import { computed, onMounted, ref, watch } from 'vue';
import InfoSection from './components/InfoSection.vue';

const config = useConfigStore();

const modelList = ref<ModelList>([]);
const selectedModel = ref<OllamaModelInfoResponse | null>(null);

const modelFromRoute = computed<string | null>(() => router.currentRoute.value.params.model as string | null);
const prevPagePath = ref<string | null>(null);

onMounted(async () => {
    const historyState = window.history.state;
    if (historyState && historyState.back) {
        prevPagePath.value = historyState.back;
    }

    setPageTitle('Models');
    modelList.value = await ollamaApi.getModels();
    loadModel(modelFromRoute.value);
});

watch(router.currentRoute, () => {
    loadModel(modelFromRoute.value);
});

async function loadModel(modelName: string | null) {
    if (!modelName) {
        return;
    }

    const response = await fetch(config.apiUrl('/api/show'), {
        method: 'POST',
        body: JSON.stringify({
            model: modelName,
        }),
    });

    selectedModel.value = await response.json() as OllamaModelInfoResponse;
}

const modelPageMarked = new Marked();
</script>

<template>
    <div class="w-full h-full flex flex-col md:flex-row gap-2 py-8 px-2 box-border overflow-y-auto">
        <div
            class="h-4/12 md:h-full w-full md:w-3/12 bg-primary-300 rounded-lg flex flex-col gap-2 p-2 overflow-y-auto">
            <div @click="router.push(prevPagePath ?? '/')"
                class="p-4 rounded-md flex flex-row items-center gap-2 font-semibold cursor-pointer select-none">
                Back
            </div>
            <RouterLink v-for="model in modelList" :to="`/models/${model.model}`"
                class="p-4 rounded-md flex flex-row items-center gap-2" exactActiveClass="!bg-primary-200">
                <ModelIcon :name="model.name ?? 'Unknown'" class="size-6" />
                {{ model.name }}
            </RouterLink>
        </div>
        <div class="h-8/12 md:h-full w-full md:w-9/12 bg-primary-300 rounded-lg p-2 overflow-y-auto">
            <span class="flex flex-row gap-2 items-center">
                <ModelIcon :name="modelFromRoute ?? 'Unknown'" class="size-14 p-2" />
                <h1 class="font-bold">{{ selectedModel?.model_info['general.basename'] ?? modelFromRoute }}</h1>
            </span>
            <InfoSection title="License">
                {{ modelPageMarked.parse(selectedModel?.license ?? '') }}
            </InfoSection>
            <InfoSection title="Modelfile">
                {{ modelPageMarked.parse(selectedModel?.modelfile ?? '') }}
            </InfoSection>
            <InfoSection title="Template">
                {{ modelPageMarked.parse(selectedModel?.template ?? '') }}
            </InfoSection>
            <InfoSection title="Details" :no-body-styling="true">
                <div>
                    <div v-for="(value, key) in selectedModel?.details">
                        <template v-if="!value">
                            {{ key }}: <span class="text-txt-2 italic">null</span>
                        </template>
                        <template v-else>
                            {{ key }}: {{ value ?? 'null' }}
                        </template>
                    </div>
                </div>
            </InfoSection>
            <InfoSection title="Model Info" :no-body-styling="true">
                <div>
                    <div v-for="(value, key) in selectedModel?.model_info">
                        <template v-if="!value">
                            {{ key }}: <span class="text-txt-2 italic">null</span>
                        </template>
                        <template v-else>
                            {{ key }}: {{ value ?? 'null' }}
                        </template>
                    </div>
                </div>
            </InfoSection>
        </div>
    </div>
</template>