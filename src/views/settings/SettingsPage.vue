<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useConfigStore } from '@/stores/config';
import ToggleSetting from '@/views/settings/components/ToggleSetting.vue';
import OptionCategory from './components/OptionCategory.vue';
import { useRouter } from 'vue-router';
import PrimaryButton from '../../components/Buttons/PrimaryButton.vue';
import useChatsStore from '@/stores/chatsStore';
import useMessagesStore from '@/stores/messagesStore';
import supabase from '@/lib/supabase';
import TextInputSetting from './components/TextInputSetting.vue';
import logger from '@/lib/logger';
import setPageTitle from '@/utils/core/setPageTitle';
import CategoryLabel from './components/CategoryLabel.vue';
import NumberInputSetting from './components/NumberInputSetting.vue';
import PageHeader from '@/components/Page/PageHeader.vue';
import SelectionSetting from './components/SelectionSetting.vue';
import { useModelList } from '@/composables/useModelList';
import OptionText from './components/OptionText.vue';
import { BiInfoCircle, BiRefresh, BiRocket, BiTrash } from 'vue-icons-plus/bi';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { ollamaWrapper } from '@/providers/ollama/OllamaWrapper';

const config = useConfigStore();
const router = useRouter();

const chatsStore = useChatsStore();
const messagesStore = useMessagesStore();
const { connectedToOllama, loading: ollamaLoading } = useModelList();

const { 
    offlineReady,
    needRefresh,
    updateServiceWorker
} = useRegisterSW();

// transition speed
const transitionSpeed = ref(0.125);
const transitionSpeedText = computed(() => {
    const speed = transitionSpeed.value;

    if (speed == 0) {
        return 'Disabled';
    } else {
        return `${speed * 1000}ms`;
    }
});

function updateTransitionSpeed() {
    const newSpeed = transitionSpeed.value;

    config.setTransitionSpeed(newSpeed);
}

function ollamaUrlCheck(url: string): string {
    if (url.length === 0 || url === "") {
        url = ollamaDefault;
    }

    config.ollamaUrl = url;
    location.reload();

    return url;
}

// clear chats
function clearChats() {
    if (!confirm('Are you sure you want to clear all chats?')) return;

    chatsStore.clearChats();
    messagesStore.clearAllMessages();
}

function handleEscape(e: KeyboardEvent) {
    if (document.activeElement?.tagName === 'BODY') {
        return;
    }

    if (e.key === 'Escape') {
        router.back();
    }
}

onMounted(async () => {
    setPageTitle('Settings');

    transitionSpeed.value = config.transitionSpeed;
    document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape);
});

const inProduction = import.meta.env.VITE_PRODUCTION === 'true';
const ollamaDefault = import.meta.env.VITE_DEFAULT_OLLAMA ?? 'http://localhost:11434';

watch(
    () => config.cloud.enabled,
    async (newValue) => {
        if (newValue === false && config.cloud.signoutBeforeDisable) {
            // TODO: Fix/make this work
            if (!supabase) return;

            logger.info('Settings Page', 'Signing out before disabling Cloud');
            await supabase.auth.signOut();
        }

        location.reload();
    }
);

async function checkOllamaVersion() {
    const version = await ollamaWrapper.version();

    if (version === null) {
        alert(`❌ Error fetching Ollama version.`);
        return;
    }

    alert(`✅ Ollama Version: ${version}`);
}
</script>

