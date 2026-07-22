<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { type CustomProvider } from '@/stores/useCustomProvidersStore';
import { BiPlus } from 'vue-icons-plus/bi';

const props = withDefaults(
    defineProps<{
        addButtonText?: string;
    }>(),
    {
        addButtonText: 'Add',
    },
);

const emit = defineEmits<{
    submit: [provider: CustomProvider];
}>();

function getEmptyProvider(): CustomProvider {
    return {
        name: '',
        baseURL: '',
        apiKey: '',
        format: 'openai',
    };
}

const newProvider = ref<CustomProvider>(getEmptyProvider());

function addCustomProvider() {
    if (!newProvider.value.name || !newProvider.value.baseURL || !newProvider.value.apiKey) {
        alert('Type, name, base URL, and API key are required.');
        return;
    }

    emit('submit', newProvider.value);
    newProvider.value = getEmptyProvider();
}

const selectedPreset = ref<string>('');
const applyingPreset = ref(false);

function onSelectPreset(preset: CustomProvider) {
    applyingPreset.value = true;
    newProvider.value = { ...preset };

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

const slots = useSlots();

const showFooterButtons = computed(() => selectedPreset.value || !!slots.default);
</script>

<template>
    <div class="flex flex-col gap-2">
        <FormProviderPresetSelector
            v-model:selected-preset="selectedPreset"
            @select-preset="onSelectPreset" />

        <template v-if="selectedPreset">
            <PopupAddProviderFormatSelector v-model="newProvider.format" />
            <hr class="text-base-300" />
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

        <div
            v-if="showFooterButtons"
            class="min-w-full flex flex-row mt-2">
            <slot />

            <div class="ml-auto">
                <ButtonPrimary
                    :text="addButtonText"
                    class="w-fit"
                    :icon="BiPlus"
                    :disabled="!newProvider.name.trim() || !newProvider.baseURL.trim() || !newProvider.apiKey.trim()"
                    @click="addCustomProvider" />
            </div>
        </div>
    </div>
</template>
