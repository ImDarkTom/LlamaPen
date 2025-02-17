<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { emitter, PopupButtons } from '../mitt';

const showing = ref<boolean>(false);
const title = ref<string>('Popup');
const message = ref<string>('...');
const buttons = ref<PopupButtons>();

onMounted(() => {
    emitter.on('showErrorPopup', (newMessage) => {
        title.value = "Error";
        message.value = newMessage;
        showing.value = true;
    });

    emitter.on('showPopup', (popupSettings) => {
        title.value = popupSettings.title;
        message.value = popupSettings.messageHtml; // todo: make it render as html
        buttons.value = popupSettings.buttons;
    })

    document.addEventListener('keyup', (e) => handleKeyUp(e))
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
    <div class="absolute top-0 left-0 w-full h-full bg-black/50" 
        :class="{ 'hidden': !showing }"
        aria-labelledby="popupTitle"
        aria-describedby="popupText">
        <div class="flex flex-col w-full sm:w-[70%] lg:w-[50%] h-[60%] rounded-xl p-6 box-border bg-primary-300 absolute top-[50%] left-[50%] -translate-[50%]">
            <h2 id="popupTitle" class="text-3xl font-semibold">{{ title }}</h2>
            <p id="popupText" class="mt-4 grow">{{ message }}</p>
            <div>
                <button v-if="buttons == PopupButtons.CLOSE" class="mt-4 bg-primary-400 w-36 h-12 rounded-xl cursor-pointer hover:font-semibold" @click="close">Close</button>
                <template v-else>
                    <button class="mt-4 bg-primary-400 w-36 h-12 rounded-xl cursor-pointer hover:font-semibold">Ok</button>
                    <button class="mt-4 bg-primary-400 w-36 h-12 rounded-xl cursor-pointer hover:font-semibold">Cancel</button>
                    <!-- todo: have these be able to be ran as a function that returns a boolean based off of what is pressed here like `alert` -->
                </template>
            </div>
        </div>
    </div>
</template>
