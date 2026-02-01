<script setup lang="ts">
import { computed } from 'vue';
import { emitter } from '@/lib/mitt';
import useUIStore from '@/stores/uiStore';
import { BiSolidDownArrowCircle } from 'vue-icons-plus/bi';
import { storeToRefs } from 'pinia';

const { chatIsScrollingDown } = storeToRefs(useUIStore());

const showButton = computed(() => !chatIsScrollingDown.value);
</script>

<template>
    <Transition 
        :enter-active-class="[
            'motion-translate-y-in-[25%]',
            'motion-opacity-in-[0%]',
            'motion-duration-[var(--transition-duration)]'
        ].join(' ')" 
        :leave-active-class="[
            'motion-translate-y-out-[25%]',
            'motion-opacity-out-[0%]',
            'motion-duration-[var(--transition-duration)]'
        ].join(' ')"
    >
        <span 
            v-if="showButton" 
            class="absolute -top-14 translate-x-0 bg-surface-light font-medium p-2 rounded-lg select-none cursor-pointer shadow-sm shadow-black"
            @click="emitter.emit('scrollToBottom', { force: true })" >
            <BiSolidDownArrowCircle class="size-5 inline mr-2" />
            <span class="align-middle text-sm">Scroll to bottom</span>
        </span>
    </Transition>
</template>