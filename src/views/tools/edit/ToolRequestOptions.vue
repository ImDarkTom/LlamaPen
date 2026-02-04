<script setup lang="ts">
import TextInput from '../TextInput.vue';
import SelectInput from '../SelectInput.vue';
import { BiError } from 'vue-icons-plus/bi';

defineProps<{
    toolName: string;
    selectedTool: AppTools[string] | null;
}>();

const bodyPlaceholder = `e.g:
{
    "query": "{{query}}",
    "page": {{page}}
}
`;

</script>

<template>
    <div class="flex flex-col gap-2 bg-surface p-2 rounded-lg" v-if="selectedTool">
        <SelectInput
            v-model="selectedTool.requestOptions.method"
            label="Method"
            :options="['GET', 'POST', 'PUT', 'PATCH']"/>
        <UITextDivider text="Headers" />
        <SelectInput
            label="Accept"
            v-model="selectedTool.requestOptions.accept"
            :options="[
                'application/json', 
                'text/plain',
                'text/html',
                'application/xml',
                '*/*'
            ]" />
        <SelectInput
            label="Content-Type"
            v-model="selectedTool.requestOptions.contentType"
            :options="[
                'application/json', 
                'application/x-www-form-urlencoded',
                'text/plain',
                'application/xml',
                'application/graphql'
            ]" />
        <TextInput
            label="User-Agent"
            v-model="selectedTool.requestOptions.userAgent"
            placeholder="LlamaPen/1.0 (user tool call)" />
        <span class="text-warning">
            <BiError class="inline size-4 mr-1" />
            <span class="align-middle text-sm">Authorization string is saved in local storage unencrypted. Use at your own risk.</span>
        </span>
        <TextInput
            label="Authorization"
            v-model="selectedTool.requestOptions.authorization"
            placeholder="(blank)" />
        <UITextDivider text="Body" />
        <textarea
            class="w-full bg-surface-light p-4 rounded-md"
            rows="5"
            :placeholder="bodyPlaceholder"
            v-model="selectedTool.requestOptions.body"></textarea>
    </div>
</template>