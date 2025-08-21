<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useConfigStore } from '@/stores/config';
import ToggleSetting from '@/views/settings/components/ToggleSetting.vue';
import OptionCategory from './components/OptionCategory.vue';
import { useRouter } from 'vue-router';
import ButtonSetting from './components/ButtonSetting.vue';
import useChatsStore from '@/stores/chatsStore';
import useMessagesStore from '@/stores/messagesStore';
import supabase from '@/lib/supabase';
import TextInputSetting from './components/TextInputSetting.vue';
import logger from '@/lib/logger';
import setPageTitle from '@/utils/core/setPageTitle';
import CategoryLabel from './components/CategoryLabel.vue';
import { useUiStore } from '@/stores/uiStore';
import NumberInputSetting from './components/NumberInputSetting.vue';
import PageHeader from '@/components/Page/PageHeader.vue';
import SelectionSetting from './components/SelectionSetting.vue';
import ollamaRequest from '@/utils/ollamaRequest';
import { TbListDetails } from 'vue-icons-plus/tb';
import { AiFillInfoCircle } from 'vue-icons-plus/ai';
import { RiAccountCircleLine } from 'vue-icons-plus/ri';
import { BsFillTrash3Fill, BsKeyboard, BsRocketTakeoff } from 'vue-icons-plus/bs';

const config = useConfigStore();
const router = useRouter();

const chatsStore = useChatsStore();
const messagesStore = useMessagesStore();
const uiStore = useUiStore();

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
        url = "http://localhost:11434";
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

watch(
    () => config.api.enabled,
    async (newValue) => {
        if (newValue === false && config.api.signoutBeforeDisable) {
            // TODO: Fix/make this work
            if (!supabase) return;

            logger.info('Settings Page', 'Signing out before disabling API');
            await supabase.auth.signOut();
        }

        location.reload();
    }
);

const isInProd = import.meta.env.VITE_PRODUCTION === 'true';

async function checkOllamaVersion() {
    const { data: response, error } = await ollamaRequest('/api/version', 'GET');

    if (error) {
        alert(`❌ Error fetching Ollama version, ${error}`);
        return;
    }
    
    const body = await response.json();

    alert(`✅ Ollama Version: ${body.version || 'Unknown'}`);
}
</script>

<template>
    <div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto px-2 gap-4
    *:mx-auto *:md:w-4/5 *:lg:w-3/5 *:max-w-3xl">
        <PageHeader text="Settings" />

        <OptionCategory label="Account" v-if="inProduction">
            <ToggleSetting v-model="config.api.enabled" label="Enable Llamapen API" />
            <span v-if="!config.api.enabled" class="text-text-muted/80 text-sm flex flex-row gap-2 items-center justify-start">
                <BsRocketTakeoff class="size-4" />
                Run more powerful models with LlamaPen API, an optional cloud service.
            </span>
            <ButtonSetting v-else type="link" to="/account"><RiAccountCircleLine /> Manage Account</ButtonSetting>
        </OptionCategory>

        <OptionCategory label="Ollama">
            <div v-if="config.api.enabled">Ollama not available while LlamaPen API is enabled.</div>
            <template v-else>
                <TextInputSetting label="Ollama URL" v-model="config.ollamaUrl" default="http://localhost:11434"
                    :check="ollamaUrlCheck" />
                <span v-if="!uiStore.isConnectedToOllama">
                    Can't connect? Checkout the
                    <RouterLink to="/guide" class="text-text underline">setup guide</RouterLink>.
                </span>
                <div class="flex flex-row gap-2 *:w-1/2">
                    <ButtonSetting type="link" to="/models">
                        <TbListDetails /> Manage Models
                    </ButtonSetting>
                    <ButtonSetting type="button" @click="checkOllamaVersion">
                        <AiFillInfoCircle /> Check Ollama version
                    </ButtonSetting>
                </div>
            </template>
        </OptionCategory>

        <OptionCategory label="Appearance">
            <ButtonSetting type="link" to="/shortcuts"><BsKeyboard /> View keyboard shortcuts</ButtonSetting>
            <SelectionSetting 
                v-model="config.ui.theme" 
                label="Theme" 
                :items="['auto', 'dark', 'light', 'mono-dark', 'mono-light']" 
                :itemNames="['System default', 'Dark', 'Light', 'Plain Dark', 'Plain Light']"
                @update:model-value="config.loadTheme()" 
            />
            <ToggleSetting 
                v-model="config.ui.nativeScrollbar" 
                label="Native scrollbar" 
                @update:model-value="config.loadScrollbarSetting()"
            />
            <ToggleSetting 
                v-model="config.ui.sendButtonAltIcon" 
                label="Alternate send button icon" 
            />
            <div class="flex flex-col gap-2 w-full">
                <span class="text-lg">Animation Duration</span>
                <input class="accent-primary w-full" @change="updateTransitionSpeed" v-model="transitionSpeed"
                    type="range" min="0" max="1" step="0.025" />
                <span class="py-2">
                    <span class="border-2 border-border-muted w-fit p-2 rounded-lg cursor-default box-border">{{
                        transitionSpeedText }}</span>
                    <span class="pl-2">{{ transitionSpeed == 0.125 ? '(Default)' : '' }}</span>
                </span>
            </div>
            <CategoryLabel>Model Icons</CategoryLabel>
            <ToggleSetting v-model="config.ui.modelIcons.monochrome" label="Monochrome model icons" />
            <ToggleSetting v-model="config.ui.modelIcons.background" label="Model icons background" />
            <div v-if="config.ui.modelIcons.background" class="border-l-[1px] border-text pl-3 ml-3">
                <ToggleSetting v-model="config.ui.modelIcons.backgroundDark" label="Dark icon background" />
            </div>
            <ToggleSetting v-model="config.ui.modelIcons.alternateGemmaIcon" label="Alternate Gemma icon" />
            <CategoryLabel>Tooltip</CategoryLabel>
            <NumberInputSetting v-model="config.ui.tooltip.waitTimeoutMs" :default="500" :min="0" :max="1000"
                label="Hover delay (ms)" />
            <CategoryLabel>Mobile</CategoryLabel>
            <ToggleSetting v-model="config.closeSidebarOnNavMobile" label="Hide sidebar on navigate" />
        </OptionCategory>

        <OptionCategory label="Chat">
            <ToggleSetting v-model="config.chat.thinking.infoOpenByDefault"
                label="Reasoning text open by default" />
            <ButtonSetting @click="clearChats">
                <BsFillTrash3Fill /> Clear all chats
            </ButtonSetting>
        </OptionCategory>

        <OptionCategory label="Developer" v-if="!isInProd">
            <span class="text-danger">Do not change these settings unless you know what you're doing.</span>
            <ToggleSetting v-model="config.developer.mockRequests" label="Mock requests" />
            <ToggleSetting v-model="config.developer.infoLogs" label="Show info logs" />
        </OptionCategory>
    </div>
</template>