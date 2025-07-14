<script setup lang="ts">
import router from '@/lib/router';
import useUserStore from '@/stores/user';
import { AiFillStar, AiOutlineArrowRight, AiOutlineEye, AiOutlineTool } from 'vue-icons-plus/ai';
import { BsGlobe } from 'vue-icons-plus/bs';
import ModelIcon from '../Icon/ModelIcon.vue';
import { computed, ref } from 'vue';
import { useModelCapabiltyCache } from '@/composables/modelCapabilities';
import { BiBrain } from 'vue-icons-plus/bi';

const userStore = useUserStore();

const { cachedCapabilities } = useModelCapabiltyCache();

const props = defineProps<{
	model: ModelListItem,
	index: number,
	isCurrentModel: boolean,
	selected: boolean,
	queriedModelList: ModelList,
}>();

const emit = defineEmits<(e: 'setModel', name: string) => void>();

function setModel(model: ModelListItem) {
	if (model.llamapenMetadata?.premium) {
		if (userStore.subscription.subscribed) {
			emit('setModel', model.model);
		} else {
			router.push('/account#plan');
		}
	} else {
		emit('setModel', model.model);
	}
}

const listItemRef = ref<HTMLLIElement | null>(null);
defineExpose({
	listItemRef
});

const modelCapabilities = computed(() => {
	return props.model.capabilities || cachedCapabilities.value[props.model.model] || [];
});
</script>

<template>
	<li class="relative group flex flex-row gap-3 cursor-pointer p-3 hover:bg-surface-light transition-colors duration-dynamic rounded-lg overflow-x-hidden"
		:class="{
			'bg-surface-light': selected && !isCurrentModel,
			'bg-surface-light ring-2 ring-border ring-inset': isCurrentModel,
			'opacity-75': !userStore.subscription.subscribed && model.llamapenMetadata?.premium
		}" @click="setModel(model)" ref="listItemRef" :aria-selected="selected">

		<ModelIcon :name="model.model" class="size-10 p-1" />

		<div class="flex flex-col">
			<div class="flex flex-row items-center">
				<span 
					class="text-md font-semibold text-ellipsis whitespace-nowrap overflow-hidden text-text"
					:title="model.name"
				>
					{{ model.name}}
				</span>
				<div class="flex flex-row gap-2 ml-2 shrink-0 min-w-fit">
					<div v-if="model.llamapenMetadata?.premium"
						class="bg-yellow-400/25 rounded-sm ring-1 ring-yellow-400 p-0.5">
						<AiFillStar class="text-yellow-400 size-4" />
					</div>
					<!-- Capability tags -->
					<div v-if="modelCapabilities.includes('vision')"
						class="bg-green-400/25 rounded-sm ring-1 ring-green-400 p-0.5">
						<AiOutlineEye class="text-green-400 size-4" />
					</div>
					<div v-if="modelCapabilities.includes('thinking')"
						class="bg-violet-400/25 rounded-sm ring-1 ring-violet-400 p-0.5">
						<BiBrain class="text-violet-400 size-4" />
					</div>
					<div v-if="modelCapabilities.includes('tools')"
						class="bg-blue-400/25 rounded-sm ring-1 ring-blue-400 p-0.5">
						<AiOutlineTool class="text-blue-400 size-4" />
					</div>
					<div v-if="modelCapabilities.includes('search')"
						class="bg-violet-400/25 rounded-sm ring-1 ring-pink-400 p-0.5">
						<BsGlobe class="text-pink-400 size-4" />
					</div>
				</div>
			</div>
			<span class="text-sm text-text-muted">{{ model.details.parameter_size }}</span>
			<div class="absolute text-text hidden items-center justify-center right-0 top-0 h-full w-16 bg-gradient-to-r from-transparent to-surface-light group-hover:flex"
				:class="{ 
					'!flex': selected,
					'!to-border': isCurrentModel,
				}">
				<AiOutlineArrowRight class="size-8" />
			</div>
		</div>
	</li>
</template>