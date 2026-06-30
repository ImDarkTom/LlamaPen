<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { emitter } from '@/lib/mitt';
import { type CustomProvider, useCustomProvidersStore } from '@/stores/useCustomProvidersStore';

const customProvidersStore = useCustomProvidersStore();

const isShowing = ref(false);
function getEmptyProvider(): CustomProvider {
    return {
        name: '',
        baseURL: '',
        apiKey: '',
        format: 'openai',
    };
}

const newProvider = ref<CustomProvider>(getEmptyProvider());

onMounted(() => {
    emitter.on('createProviderPopup', () => {
        isShowing.value = true;
    });
});

onUnmounted(() => {
    emitter.off('createProviderPopup');
});

function onClose() {
    selectedPreset.value = '';
    newProvider.value = getEmptyProvider();
    isShowing.value = false;
}

function addCustomProvider() {
    if (!newProvider.value.name || !newProvider.value.baseURL || !newProvider.value.apiKey) {
        alert('Type, name, base URL, and API key are required.');
        return;
    }

    customProvidersStore.add(newProvider.value);
    newProvider.value = getEmptyProvider();

    customProvidersStore.$persist();
    location.reload();
}

const selectedPreset = ref<string>('');
const applyingPreset = ref(false);

function onSelectPreset(preset: CustomProvider) {
    applyingPreset.value = true;
    newProvider.value = preset;

    nextTick(() => {
        applyingPreset.value = false;
    });
}

watch(
    () => newProvider.value.baseURL,
    () => {
        if (!applyingPreset.value && selectedPreset.value && selectedPreset.value !== 'custom') {
            selectedPreset.value = 'custom';
        }
    },
);
</script>

<template>
    <PopupBase
        :showing="isShowing"
        :close-button="true"
        @close="onClose">
        <template #title> Add a provider </template>
        <template #body>
            <div class="flex flex-col pb-4">
                <p class="text-base-300 text-sm mb-2">Works with any Ollama or OpenAI-compatible API</p>

                <PopupAddProviderPresetsSelector
                    v-model:selected-preset="selectedPreset"
                    @select-preset="onSelectPreset" />

                <template v-if="selectedPreset">
                    <PopupAddProviderFormatSelector v-model="newProvider.format" />
                    <hr class="text-base-300 mt-2" />
                    <UIFormField
                        label="Provider Name"
                        v-model="newProvider.name"
                        placeholder="E.g. llama.cpp"
                        tooltip="The name of the provider in the list." />
                    <UIFormField
                        label="Base URL"
                        v-model="newProvider.baseURL"
                        placeholder="E.g. http://127.0.0.1:8080/v1"
                        tooltip="The OpenAI-compatible base URL to send requests to." />
                    <UIFormField
                        label="API Key"
                        type="password"
                        :disabled="!selectedPreset"
                        v-model="newProvider.apiKey"
                        placeholder="sk-..."
                        tooltip="API key to use in requests. Required regardless of if it's actually used by the provider." />
                </template>
            </div>
        </template>
        <template #buttons>
            <button
                class="ml-auto"
                :disabled="!selectedPreset"
                @click="addCustomProvider">
                Add
            </button>
        </template>
    </PopupBase>
</template>
