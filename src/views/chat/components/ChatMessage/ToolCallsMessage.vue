<script setup lang="ts">
import { ref } from 'vue';
import { BiLoaderAlt, BiSolidCheckSquare } from 'vue-icons-plus/bi';

defineProps<{
    message: ToolChatMessage
}>();

const showing = ref<boolean>(false);
</script>

<template>
    <div class="flex flex-col cursor-pointer" @click="showing = !showing">
        <div class="flex flex-row items-center" >
            <span class="text-lg font-semibold">
                <component 
                    :is="message.completed ? BiSolidCheckSquare : BiLoaderAlt" 
                    class="size-5 mr-1 inline" 
                    :class="{ 'animate-spin': !message.completed }" />
                <span class="align-middle">
                    {{ message.toolName }}
                </span>
            </span>
            <div class="grow"></div>
            <span :title="message.completed?.toLocaleString() ?? ''">
                <template v-if="message.completed">
                    Completed ({{ ((message.completed.getTime()  - message.created.getTime()) / 1000).toFixed(2) }}s)
                </template>
                <template v-else>
                    Processing...
                </template>
            </span>
        </div>
        <pre v-if="showing" class="max-w-full whitespace-pre-wrap break-words bg-background-light p-1 rounded-lg mt-2">{{ message.content }}</pre>
    </div>
</template>