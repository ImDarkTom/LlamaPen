<script setup lang="ts">
import Dropdown from '@/components/Dropdown/Dropdown.vue';
import MessageOption from './MessageOption.vue';
import { useConfigStore } from '@/stores/config';
import { FaWrench } from 'vue-icons-plus/fa';

const config = useConfigStore();

function reset() {
    config.chat.messageOptions.temperature = 0.8;
    config.chat.messageOptions.top_k = 40;
    config.chat.messageOptions.top_p = 0.9;
}

const tooltips = {
    temperature: 'Controls the randomness of the generated text. Lower values produce more predictable and focused responses; higher values make output more creative and diverse.',
    top_k: 'Limits token selection to the K most probable tokens at each decoding step. Larger values allow more variety and randomness.',
    top_p: 'Lower values restrict choices to a smaller set of likely tokens, making output more conservative; higher values allow a wider range of options, increasing creativity.',
    min_p: 'Sets a minimum probability for tokens to be considered. Higher values make output more focused by ignoring unlikely words; lower values let in more variety.',
};
</script>

<template>
    <Dropdown direction="up">
        <template #button>
            <div>
                <FaWrench class="p-1" />
            </div>
        </template>
        <template #menu>
            <div>
                <div class="flex flex-row items-center justify-between">
                    <span class="font-semibold text-lg">Custom Model Parameters</span>
                    <button class="bg-surface-light p-2 rounded-md cursor-pointer hover:bg-primary hover:text-surface-light transition-colors duration-dynamic" @click="reset">Reset</button>
                </div>
                <div class="flex flex-row items-center gap-2 mb-2">
                    <span class="text-sm">Enabled</span>
                    <input type="checkbox" class="cursor-pointer" v-model="config.chat.messageOptionsEnabled" />
                </div>
                <div class="flex flex-col" :class="{ 'opacity-50 pointer-events-none': !config.chat.messageOptionsEnabled }">
                    <MessageOption label="Temperature" :tooltip="tooltips['temperature']" v-model="config.chat.messageOptions.temperature" :min="0" :max="1" :step="0.05" />
                    <MessageOption label="Top K" :tooltip="tooltips['top_k']" v-model="config.chat.messageOptions.top_k" :min="1" :max="200" :step="1" />
                    <MessageOption label="Top P" :tooltip="tooltips['top_p']" v-model="config.chat.messageOptions.top_p" :min="0" :max="1" :step="0.05" />
                    <MessageOption label="Min P" :tooltip="tooltips['min_p']" v-model="config.chat.messageOptions.min_p" :min="0" :max="config.chat.messageOptions.top_p" :step="0.05" />
                </div>
            </div>
        </template>
    </Dropdown>
</template>