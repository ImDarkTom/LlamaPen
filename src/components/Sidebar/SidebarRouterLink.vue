<script setup lang="ts">
// https://router.vuejs.org/guide/advanced/extending-router-link.html

import { emitter } from '@/lib/mitt';
import { useConfigStore } from '@/stores/config';
import isOnMobile from '@/utils/core/isOnMobile';
import { computed } from 'vue'
import { RouterLink, type NavigationFailure } from 'vue-router'

const config = useConfigStore();

defineOptions({
	inheritAttrs: false,
})

defineSlots<{
	default: void,
	isActive: Boolean,
}>()

const props = defineProps({
	// @ts-ignore
	...RouterLink.props,
	activeClass: String,
	inactiveClass: String,
})

const isExternalLink = computed(() => {
	return typeof props.to === 'string' && props.to.startsWith('http')
});

const handleNavigate = (navigate: (e?: MouseEvent) => Promise<void | NavigationFailure>) => {
	if (isOnMobile() && config.closeSidebarOnNavMobile) {
		console.log("hiding sidebar");
		emitter.emit('hideSidebar');
	}

	navigate();
}

</script>

<template>
	<a v-if="isExternalLink" v-bind="$attrs" :href="props.to" target="_blank">
		<slot></slot>
	</a>
	<router-link v-else to="" v-bind="$props" custom v-slot="{ isActive, href, navigate }">
		<a v-bind="$attrs" :href="href" @click.prevent @mousedown.prevent="handleNavigate(navigate)"
			:class="isActive ? props.activeClass : props.inactiveClass">
			<slot></slot>
		</a>
	</router-link>
</template>