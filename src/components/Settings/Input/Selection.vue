<script setup lang="ts" generic="T">
import { onMounted } from 'vue';

const props = defineProps<{
	label: string;
    items: string[] | Record<string, Record<string, string>>;
    itemNames: string[];
    tooltip?: string;
}>();

const model = defineModel<T>({ required: true })

onMounted(() => {
    if (Array.isArray(props.items) && props.itemNames.length !== props.items.length) {
        throw new Error(`Selection setting for '${props.label}' has mismatched no. of items and itemNames.`);
    }
});
</script>

<template>
	<label class="w-full flex flex-col justify-between items-start">
		<SettingsOptionText :label :tooltip />
		
		<div class="w-full flex flex-row gap-2">
            <select 
                v-model="model" 
                class="w-full p-2 rounded-lg ring-1 ring-base-400 hover:ring-base-300 outline-base-300 outline-0 focus:outline-2 transition-all duration-dynamic" 
                :aria-label="label" >
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
	</label>
</template>
