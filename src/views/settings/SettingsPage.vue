<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useConfigStore } from '@/stores/config';
import ToggleSetting from '@/views/settings/components/ToggleSetting.vue';
import OptionCategory from './components/OptionCategory.vue';
import { AiOutlineClose } from 'vue-icons-plus/ai';
import { useRouter } from 'vue-router';
import ButtonSetting from './components/ButtonSetting.vue';
import useChatsStore from '@/stores/chatsStore';
import useMessagesStore from '@/stores/messagesStore';

const config = useConfigStore();
const router = useRouter();

const chatsStore = useChatsStore();
const messagesStore = useMessagesStore();

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

//custom ollama url
function customUrlDialog() {
    const currentUrl = config.ollamaUrl;
    const customUrl = prompt("Enter a custom URL to use as a Ollama instance, write in the format of an origin i.e. 'http://example.com:8080'. \n\n Leave blank to reset to default (http://localhost:11434): ", currentUrl);

    if (customUrl === currentUrl) {
        return;
    }

    if (!customUrl || customUrl == "") {
        config.setOllamaUrl('http://localhost:11434')
        return;
    }

    config.setOllamaUrl(customUrl);
    location.reload();
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

onMounted(() => {
    transitionSpeed.value = config.transitionSpeed;
    document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape);
});
</script>

<template>
    <div 
        class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto px-2
            *:mx-auto *:md:w-3/5 *:lg:w-1/2"
    >
        <div class="relative w-full flex flex-row justify-between items-center">
            <h1 class="text-4xl font-extrabold mt-2 pr-3 bg-primary-500">Settings</h1>
            <div class="w-full h-0.5 bg-txt-1 absolute top-1/2 translate-y-1/2 -z-1 rounded-full"></div>
            <div class="bg-primary-500 pl-2 box-border">
                <AiOutlineClose class="size-8 hover:bg-primary-300 cursor-pointer rounded-full p-1"
                    @click="router.back()" />
            </div>
        </div>

        <OptionCategory label="Ollama">
            <ButtonSetting @click="customUrlDialog">
                Set custom Ollama URL
            </ButtonSetting>
        </OptionCategory>

        <OptionCategory label="Appearance">
            <div class="flex flex-col gap-2 w-full">
                <h3 class="options-option">Transition Speed</h3>
                <input
                class="accent-primary-200 w-full"
                @change="updateTransitionSpeed" v-model="transitionSpeed" type="range" min="0" max = "1" step="0.025" />
                <span class="py-2">
                    <span class="bg-primary-300 w-fit p-2 rounded-lg text-txt-2 cursor-default box-border">{{ transitionSpeedText }}</span>
                    <span class="pl-2 text-txt-2">{{ transitionSpeed == 0.125 ? '(Default)' : '' }}</span>
                </span>
            </div>
            <ToggleSetting v-model="config.closeSidebarOnNavMobile" label="Mobile: Hide sidebar on navigate"/>
        </OptionCategory>

        <OptionCategory label="Chat">
            <ButtonSetting @click="clearChats">
                Clear all chats
            </ButtonSetting>
            <ButtonSetting>
                Configure title generation prompt... (TO BE ADDED)
            </ButtonSetting>
        </OptionCategory>

        <OptionCategory label="Textpad">
            <ToggleSetting v-model="config.textpad.focusOnLoad" label="Focus on load" />
        </OptionCategory>

        <OptionCategory label="Developer">
            <span class="text-red-500/80">Do not change these settings unless you know what you're doing.</span>
            <ToggleSetting v-model="config.developer.mockRequests" label="Mock requests" />
            <ToggleSetting v-model="config.developer.infoLogs" label="Show info logs" />
        </OptionCategory>
    </div>
</template>

<style>
@reference "@/styles/style.css";

.options-option {
    @apply text-xl font-medium py-2;
}
</style>