<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { emitter } from '@/lib/mitt';
import { useCustomProvidersStore, type KeyedCustomProvider } from '@/stores/useCustomProvidersStore';
import { useProviderManager } from '@/composables/useProviderManager';

const customProvidersStore = useCustomProvidersStore();
const { currentProviderId, setActiveProvider } = useProviderManager();

const isShowing = ref(false);

const editingProvider = ref<KeyedCustomProvider>({ key: '', name: '', baseURL: '', apiKey: '', format: 'openai' });

const selectedProvider = computed({
    get() {
        return currentProviderId.value;
    },

    set(newValue: string) {
        setActiveProvider(newValue);

        // todo(qol, p=l): refresh connection status and load models instead of refreshing page
        // refreshAndLoadModels
        location.reload();
    },
});

onMounted(() => {
    emitter.on('editProviderPopup', (provider) => {
        editingProvider.value = { ...provider };

        isShowing.value = true;
    });
});

onUnmounted(() => {
    emitter.off('editProviderPopup');
});

function hide() {
    editingProvider.value = { key: '', name: '', baseURL: '', apiKey: '', format: 'openai' };
    isShowing.value = false;
}

function editProvider() {
    if (!editingProvider.value.name || !editingProvider.value.baseURL || !editingProvider.value.apiKey) {
        alert('Name, Base URL, and API key are required');
        return;
    }

    customProvidersStore.update(editingProvider.value);

    customProvidersStore.$persist();
    location.reload();
}

function removeCustomProvider() {
    if (customProvidersStore.providers.length === 1) return;

    if (selectedProvider.value === editingProvider.value.key) selectedProvider.value = 'ollama';
    customProvidersStore.remove(editingProvider.value.key);
    customProvidersStore.$persist();
    location.reload();
}
</script>

<template>
    <PopupBase
        :showing="isShowing"
        :close-button="true"
        @close="hide">
        <template #title> Editing {{ editingProvider.name }} </template>
        <template #body>
            <div class="flex flex-col mb-8">
                <PopupAddProviderFormatSelector v-model="editingProvider.format" />
                <hr class="text-base-300 mt-2" />
                <UIFormField
                    label="Provider Name"
                    v-model="editingProvider.name"
                    placeholder="E.g. llama.cpp"
                    tooltip="The name of the provider in the list." />
                <UIFormField
                    label="Base URL"
                    v-model="editingProvider.baseURL"
                    placeholder="E.g. http://127.0.0.1:8080/v1"
                    tooltip="The base URL to send requests to." />
                <UIFormField
                    label="API Key"
                    type="password"
                    v-model="editingProvider.apiKey"
                    placeholder="sk-..."
                    tooltip="API key to use in requests. Required regardless of if it's actually used by the provider." />
            </div>
        </template>
        <template #buttons>
            <button
                :disabled="customProvidersStore.providers.length === 1"
                @click="removeCustomProvider">
                Remove
            </button>
            <button
                class="ml-auto"
                @click="editProvider">
                Save
            </button>
        </template>
    </PopupBase>
</template>
