<script setup lang="ts">
import { Label } from 'reka-ui';
import { BiHelpCircle, BiHide, BiShow } from 'vue-icons-plus/bi';

withDefaults(
    defineProps<{
        label: string;
        type?: HTMLInputElement['type'];
        tooltip?: string;
        placeholder?: string;
        required?: HTMLInputElement['required'];
        list?: string;
        disabled?: boolean;
    }>(),
    {
        type: 'text',
    },
);

const value = defineModel();
const id = useId();

const showingPassword = ref(false);
</script>

<template>
    <div>
        <div class="inline-flex items-center gap-1">
            <Label :for="id">{{ label }}</Label>
            <Tooltip
                v-if="tooltip"
                :text="tooltip"
                size="small">
                <BiHelpCircle class="size-4 text-base-300 cursor-help" />
            </Tooltip>
        </div>
        <div class="flex flex-row gap-2">
            <UIInput
                :type="showingPassword ? 'text' : type"
                :placeholder
                v-model="value"
                :required
                :list
                :id
                :disabled />
            <button
                v-if="type === 'password'"
                class="p-4 hover:bg-base-600 rounded-md"
                @click="showingPassword = !showingPassword">
                <BiShow v-if="!showingPassword" />
                <BiHide v-else />
            </button>
        </div>
    </div>
</template>
