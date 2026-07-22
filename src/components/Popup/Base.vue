<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui';
import { BiX } from 'vue-icons-plus/bi';

const props = withDefaults(
    defineProps<{
        closeButton?: boolean;
        dismissable?: boolean;
    }>(),
    {
        closeButton: false,
        dismissable: true,
    },
);

const emit = defineEmits<{
    close: [];
}>();

const showing = defineModel('showing', { default: false });

function onEscapeKeyDown(e: KeyboardEvent) {
    if (!props.dismissable) {
        e.preventDefault();
        return;
    }

    emit('close');
}

function onInteractOutside(e: Event) {
    if (!props.dismissable) {
        e.preventDefault();
        return;
    }

    emit('close');
}
</script>

<template>
    <DialogRoot v-model:open="showing">
        <DialogPortal>
            <DialogOverlay
                class="bg-black/50 fixed inset-0 z-99 data-[state=open]:motion-opacity-in-[0%] motion-duration-(--transition-duration)" />
            <DialogContent
                class="flex flex-col w-[calc(100%-1rem)] sm:w-xl lg:w-2xl h-fit max-h-[calc(100%-1rem)] min-h-fit rounded-xl p-6 box-border bg-base-700 absolute top-1/2 left-1/2 -translate-1/2 shadow-elevation-5 z-100 motion-scale-in-75 motion-opacity-in-[75%] motion-duration-100"
                @escape-key-down="onEscapeKeyDown"
                @interact-outside="onInteractOutside">
                <div
                    v-if="closeButton"
                    class="absolute top-0 right-0 p-3">
                    <DialogClose
                        class="p-2 size-10 hover:bg-base-800 rounded-md cursor-pointer"
                        @click="$emit('close')">
                        <BiX />
                    </DialogClose>
                </div>
                <DialogTitle class="text-2xl font-bold flex flex-row items-center gap-2">
                    <slot name="title">Popup</slot>
                </DialogTitle>
                <div class="mt-4 grow line-space overflow-hidden">
                    <slot name="body"></slot>
                </div>
                <div class="flex flex-row gap-6">
                    <slot name="buttons"></slot>
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
