<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import CustomUrlButton from './components/CustomUrlButton.vue';
import { useConfigStore } from '@/stores/config';
import ToggleSetting from '@/views/settings/components/ToggleSetting.vue';
import OptionCategory from './components/OptionCategory.vue';
import { AiOutlineClose } from 'vue-icons-plus/ai';
import { useRouter } from 'vue-router';

const config = useConfigStore();
const router = useRouter();

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
                    @click="$router.back" />
            </div>
        </div>

        <OptionCategory label="Ollama">
            <div>
                <h3 class="options-option">Ollama URL</h3>
                <CustomUrlButton />
            </div>
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
            <ToggleSetting v-model="config.closeSidebarOnNavMobile" @change="config.saveCloseSidebarOnNavMobile" label="Mobile: Hide sidebar on navigate"/>
        </OptionCategory>

        <OptionCategory label="Textpad">
            <ToggleSetting v-model="config.textpad.focusOnLoad" @change="config.saveTextpadFocusOnLoad" label="Focus on load" />
        </OptionCategory>
    </div>
</template>

<style>
@reference "@/styles/style.css";

.options-option {
    @apply text-xl font-medium py-2;
}
</style>