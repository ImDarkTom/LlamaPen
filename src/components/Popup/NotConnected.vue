<script setup lang="ts">
import { BiHelpCircle, BiSolidErrorCircle } from 'vue-icons-plus/bi';
import { onMounted, onUnmounted, ref } from 'vue';
import { emitter } from '../../lib/mitt';
import { useRouter } from 'vue-router';
import { useProviderManager } from '@/composables/useProviderManager';

const { currentProvider, connectionState } = useProviderManager();

const router = useRouter();

const dnsaCheckbox = ref<HTMLInputElement | null>(null);

const showing = ref<boolean>(false);

const currentProviderURL = computed(() => currentProvider.value.config.baseURL);

onMounted(() => {
    emitter.on('openNotConnectedPopup', () => {
        const shouldHide = localStorage.getItem('hideConnectionWarning') || 'false';

        if (shouldHide === 'true') {
            return;
        }

        showing.value = true;
    });
});

onUnmounted(() => {
    emitter.off('openNotConnectedPopup');
});

function handleDNSAToggleCheck() {
    if (dnsaCheckbox.value?.checked) {
        localStorage.setItem('hideConnectionWarning', 'true');
    }
}

function openGuide() {
    handleDNSAToggleCheck();
    showing.value = false;
    router.push('/guide');
}

function hide() {
    handleDNSAToggleCheck();
    showing.value = false;
}
</script>

<template>
    <PopupBase
        :showing
        @close="hide">
        <template #title>
            <BiSolidErrorCircle class="h-full w-auto" />
            Connection error
        </template>
        <template #body>
            <div class="h-full flex flex-col">
                <p class="grow">
                    Unable to connect to '{{ currentProvider.name }}' at
                    <code class="bg-base-800 rounded-lg p-1">
                        {{ currentProviderURL }}
                    </code>

                    <template v-if="currentProvider.type === 'ollama'">
                        Ensure Ollama is running and accepts connection requests from this site.
                        <br />
                        <br />
                        For a guide on how to configure this app to connect to Ollama, press <b>Guide</b>
                        or the
                        <BiHelpCircle class="inline" /> icon in the bottom left of the sidebar;
                    </template>
                </p>
                <span class="font-medium text-base pt-8">Error:</span>
                <code class="bg-base-800 rounded-lg p-1 text-sm! text-base-300">
                    {{ connectionState.error }}
                </code>
                <div class="pb-4 mt-2 flex flex-row items-center gap-2">
                    <input
                        id="notconnected-dnsa"
                        type="checkbox"
                        ref="dnsaCheckbox"
                        class="accent-secondary" />
                    <label for="notconnected-dnsa">Do not show again</label>
                </div>
            </div>
        </template>
        <template #buttons>
            <button
                v-if="currentProvider.type === 'ollama'"
                @click="openGuide">
                Guide
            </button>
            <button @click="hide">Close</button>
        </template>
    </PopupBase>
</template>
