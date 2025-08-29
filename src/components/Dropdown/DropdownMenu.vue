<script setup lang="ts">
defineProps<{
    direction: 'up' | 'down',
    opened: boolean,
    unstyled?: boolean;
    includeNotch?: boolean;
}>();
</script>

<template>
    <Transition 
        :enter-active-class="[
            'motion-scale-in-[0.5]',
            direction === 'up' ? 'motion-translate-y-in-[25%]' : 'motion-translate-y-in-[-25%]',
            'motion-opacity-in-[0%]',
            'motion-duration-[var(--transition-duration)]'
        ].join(' ')" 
        :leave-active-class="[
            'motion-scale-out-[0.5]',
            direction === 'up' ? 'motion-translate-y-out-[25%]' : 'motion-translate-y-out-[-25%]',
            'motion-opacity-out-[0%]',
            'motion-duration-[var(--transition-duration)]'
        ].join(' ')"
    >

        <div v-if="opened"
            class="absolute left-0 w-full box-border z-20"
            :class="{
                'bottom-full mb-2': direction === 'up',
                'top-full mt-2': direction === 'down',
                'bg-surface p-1.5 flex flex-col gap-2 rounded-lg max-w-[100dvw-3rem] w-full sm:w-96 shadow-md shadow-background': !unstyled
            }"
        >
            <div v-if="includeNotch" class="absolute -top-[0.25rem] left-[50%] rotate-45 -translate-x-[50%] w-[1ch] h-[1ch] bg-surface z-[19]"></div>
            <slot />
        </div>
    </Transition>
</template>