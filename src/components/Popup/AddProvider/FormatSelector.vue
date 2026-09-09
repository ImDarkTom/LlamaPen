<script setup lang="ts">
import type { CustomProvider } from '@/stores/useCustomProvidersStore';
import { Label } from 'reka-ui';

const model = defineModel<CustomProvider['format']>({ default: 'openai' });

const id = useId();
</script>

<template>
    <div>
        <Label :for="id">API Format</Label>
        <select
            class="w-full bg-base-800 px-6 py-4 rounded-md outline-none ring ring-inset ring-base-600 focus:ring-base-300"
            :id
            v-model="model">
            <option
                value=""
                disabled>
                Select an API format
            </option>

            <option value="ollama">Ollama</option>
            <option value="openai">OpenAI</option>
        </select>
    </div>
</template>
