<script setup lang="ts">
import router from '@/lib/router';
import useUserStore from '@/stores/user';
import { AiFillStar, AiOutlineArrowRight, AiOutlineEye, AiOutlineTool } from 'vue-icons-plus/ai';
import { BsGlobe } from 'vue-icons-plus/bs';
import ModelIcon from '../Icon/ModelIcon.vue';
import { computed, ref } from 'vue';
import { BiBrain, BiLock } from 'vue-icons-plus/bi';
import { useConfigStore } from '@/stores/config';
import { useModelList, type ModelInfoListItem } from '@/composables/useModelList';

const userStore = useUserStore();
const config = useConfigStore();
const { getModelCapabilities } = useModelList();

const props = defineProps<{
	model: ModelInfoListItem,
	index: number,
	isCurrentModel: boolean,
	selected: boolean,
}>();

const emit = defineEmits<(e: 'setModel', model: ModelListItem) => void>();

function setModel(model: ModelListItem) {
	if (config.api.enabled && !userStore.isSignedIn) {
		// Show toast to sign in
		router.push('/account');
		return;
	} else if (model.llamapenMetadata?.premium && !userStore.subscription.subscribed) {
		// Show toast to check out premium
		router.push('/account#plan');
		return;
	}

	emit('setModel', model);
}

const listItemRef = ref<HTMLLIElement | null>(null);
defineExpose({
	listItemRef
});

const modelCapabilities = computed(() => getModelCapabilities(props.model));
</script>

<template>
	<li class="relative group flex flex-row gap-3 cursor-pointer p-3 hover:bg-surface-light transition-colors duration-dynamic rounded-lg overflow-x-hidden"
		:class="{
			'bg-surface-light': selected && !isCurrentModel,
			'bg-surface-light ring-2 ring-border ring-inset': isCurrentModel,
			'opacity-50': (!userStore.subscription.subscribed && model.modelData.llamapenMetadata?.premium) || (config.api.enabled && !userStore.isSignedIn),
		}" @click="setModel(model.modelData)" ref="listItemRef" :aria-selected="selected">

		<ModelIcon :name="model.modelData.model" class="size-10 p-1" />

		<div class="flex flex-col">
			<div class="flex flex-row items-center">
				<span 
					class="text-md font-semibold text-ellipsis whitespace-nowrap overflow-hidden text-text"
					:title="model.modelData.model"
				>
					{{ model.displayName}}
				</span>
				<div class="flex flex-row gap-2 ml-2 shrink-0 min-w-fit">
					<div 
						v-if="model.modelData.llamapenMetadata?.premium"
						class="bg-yellow-400/25 rounded-sm ring-1 ring-yellow-400 p-0.5"
						title="Premium model - requires an active LlamaPen API Premium subscription">
						<AiFillStar class="text-yellow-400 size-4" />
					</div>
					<!-- Capability tags -->
					<div 
						v-if="modelCapabilities.includes('vision')"
						class="bg-green-400/25 rounded-sm ring-1 ring-green-400 p-0.5"
						title="Vision - can process images">
						<AiOutlineEye class="text-green-400 size-4" />
					</div>
					<div 
						v-if="modelCapabilities.includes('thinking')"
						class="bg-violet-400/25 rounded-sm ring-1 ring-violet-400 p-0.5 flex flex-row"
						:title="model.modelData.llamapenMetadata?.tags?.includes('alwaysReasons') 
							? 'Locked reasoning - always uses reasoning capabilities' 
							: 'Thinking - toggleable enhanced reasoning capabilities'">
						<BiBrain class="text-violet-400 size-4" />
						<BiLock
							v-if="model.modelData.llamapenMetadata?.tags?.includes('alwaysReasons')"
							class="text-violet-400 size-4" />
					</div>
					<div 
						v-if="modelCapabilities.includes('tools')"
						class="bg-blue-400/25 rounded-sm ring-1 ring-blue-400 p-0.5"
						title="Tools - can use external tools (to be added)">
						<AiOutlineTool class="text-blue-400 size-4" />
					</div>
					<div 
						v-if="modelCapabilities.includes('search')"
						class="bg-violet-400/25 rounded-sm ring-1 ring-pink-400 p-0.5"
						title="Web search - can access and search the web">
						<BsGlobe class="text-pink-400 size-4" />
					</div>
				</div>
			</div>
			<span class="text-sm text-text-muted">{{ model.modelData.details.parameter_size }}</span>
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