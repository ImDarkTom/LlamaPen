<script setup lang="ts">
import MessageInput from './components/MessageInput/MessageInput.vue';
import MessageList from './components/MessageList.vue';
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <MessageList />
        <MessageInput />
    </div>
</template>
