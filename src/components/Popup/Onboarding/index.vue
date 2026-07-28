<script setup lang="ts">
import ExternalLink from '@/components/ToolsPage/ExternalLink.vue';
import { useProviderManager } from '@/composables/useProviderManager';
import { useConfigStore } from '@/stores/useConfigStore';
import { useCustomProvidersStore, type CustomProvider } from '@/stores/useCustomProvidersStore';
import { onMounted, onUnmounted, ref } from 'vue';
import { BiArrowBack, BiChevronRight, BiSkipNext } from 'vue-icons-plus/bi';

const config = useConfigStore();
const customProvidersStore = useCustomProvidersStore();
const providerManager = useProviderManager();

const isShowing = ref(!config.flags.onboardingComplete);

onMounted(() => {});

onUnmounted(() => {});

function hide() {
    config.flags.onboardingComplete = true;
    isShowing.value = false;
}

const step = ref(1);

const title = computed(() => {
    switch (step.value) {
        case 1:
            return 'Welcome to LlamaPen';
        case 2:
            return 'Setup Provider';
    }
});

function onSkip() {
    customProvidersStore.seedDefaultProvider(customProvidersStore.getSeededDefaultValues());
    customProvidersStore.$persist();

    providerManager.setActiveProvider('ollama');

    hide();

    location.reload();
}

function onFinish(provider: CustomProvider) {
    if (!provider.name || !provider.baseURL || !provider.apiKey) {
        alert('Type, name, base URL, and API key are required.');
        return;
    }

    customProvidersStore.seedDefaultProvider(provider);
    customProvidersStore.$persist();

    providerManager.setActiveProvider('ollama');

    hide();

    location.reload();
}
</script>

<template>
    <PopupBase
        :showing="isShowing"
        :close-button="false"
        :dismissable="false"
        @close="hide">
        <template #title>
            <span class="text-center w-full">{{ title }}</span>
        </template>
        <template #body>
            <div
                v-if="step === 1"
                class="text-base-300">
                <img
                    src="/favicon.svg"
                    alt="LlamaPen Logo"
                    class="size-16 mx-auto mb-6" />
                <p>
                    LlamaPen is an
                    <ExternalLink href="https://github.com/ImDarkTom/LlamaPen">open-source </ExternalLink>,
                    no-install-needed WebUI for local (and cloud!) LLM providers.
                </p>

                <p class="mt-4">
                    To start, setup a provider of your choice or use the pre-configured local Ollama provider. You can
                    always add/change providers in the settings later.
                </p>

                <div class="pt-8 pb-4 flex flex-col gap-4 items-center justify-center">
                    <ButtonPrimary
                        text="Setup Provider"
                        class="p-3"
                        icon-pos="right"
                        :icon="BiChevronRight"
                        @click="step = 2" />

                    <UITextDivider text="or" />

                    <ButtonPrimary
                        text="Use Local Ollama "
                        class="p-3"
                        icon-pos="right"
                        :icon="BiSkipNext"
                        @click="onSkip" />
                </div>
            </div>
            <div v-else>
                <FormAddProvider
                    add-button-text="Finish (reloads page)"
                    @submit="onFinish">
                    <ButtonPrimary
                        text="Back"
                        class="p-3"
                        :icon="BiArrowBack"
                        @click="step = 1" />
                </FormAddProvider>
            </div>
        </template>
    </PopupBase>
</template>