<template>
    <div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto gap-4
    *:mx-auto *:md:w-4/5 *:lg:w-3/5 *:max-w-3xl">
        <PageHeader text="Settings" />

        <OptionCategory label="Account" v-if="inProduction">
            <ToggleSetting 
                v-model="config.cloud.enabled" 
                label="Enable Llamapen Cloud" />
            <span v-if="!config.cloud.enabled" class="text-text-muted/80 text-sm">
                <BiRocket class="size-4 inline align-middle" />
                Run more powerful models with LlamaPen's cloud service.
            </span>
        </OptionCategory>

        <OptionCategory label="Ollama">
            <div v-if="config.cloud.enabled">Ollama not available while LlamaPen Cloud is enabled.</div>
            <template v-else>
                <TextInputSetting 
                    label="Ollama URL" 
                    v-model="config.ollamaUrl" 
                    :default="ollamaDefault"
                    :check="ollamaUrlCheck"
                    :tooltip="`The URL to connect to Ollama on. (Default: ${ollamaDefault})`" />
                <span class="text-sm" v-if="!connectedToOllama && !ollamaLoading">
                    Can't connect? Checkout the
                    <RouterLink to="/guide" class="text-text underline">setup guide</RouterLink>.
                </span>

                <ToggleSetting
                    v-model="config.ollama.modelCapabilities.autoload"
                    label="Autoload model capabilities"
                    tooltip="Load model capabilities on connect. By default only loads if 30 models or less. (Default: Enabled)" />
                <div v-if="config.ollama.modelCapabilities.autoload" class="border-l border-text pl-3 ml-3">
                    <ToggleSetting 
                        v-model="config.ollama.modelCapabilities.alwaysAutoload" 
                        label="Always autoload model capabilities"
                        tooltip="Loads model capabilities regardless of no. of models. (Default: Disabled)" />
                </div>

                <div class="flex items-center justify-center">
                    <PrimaryButton
                        text="Check Ollama version"
                        type="button"
                        @click="checkOllamaVersion"
                        :icon="BiInfoCircle" />
                </div>
            </template>
        </OptionCategory>

        <OptionCategory label="Appearance">
            <SelectionSetting 
                v-model="config.ui.theme" 
                label="Theme" 
                :items="['auto', 'dark', 'light', 'mono-dark', 'mono-light', 'amoled']" 
                :itemNames="['System default', 'Dark', 'Light', 'Plain Dark', 'Plain Light', 'AMOLED']"
                @update:model-value="config.loadTheme()" 
                tooltip="The theme for the app. (Default: System default (dark/light))"
            />
            <ToggleSetting 
                v-model="config.ui.nativeScrollbar" 
                label="Native scrollbar" 
                tooltip="Use the browser's default scrollbar styling. (Default: Disabled)"
                @update:model-value="config.loadScrollbarSetting()"
            />
            <ToggleSetting 
                v-model="config.ui.messageInput.sendButtonAltIcon" 
                label="Alternate send button icon" 
                tooltip="Use a paper-plane icon instead of an up arrow. (Default: Disabled)"
            />
            <ToggleSetting 
                v-model="config.ui.messageInput.hideUnusedButtons" 
                label="Hide unused message input buttons" 
                tooltip="Hide buttons that rely on specific capabilities when the current model doesn't support them, such as the 'Think' button. (Default: Enabled)"
            />
            <div class="flex flex-col gap-2 w-full">
                <OptionText label="Animation Duration" tooltip="The length of animations/transitions throughout the UI. (Default: 125ms)" />
                <input class="accent-primary w-full" @change="updateTransitionSpeed" v-model="transitionSpeed"
                    type="range" min="0" max="1" step="0.025" />
                <span class="py-2">
                    <span class="border-2 border-border-muted w-fit p-2 rounded-lg cursor-default box-border">{{
                        transitionSpeedText }}</span>
                    <span class="pl-2">{{ transitionSpeed == 0.125 ? '(Default)' : '' }}</span>
                </span>
            </div>
            <CategoryLabel>Model Icons</CategoryLabel>
            <ToggleSetting 
                v-model="config.ui.modelIcons.monochrome" 
                label="Monochrome model icons"
                tooltip="Use single-color variants of model icons. (Default: Enabled)" />
            <ToggleSetting 
                v-model="config.ui.modelIcons.background" 
                label="Model icons background"
                tooltip="Add a background to model icons throughout the app. (Default: Disabled)" />
            <div v-if="config.ui.modelIcons.background" class="border-l border-text pl-3 ml-3">
                <ToggleSetting 
                    v-model="config.ui.modelIcons.backgroundDark" 
                    label="Dark icon background"
                    tooltip="Make the icon background darker. (Default: Disabled)" />
            </div>
            <ToggleSetting 
                v-model="config.ui.modelIcons.alternateGemmaIcon" 
                label="Alternate Gemma icon"
                tooltip="Use the Google logo instead of the Gemma icon. (Default: Disabled)" />
            <CategoryLabel>Tooltip</CategoryLabel>
            <NumberInputSetting 
                v-model="config.ui.tooltip.waitTimeoutMs" 
                :default="100" 
                :min="0" 
                :max="1000"
                label="Hover delay (ms)"
                tooltip="How long to mouse over an element before it's tooltip appears. (Default: 100)" />
            <CategoryLabel>Mobile</CategoryLabel>
            <ToggleSetting 
                v-model="config.closeSidebarOnNavMobile" 
                label="Hide sidebar on navigate"
                tooltip="Hide the sidebar after navigating to a different page on mobile. (Default: Enabled)" />
        </OptionCategory>

        <OptionCategory label="Chat">
            <SelectionSetting 
                v-model="config.chat.titleGenerationStyle" 
                label="Title generation style" 
                :items="['dynamic', 'firstMessage', 'generate', 'chatId']" 
                :itemNames="['Dynamic (default)', 'Use first message', 'Generate with current model', 'Use chat ID']"
                tooltip="Dynamic: First message if question, otherwise generate. (Default: Dynamic)"
            />
            <ToggleSetting 
                v-model="config.chat.thinking.infoOpenByDefault"
                label="Reasoning text open by default"
                tooltip="Have reasoning/thinking text open by default for each message. (Default: Disabled)" />
            <ToggleSetting 
                v-model="config.chat.hideTPSInfoText"
                label="Hide tokens/sec in message footer"
                tooltip="Hide the <num>tok/s text in the message footer/controls for model messages. (Default: Disabled)" />
            <NumberInputSetting
                v-model="config.chat.tokenSaveInterval"
                :default="5"
                :min="1"
                :max="100"
                label="Save message every x tokens"
                tooltip="Save the message into local DB every x tokens. Lower values lead to worse performance.
                    Higher values may cause the end of the message to not save if an error occurs. (Default: 5)" />
            <PrimaryButton
                text="Clear all chats"
                type="button"
                color="danger"
                :icon="BiTrash"
                @click="clearChats" />
        </OptionCategory>

        <OptionCategory label="PWA">
            <span v-if="offlineReady">App is ready to work offline.</span>
            <span v-else>Caching app...</span>
            <span v-if="needRefresh">A new version is available, reload to update.</span>
            <PrimaryButton
                v-if="needRefresh"
                text="Reload"
                type="button"
                :icon="BiRefresh"
                @click="updateServiceWorker()" />
        </OptionCategory>

        <OptionCategory label="Developer" v-if="!inProduction">
            <span class="text-danger">Do not change these settings unless you know what you're doing.</span>
            <ToggleSetting v-model="config.developer.mockRequests" label="Mock requests" />
            <ToggleSetting v-model="config.developer.infoLogs" label="Show info logs" />
        </OptionCategory>
    </div>
</template>