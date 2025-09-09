<script setup lang="ts">
import { ref } from 'vue';
import { BiSolidCheckSquare } from 'vue-icons-plus/bi';

defineProps<{
    message: ToolChatMessage
}>();

const showing = ref<boolean>(false);
</script>

<template>
    <div class="flex flex-col cursor-pointer" @click="showing = !showing">
        <div class="flex flex-row" >
            <span class="text-lg font-semibold">
                <BiSolidCheckSquare class="size-5 mr-1 inline" />
                <span class="align-middle">{{ message.toolName }}</span>
            </span>
            <div class="grow"></div>
            <div>completed (0.1s) placeholder</div>
        </div>
        <div v-if="showing">
            {{ message.content }}
        </div>
    </div>
</template>