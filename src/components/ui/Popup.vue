<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { emitter, PopupButtons } from '../../mitt';

const showing = ref<boolean>(false);
const title = ref<string>('Popup');
const message = ref<string>('...');
const buttons = ref<PopupButtons>();

onMounted(() => {
    // todo: actually use this
    emitter.on('showErrorPopup', (newMessage) => {
        title.value = "Error";
        message.value = newMessage;
        showing.value = true;
        buttons.value = PopupButtons.CLOSE;
    });

    document.addEventListener('keyup', handleKeyUp)
});

onBeforeUnmount(() => {
    emitter.off('showErrorPopup');

    document.removeEventListener('keyup', handleKeyUp);
});

function handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        close();
    }
}

const props = defineProps<{
    showing: boolean,
}>();
</script>

<template>
    <div class="absolute top-0 left-0 w-full h-svh bg-black/50 backdrop-blur-xs z-[99]
        motion-opacity-in-[75%] motion-duration-[0.1s]" :class="{ 'hidden': !props.showing }"
        aria-labelledby="popupTitle" aria-describedby="popupText">
        <div class="flex flex-col w-full sm:w-[70%] lg:w-[50%] h-auto sm:h-auto md:h-[60%] rounded-xl p-6 box-border bg-gradient-to-br from-primary-300 to-primary-400 absolute top-[50%] left-[50%] -translate-[50%] shadow-lg shadow-black border-[1px] border-txt-2/50 z-100
            motion-scale-in-[0.75] motion-opacity-in-[75%] motion-blur-in-[2px] motion-duration-[0.1s]">
            <h2 id="popupTitle" class="text-3xl font-semibold flex flex-row items-center gap-2">
                <slot name="title">Popup</slot>
            </h2>
            <p id="popupText" class="mt-4 grow text-lg line-space">
                <slot name="body"></slot>
            </p>
            <div class="*:mt-4 *:bg-txt-2 *:text-primary-400 *:font-semibold *:hover:shadow-sm *:shadow-black/50 *:hover:scale-105 *:transition-all *:duration-100 *:w-36 *:h-12 *:rounded-xl *:cursor-pointer
                flex flex-row gap-6">
                <slot name="buttons"></slot>
            </div>
        </div>
    </div>
</template>
