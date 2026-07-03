<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useConfigStore } from '@/stores/useConfigStore';
import useChatsStore from '@/stores/useChatsStore';
import useMessagesStore from '@/stores/messagesStore';
import setPageTitle from '@/utils/core/setPageTitle';
import { BiChevronDown, BiChevronUp, BiCog, BiLink, BiPencil, BiPlus, BiRefresh, BiTrash } from 'vue-icons-plus/bi';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { useProviderManager } from '@/composables/useProviderManager';
import { emitter } from '@/lib/mitt';
import { useCustomProvidersStore } from '@/stores/useCustomProvidersStore';
import { VueDraggable } from 'vue-draggable-plus';

const config = useConfigStore();

const chatsStore = useChatsStore();
const messagesStore = useMessagesStore();

const { allProviders, currentProviderId, setActiveProvider } = useProviderManager();

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

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

// clear chats
function clearChats() {
    if (!confirm('Are you sure you want to clear all chats?')) return;

    chatsStore.clearChats();
    messagesStore.clearAllMessages();
}

onMounted(async () => {
    setPageTitle('Settings');

    transitionSpeed.value = config.transitionSpeed;
});

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

const customProvidersStore = useCustomProvidersStore();

const themes = {
    Auto: { auto: 'System Default' },
    Light: {
        light: 'Light',
        'mono-light': 'Plain Light',
        'legacy-light': 'Plain Light (Legacy)',
    },
    Dark: {
        dark: 'Dark',
        'mono-dark': 'Plain Dark',
        amoled: 'AMOLED',
        'legacy-dark': 'Dark (Legacy)',
        'legacy-mono-dark': 'Plain Dark (Legacy)',
    },
};

const providersActions: MenuEntry[] = [
    {
        text: 'Re-add default provider',
        icon: BiRefresh,
        type: 'text',
        category: 'danger',
        condition: !customProvidersStore.providers.some((p) => p.seededDefault),
        onClick: () => {
            customProvidersStore.seedDefaultProvider(customProvidersStore.getSeededDefaultValues());
            location.reload();
        },
    },
    {
        text: 'Remove all custom providers',
        icon: BiTrash,
        type: 'text',
        category: 'danger',
        condition: customProvidersStore.providers.length > 0,
        onClick: () => {
            if (!confirm('Are you sure you want to remove all added providers?')) return;

            customProvidersStore.clearAllAdded();
            location.reload();
        },
    },
];
</script>

