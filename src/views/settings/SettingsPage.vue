<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useConfigStore } from '@/stores/config';
import ToggleSetting from '@/views/settings/components/ToggleSetting.vue';
import OptionCategory from './components/OptionCategory.vue';
import { AiOutlineClose } from 'vue-icons-plus/ai';
import { useRouter } from 'vue-router';
import ButtonSetting from './components/ButtonSetting.vue';
import useChatsStore from '@/stores/chatsStore';
import useMessagesStore from '@/stores/messagesStore';
import supabase from '@/supabase';
import useUserStore from '@/stores/user';
import TextInputSetting from './components/TextInputSetting.vue';
import logger from '@/utils/logger';
import setPageTitle from '@/utils/title';
import CategoryLabel from './components/CategoryLabel.vue';
import { useUiStore } from '@/stores/uiStore';

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
        return;
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
        <div class="relative w-full flex flex-row justify-between items-center">
            <h1 class="text-4xl font-extrabold mt-2 pr-3 bg-primary-400">Settings</h1>
            <div class="w-full h-0.5 bg-txt-1 absolute top-1/2 translate-y-1/2 -z-1 rounded-full"></div>
            <div class="bg-primary-400 pl-2 box-border">
                <AiOutlineClose
                    class="size-10 hover:bg-primary-300 cursor-pointer rounded-full p-1 transition-colors duration-100"
                    @click="router.back()" />
            </div>
        </div>

        <OptionCategory label="Account" v-if="inProduction">
            <ToggleSetting v-model="config.api.enabled" label="Enable Llamapen Cloud" />
            <template v-if="config.api.enabled">
                <ButtonSetting v-if="!userStore.isSignedIn" @click="signIn">Sign in with Google</ButtonSetting>
                <template v-else>
                    <!-- <ToggleSetting v-model="config.api.signoutBeforeDisable" label="Sign out before disable" /> -->
                    <div class="flex flex-row gap-2">
                        <RouterLink to="/account"
                            class="bg-primary-200! p-4 rounded-lg hover:ring-1 ring-txt-2/50 cursor-pointer transition-all duration-150 w-fit">
                            Manage account
                        </RouterLink>
                        <ButtonSetting @click="signOut">Sign out</ButtonSetting>
                    </div>
                </template>
            </template>
        </OptionCategory>

        <OptionCategory label="Ollama">
            <TextInputSetting label="Ollama URL" v-model="config.ollamaUrl" default="http://localhost:11434"
                :check="ollamaUrlCheck" />
            <span v-if="!uiStore.connectedToOllama" class="text-txt-2">
                Can't connect? Checkout the
                <RouterLink to="/guide" class="text-txt-1 underline">setup guide</RouterLink>.
            </span>
        </OptionCategory>

        <OptionCategory label="Appearance">
            <RouterLink
                class="!bg-primary-200 text-txt-2 p-4 rounded-lg hover:ring-1 ring-txt-2/50 cursor-pointer transition-all duration-150 w-fit hover:text-txt-1"
                to="/shortcuts">
                View keyboard shortcuts
            </RouterLink>
            <div class="flex flex-col gap-2 w-full">
                <span class="text-lg text-txt-2">Transition Speed</span>
                <input class="accent-primary-200 w-full" @change="updateTransitionSpeed" v-model="transitionSpeed"
                    type="range" min="0" max="1" step="0.025" />
                <span class="py-2">
                    <span class="bg-primary-200 w-fit p-2 rounded-lg text-txt-2 cursor-default box-border">{{
                        transitionSpeedText }}</span>
                    <span class="pl-2 text-txt-2">{{ transitionSpeed == 0.125 ? '(Default)' : '' }}</span>
                </span>
            </div>
            <CategoryLabel>Model Select Icons</CategoryLabel>
            <ToggleSetting v-model="config.ui.monochromeModelIcons" label="Monochrome model icons" />
            <ToggleSetting v-model="config.ui.modelIconsBg" label="Model icons background" />
            <div v-if="config.ui.modelIconsBg" class="border-l-[1px] border-txt-1 pl-3 ml-3">
                <ToggleSetting v-model="config.ui.modelIconsBgDark" label="Dark icon background" />
            </div>
            <CategoryLabel>Mobile</CategoryLabel>
            <ToggleSetting v-model="config.closeSidebarOnNavMobile" label="Hide sidebar on navigate" />
        </OptionCategory>

        <OptionCategory label="Chat">
            <ButtonSetting @click="clearChats">
                Clear all chats
            </ButtonSetting>
            <ToggleSetting v-model="config.chat.reasoning.info_open_by_default"
                label="Reasoning text open by default" />
            <!-- <ButtonSetting>
                Configure title generation prompt... (TO BE ADDED)
            </ButtonSetting> -->
        </OptionCategory>

        <OptionCategory label="Note">
            <ToggleSetting v-model="config.note.focusOnLoad" label="Focus on load" />
            <ToggleSetting v-model="config.note.showHeaderLabels" label="Show header labels" />
        </OptionCategory>

        <OptionCategory label="Developer">
            <span class="text-red-500/80">Do not change these settings unless you know what you're doing.</span>
            <ToggleSetting v-model="config.developer.mockRequests" label="Mock requests" />
            <ToggleSetting v-model="config.developer.infoLogs" label="Show info logs" />
        </OptionCategory>
    </div>
</template>