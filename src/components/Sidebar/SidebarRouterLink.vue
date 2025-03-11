<!-- Source: https://router.vuejs.org/guide/advanced/extending-router-link.html -->
<script setup>
import { emitter } from '@/mitt';
import { useConfigStore } from '@/stores/config';
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const config = useConfigStore();

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	// add @ts-ignore if using TypeScript
	...RouterLink.props,
	inactiveClass: String,
})

const isExternalLink = computed(() => {
	return typeof props.to === 'string' && props.to.startsWith('http')
});

const handleNavigate = (navigate) => {
	if (window.innerWidth <= 384 && config.closeSidebarOnNavMobile) {
        console.log("hiding sidebar");
        emitter.emit('hideSidebar');
	}

	navigate();
}

</script>

<template>
	<a v-if="isExternalLink" v-bind="$attrs" :href="to" target="_blank">
		<slot />
	</a>
	<router-link v-else v-bind="$props" custom v-slot="{ isActive, href, navigate }">
		<a v-bind="$attrs" :href="href" @click.prevent @mousedown.prevent="handleNavigate(navigate)" :class="isActive ? activeClass : inactiveClass">
			<slot />
		</a>
	</router-link>
</template>