<template>
    <div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto gap-4 *:mx-auto *:max-w-prose">
        <UIPageHeader text="Settings" />

        <SettingsOptionCategory label="Providers">
            <SettingsInputSelection
                v-model="selectedProvider"
                label="Selected Provider"
                :items="[...allProviders.keys()]"
                :itemNames="[...allProviders.values()].map((p) => p.name)"
                tooltip="The LLM provider to use. (Default: Ollama)" />

            <SettingsCategoryLabel>List</SettingsCategoryLabel>

            <VueDraggable
                v-model="customProvidersStore.providers"
                tag="ul"
                :handle="'.provider-drag-handle'"
                :draggable="'.provider-list-item'"
                class="flex flex-col gap-2 w-full">
                <li
                    v-for="customProvider in customProvidersStore.providers"
                    :key="customProvider.key"
                    class="provider-list-item flex items-center justify-between p-2 pl-4 border border-base-500 rounded-lg">
                    <button
                        class="provider-drag-handle cursor-grab pr-2"
                        aria-label="Reorder">
                        ⠿
                    </button>
                    <div class="flex flex-col min-w-0 border-base-500 border-l mr-auto pl-2">
                        <div>
                            <Tooltip
                                v-if="customProvider.seededDefault"
                                text="Pre-added app provider">
                                <BiCog class="size-3 mr-1 text-base-300" />
                            </Tooltip>
                            <span class="font-medium truncate">
                                {{ customProvider.name }}
                            </span>
                        </div>
                        <div class="text-sm text-base-300 truncate inline-flex items-center gap-1">
                            <BiLink class="size-3" />
                            <span class="truncate">{{ customProvider.baseURL }}</span>
                        </div>
                    </div>
                    <ButtonPrimary
                        :icon="BiPencil"
                        color="primary"
                        type="button"
                        @click="emitter.emit('editProviderPopup', customProvider)" />
                </li>
            </VueDraggable>

            <div class="flex flex-row gap-2 min-w-full">
                <ButtonPrimary
                    class="grow"
                    text="Add Provider"
                    :icon="BiPlus"
                    @click="emitter.emit('createProviderPopup')" />
                <FloatingActionMenu :actions="providersActions">
                    <template #default="{ shownListLength, isOpened }">
                        <ButtonPrimary
                            :disabled="shownListLength === 0"
                            :icon="isOpened ? BiChevronUp : BiChevronDown" />
                    </template>
                </FloatingActionMenu>
            </div>
        </SettingsOptionCategory>

        <SettingsOptionCategory label="Provider-specific Options">
            <SettingsCategoryLabel>Ollama</SettingsCategoryLabel>
            <SettingsInputToggle
                v-model="config.provider.ollama.autoloadCapabilities"
                label="Autoload model capabilities"
                tooltip="Load model capabilities on connect. By default only loads when <=30 models. (Default: Enabled)" />
            <div
                v-if="config.provider.ollama.autoloadCapabilities"
                class="border-l border-base-400 pl-3 ml-3">
                <SettingsInputToggle
                    v-model="config.provider.ollama.alwaysAutoloadCapabilities"
                    label="Always autoload model capabilities"
                    tooltip="Loads model capabilities regardless of no. of models. May impact performance. (Default: Disabled)" />
            </div>
        </SettingsOptionCategory>

        <SettingsOptionCategory label="Appearance">
            <SettingsInputSelection
                v-model="config.ui.theme"
                label="Theme"
                :items="themes"
                :itemNames="[]"
                @update:model-value="config.loadTheme()"
                tooltip="The theme for the app. (Default: System default (dark/light))" />
            <SettingsInputToggle
                v-model="config.ui.nativeScrollbar"
                label="Native scrollbar"
                tooltip="Use the browser's default scrollbar styling. (Default: Disabled)"
                @update:model-value="config.loadScrollbarSetting()" />
            <SettingsInputToggle
                v-model="config.ui.messageInput.sendButtonAltIcon"
                label="Alternate send button icon"
                tooltip="Use a paper-plane icon instead of an up arrow. (Default: Disabled)" />
            <SettingsInputToggle
                v-model="config.ui.messageInput.hideUnusedButtons"
                label="Hide unused message input buttons"
                tooltip="Hide buttons that rely on specific capabilities when the current model doesn't support them, such as the 'Think' button. (Default: Enabled)" />
            <div class="flex flex-col gap-2 w-full">
                <SettingsOptionText
                    label="Animation Duration"
                    tooltip="The length of animations/transitions throughout the UI. (Default: 125ms)" />
                <input
                    class="accent-primary w-full"
                    @change="updateTransitionSpeed"
                    v-model="transitionSpeed"
                    type="range"
                    min="0"
                    max="1"
                    step="0.025" />
                <span class="py-2">
                    <span class="border-2 border-base-500 w-fit p-2 rounded-lg cursor-default box-border">{{
                        transitionSpeedText
                    }}</span>
                    <span class="pl-2">{{ transitionSpeed == 0.125 ? '(Default)' : '' }}</span>
                </span>
            </div>
            <SettingsCategoryLabel>Model Icons</SettingsCategoryLabel>
            <SettingsInputToggle
                v-model="config.ui.modelIcons.monochrome"
                label="Monochrome model icons"
                tooltip="Use single-color variants of model icons. (Default: Enabled)" />
            <SettingsInputToggle
                v-model="config.ui.modelIcons.background"
                label="Model icons background"
                tooltip="Add a background to model icons throughout the app. (Default: Disabled)" />
            <div
                v-if="config.ui.modelIcons.background"
                class="border-l border-base-100 pl-3 ml-3">
                <SettingsInputToggle
                    v-model="config.ui.modelIcons.backgroundDark"
                    label="Dark icon background"
                    tooltip="Make the icon background darker. (Default: Disabled)" />
            </div>
            <SettingsCategoryLabel>Tooltip</SettingsCategoryLabel>
            <SettingsInputNumber
                v-model="config.ui.tooltip.waitTimeoutMs"
                :default="100"
                :min="0"
                :max="1000"
                label="Hover delay (ms)"
                tooltip="How long to mouse over an element before it's tooltip appears. (Default: 100)" />
            <SettingsCategoryLabel>Sidebar</SettingsCategoryLabel>
            <SettingsInputToggle
                v-model="config.ui.sidebar.entryIcons"
                label="Sidebar chat icons"
                tooltip="Whether or not to show icons next to chat names in the sidebar (Default: Enabled)" />
            <SettingsInputToggle
                v-model="config.closeSidebarOnNavMobile"
                label="Mobile: Hide sidebar on navigate"
                tooltip="Hide the sidebar after navigating to a different page on mobile. (Default: Enabled)" />
        </SettingsOptionCategory>

        <SettingsOptionCategory label="Chat">
            <SettingsInputSelection
                v-model="config.chat.titleGenerationStyle"
                label="Title generation style"
                :items="['dynamic', 'firstMessage', 'generate', 'chatId']"
                :itemNames="['Dynamic (default)', 'Use first message', 'Generate with current model', 'Use chat ID']"
                tooltip="Dynamic: First message if question, otherwise generate. (Default: Dynamic)" />
            <SettingsInputToggle
                v-model="config.chat.thinking.infoOpenByDefault"
                label="Reasoning text open by default"
                tooltip="Have reasoning/thinking text open by default for each message. (Default: Disabled)" />
            <SettingsInputToggle
                v-model="config.chat.hideTPSInfoText"
                label="Hide tokens/sec in message footer"
                tooltip="Hide the <num>tok/s text in the message footer/controls for model messages. (Default: Disabled)" />
            <SettingsInputNumber
                v-model="config.chat.tokenSaveInterval"
                :default="5"
                :min="1"
                :max="100"
                label="Save message every x tokens"
                tooltip="Save the message into local DB every x tokens. Lower values lead to worse performance.
                    Higher values may cause the end of the message to not save if an error occurs. (Default: 5)" />
            <ButtonPrimary
                text="Clear all chats"
                type="button"
                color="danger"
                :icon="BiTrash"
                @click="clearChats" />
        </SettingsOptionCategory>

        <SettingsOptionCategory label="Keyboard Shortcuts">
            <ButtonPrimary
                text="View shortcuts"
                @click="emitter.emit('shortcutsPopup')" />
        </SettingsOptionCategory>

        <SettingsOptionCategory label="PWA">
            <span v-if="offlineReady">App is ready to work offline.</span>
            <span v-else>Caching app...</span>
            <span v-if="needRefresh">A new version is available, reload to update.</span>
            <ButtonPrimary
                v-if="needRefresh"
                text="Reload"
                type="button"
                :icon="BiRefresh"
                @click="updateServiceWorker()" />
        </SettingsOptionCategory>
    </div>
</template>
