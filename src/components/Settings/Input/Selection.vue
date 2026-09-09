<script setup lang="ts" generic="T">
import { onMounted } from 'vue';

const props = defineProps<{
    label: string;
    items: unknown[] | Record<string, Record<string, string>>;
    itemNames: string[];
    tooltip: string;
}>();

const model = defineModel<T>({ required: true });

onMounted(() => {
    if (Array.isArray(props.items) && props.itemNames.length !== props.items.length) {
        throw new Error(`Selection setting for '${props.label}' has mismatched no. of items and itemNames.`);
    }
});

const inputId = useId();
</script>

<template>
    <div class="min-w-full flex flex-row justify-between items-center">
        <SettingsOptionText
            :label
            :for="inputId"
            :tooltip />

        <select
            v-model="model"
            class="min-w-56 p-2 rounded-lg bg-base-700 hover:bg-base-600 outline-base-500 outline-0 focus:outline-2 transition-all duration-dynamic text-sm! font-medium"
            :id="inputId">
            <template v-if="Array.isArray(items)">
                <option
                    v-for="(item, index) in items"
                    :key="index"
                    :value="item">
                    {{ itemNames[index] }}
                </option>
            </template>
            <template v-else>
                <optgroup
                    v-for="[label, groupItems] in Object.entries(items)"
                    :key="label"
                    :label>
                    <option
                        v-for="[value, label] in Object.entries(groupItems)"
                        :key="value"
                        :value>
                        {{ label }}
                    </option>
                </optgroup>
            </template>
        </select>
    </div>
</template>
