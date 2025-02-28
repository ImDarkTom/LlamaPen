<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { emitter, PopupButtons } from '../../mitt';
import { BiSolidErrorCircle } from 'vue-icons-plus/bi';

const showing = ref<boolean>(false);
const title = ref<string>('Popup');
const message = ref<string>('...');
const buttons = ref<PopupButtons>();

onMounted(() => {
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

function close() {
    showing.value = false;
}
</script>

<template>
    <div class="absolute top-0 left-0 w-full h-full bg-black/50
        motion-opacity-in-[75%] motion-duration-[0.1s]" 
        :class="{ 'hidden': !showing }"
        aria-labelledby="popupTitle"
        aria-describedby="popupText">
        <div class="flex flex-col w-full sm:w-[70%] lg:w-[50%] h-[60%] rounded-xl p-6 box-border bg-gradient-to-br from-primary-300 to-primary-400 absolute top-[50%] left-[50%] -translate-[50%] shadow-md shadow-black border-[1px] border-txt-2/50
            motion-scale-in-[0.75] motion-opacity-in-[75%] motion-blur-in-[2px] motion-duration-[0.1s]">
            <h2 id="popupTitle" class="text-3xl font-semibold flex flex-row items-center gap-2"><BiSolidErrorCircle class="h-full w-auto" />{{ title }}</h2>
            <p id="popupText" class="mt-4 grow text-lg line-space">{{ message }}</p>
            <div>
                <button class="mt-4 bg-txt-2 text-primary-400 font-semibold hover:shadow-sm shadow-black/50 hover:scale-105 transition-all duration-100 w-36 h-12 rounded-xl cursor-pointer" @click="close">Close</button>
            </div>
        </div>
    </div>
</template>
