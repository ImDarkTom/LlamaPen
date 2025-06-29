<script setup lang="ts">
import type { ChatMessage } from '~/lib/dexie';

defineProps<{
    message: ChatMessage;
}>();
</script>

<template>
    <article
        class="w-full flex flex-col"
        :class="{
            'items-end': message.role === 'user',
        }"
    >
        <div v-if="message.role === 'assistant'">
            {{ message.content }}
        </div>
        <div
            v-if="message.role === 'user'"
            class="bg-background-light p-4 rounded-lg"
        >
            {{ message.content }}
        </div>
    </article>
</template>
