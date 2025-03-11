<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import CustomUrlButton from './components/CustomUrlButton.vue';
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();

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

onMounted(() => {
    console.log(config.transitionSpeed)
    transitionSpeed.value = config.transitionSpeed;
});

</script>

<template>
    <div class="w-full h-full flex flex-col py-4 px-36 box-border">
        <h1 class="options-title">Settings</h1>
        <h2 class="options-category">Ollama</h2>
        <h3 class="options-option">Ollama URL</h3>
        <CustomUrlButton />

        <h2 class="options-category">UI</h2>
        <h3 class="options-option">Transition Speed</h3>
        <div class="flex flex-col gap-2 w-full">
            <input
                class="accent-primary-200 w-full"
                @change="updateTransitionSpeed" v-model="transitionSpeed" type="range" min="0" max = "1" step="0.025" />
            <span>
                <span class="bg-primary-300 w-fit p-2 rounded-lg text-txt-2 cursor-default">{{ transitionSpeedText }}</span>
                <span class="pl-2 text-txt-2">{{ transitionSpeed == 0.125 ? '(Default)' : '' }}</span>
            </span>
        </div>
    </div>
</template>

<style>
@reference "@/styles/style.css";

.options-title {
    @apply text-4xl font-extrabold;
}

.options-category {
    @apply text-2xl font-bold pt-6;
}

.options-option {
    @apply text-xl pt-4;
}
</style>