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
import useUserStore from '@/stores/user';
import TextInputSetting from './components/TextInputSetting.vue';
import logger from '@/lib/logger';
import setPageTitle from '@/utils/core/setPageTitle';
import CategoryLabel from './components/CategoryLabel.vue';
import { useUiStore } from '@/stores/uiStore';
import NumberInputSetting from './components/NumberInputSetting.vue';
import PageHeader from '@/components/Page/PageHeader.vue';
import SelectionSetting from './components/SelectionSetting.vue';

const config = useConfigStore();
const router = useRouter();

const chatsStore = useChatsStore();
const messagesStore = useMessagesStore();
const userStore = useUserStore();
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
    messagesStore.clearMessages();
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

async function signIn() {
    if (!supabase) {
        return;
    }

    const { data: _data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });

    if (error) {
        alert('Error attempting sign in, ' + error);
    }
}

async function signOut() {
    if (!supabase) {
        return;
    }

    await supabase.auth.signOut();
    location.reload();
}

watch(
    () => config.api.enabled,
    async (newValue) => {
        if (newValue === false && config.api.signoutBeforeDisable) {
            // TODO: Fix/make this work
            if (!supabase) return;

            logger.info('Settings Page', 'Signing out before disabling API');
            await supabase.auth.signOut();

            location.reload();
            return;
        }

        location.reload();
    }
);
</script>

<template>
    <div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto px-2
    *:mx-auto *:md:w-4/5 *:lg:w-3/5">
        <PageHeader text="Settings" />

        <OptionCategory label="Account" v-if="inProduction">
            <ToggleSetting v-model="config.api.enabled" label="Enable Llamapen Cloud" />
            <template v-if="config.api.enabled">
                <ButtonSetting v-if="!userStore.isSignedIn" @click="signIn">Sign in with Google</ButtonSetting>
                <!-- todo: add signout button regardless of whether the user has api enabled or not, just by checking jwt -->
                <template v-else>
                    <div class="flex flex-row gap-2">
                        <ButtonSetting type="link" to="/account">Manage account</ButtonSetting>
                        <ButtonSetting @click="signOut">Sign out</ButtonSetting>
                    </div>
                </template>
            </template>
        </OptionCategory>

        <OptionCategory label="Ollama">
            <TextInputSetting label="Ollama URL" v-model="config.ollamaUrl" default="http://localhost:11434"
                :check="ollamaUrlCheck" />
            <span v-if="!uiStore.connectedToOllama">
                Can't connect? Checkout the
                <RouterLink to="/guide" class="text-text underline">setup guide</RouterLink>.
            </span>
        </OptionCategory>

        <OptionCategory label="Models">
            <ButtonSetting type="link" to="/models">Manage Models</ButtonSetting>
            <ToggleSetting v-model="config.ui.modelIcons.monochrome" label="Monochrome model icons" />
            <ToggleSetting v-model="config.ui.modelIcons.background" label="Model icons background" />
            <div v-if="config.ui.modelIcons.background" class="border-l-[1px] border-text pl-3 ml-3">
                <ToggleSetting v-model="config.ui.modelIcons.backgroundDark" label="Dark icon background" />
            </div>
            <ToggleSetting v-model="config.ui.modelIcons.alternateGemmaIcon" label="Alternate Gemma icon" />
        </OptionCategory>

        <OptionCategory label="Appearance">
            <ButtonSetting type="link" to="/shortcuts">View keyboard shortcuts</ButtonSetting>
            <SelectionSetting 
                v-model="config.ui.theme" 
                label="Theme" 
                :items="['auto', 'dark', 'light', 'mono-dark', 'mono-light']" 
                :itemNames="['System default', 'Dark', 'Light', 'Monochrome Dark', 'Monochrome Light']"
                @update:model-value="config.loadTheme()" 
            />
            <div class="flex flex-col gap-2 w-full">
                <span class="text-lg">Animation Speed</span>
                <input class="accent-primary w-full" @change="updateTransitionSpeed" v-model="transitionSpeed"
                    type="range" min="0" max="1" step="0.025" />
                <span class="py-2">
                    <span class="border-2 border-border-muted w-fit p-2 rounded-lg cursor-default box-border">{{
                        transitionSpeedText }}</span>
                    <span class="pl-2">{{ transitionSpeed == 0.125 ? '(Default)' : '' }}</span>
                </span>
            </div>
            <CategoryLabel>Tooltip</CategoryLabel>
            <NumberInputSetting v-model="config.ui.tooltip.waitTimeoutMs" :default="500" :min="0" :max="1000"
                label="Hover delay (ms)" />
            <CategoryLabel>Mobile</CategoryLabel>
            <ToggleSetting v-model="config.closeSidebarOnNavMobile" label="Hide sidebar on navigate" />
        </OptionCategory>

        <OptionCategory label="Chat">
            <ButtonSetting @click="clearChats">
                Clear all chats
            </ButtonSetting>
            <ToggleSetting v-model="config.chat.reasoning.info_open_by_default"
                label="Reasoning text open by default" />
        </OptionCategory>

        <OptionCategory label="Developer">
            <span class="text-danger">Do not change these settings unless you know what you're doing.</span>
            <ToggleSetting v-model="config.developer.mockRequests" label="Mock requests" />
            <ToggleSetting v-model="config.developer.infoLogs" label="Show info logs" />
        </OptionCategory>
    </div>
</template>