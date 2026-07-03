<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { emitter } from '@/lib/mitt';
import { type CustomProvider, useCustomProvidersStore } from '@/stores/useCustomProvidersStore';

const customProvidersStore = useCustomProvidersStore();

const isShowing = ref(false);

onMounted(() => {
    emitter.on('createProviderPopup', () => {
        isShowing.value = true;
    });
});

onUnmounted(() => {
    emitter.off('createProviderPopup');
});

function onClose() {
    isShowing.value = false;
}

function addCustomProvider(provider: CustomProvider) {
    if (!provider.name || !provider.baseURL || !provider.apiKey) {
        alert('Type, name, base URL, and API key are required.');
        return;
    }

    customProvidersStore.add(provider);

    customProvidersStore.$persist();
    location.reload();
}
</script>

<template>
    <PopupBase
        :showing="isShowing"
        :close-button="true"
        @close="onClose">
        <template #title> Add a provider </template>
        <template #body>
            <div class="flex flex-col">
                <p class="text-base-300 text-sm mb-2">Works with any Ollama or OpenAI-compatible API</p>

                <FormAddProvider @submit="addCustomProvider" />
            </div>
        </template>
        <template #buttons> </template>
    </PopupBase>
</template>
