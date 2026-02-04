<script setup lang="ts">
import { BiTimeFive } from 'vue-icons-plus/bi';

defineProps<{
    message: ModelChatMessage
    modelMessageDone: boolean;
}>();
</script>

<template>
    <div class="group/msg-header flex flex-row items-center gap-2 mb-2">
        <IconModel 
            class="size-10 p-2 bg-border-muted rounded-full ring-1 ring-border" 
            :name="message.model"
            :ignore-styling="true" />

        <ChatMessageModelSelector 
            :message
            :modelMessageDone />
            
        <div class="grow"></div>

        <div
            class="hidden md:block items-center opacity-0 group-hover/msg-header:opacity-100 transition-opacity duration-dynamic group-hover/msg-header:duration-0">
            <BiTimeFive class="inline mr-1" /><span class="items-center">{{ message.created.toLocaleString() }}</span>
        </div>
    </div>
</template>