<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { emitter } from '../mitt';

const showing = ref<boolean>(false);
const message = ref<string>('...');

onMounted(() => {
    emitter.on('showPopup', (newMessage) => {
        message.value = newMessage;
        showing.value = true;
    });
})

</script>

<template>
    <div class="absolute top-0 left-0 w-full h-full bg-black/50" :class="{ 'hidden': !showing }">
        <div class="w-40 h-40 bg-primary-300 absolute top-[50%] left-[50%] -translate-[50%]">
            <div>{{ message }}</div>
        </div>
    </div>
</template>
