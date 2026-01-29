<script setup lang="ts" generic="T">
import { onMounted } from 'vue';
import OptionText from './OptionText.vue';

const props = defineProps<{
	label: string;
    items: string[];
    itemNames: string[];
    tooltip?: string;
}>();

const model = defineModel<T>({ required: true })

onMounted(() => {
    if (props.itemNames.length !== props.items.length) {
        throw new Error(`Selection setting for '${props.label}' has mismatched no. of items and itemNames.`);
    }
});
</script>

<template>
	<label class="w-full flex flex-col justify-between items-start">
		<OptionText :label :tooltip />
		
		<div class="w-full flex flex-row gap-2">
            <select 
                v-model="model" 
                class="w-full p-2 rounded-lg ring-1 ring-border hover:ring-highlight outline-highlight outline-0 focus:outline-2 transition-all duration-dynamic" 
                :aria-label="label" >
                <option 
                    v-for="(item, index) in items" 
                    :key="index" 
                    :value="item">
                    {{ itemNames[index] }}
                </option>
            </select>
		</div>
	</label>
</template>
