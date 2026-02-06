<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';

onMounted(() => {
    document.addEventListener('keyup', handleKeyUp)
});

onBeforeUnmount(() => {
    document.removeEventListener('keyup', handleKeyUp);
});

function handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        emit('close');
    }
}

const props = defineProps<{
    showing: boolean,
}>();

const emit = defineEmits<{
    close: []
}>();
</script>

<template>
    <div class="absolute top-0 left-0 w-full h-svh bg-black/50 z-99
        motion-opacity-in-[75%] motion-duration-100" :class="{ 'hidden': !props.showing }"
        aria-labelledby="popupTitle" aria-describedby="popupText">
        <div class="flex flex-col w-[calc(100%)-1rem] sm:w-xl lg:w-2xl h-auto sm:h-auto md:h-[60%] rounded-xl p-6 box-border bg-surface absolute top-[50%] left-[50%] -translate-[50%] shadow-elevation-5 z-100
            motion-scale-in-75 motion-opacity-in-[75%] motion-duration-100">
            <h2 id="popupTitle" class="text-3xl font-semibold flex flex-row items-center gap-2">
                <slot name="title">Popup</slot>
            </h2>
            <p id="popupText" class="mt-4 grow text-lg line-space">
                <slot name="body"></slot>
            </p>
            <div class="*:mt-4 *:bg-primary *:text-surface *:font-semibold *:hover:bg-secondary *:transition-colors *:duration-dynamic *:w-36 *:h-12 *:rounded-md *:cursor-pointer
                flex flex-row gap-6">
                <slot name="buttons"></slot>
            </div>
        </div>
    </div>
</template>
