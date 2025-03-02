<script lang="ts" setup>
import { computed } from 'vue';
import { useTextpadStore } from '../../stores/allTextpads';
import SidebarEntryTextpad from './SidebarEntryTextpad.vue';

const allTextpads = useTextpadStore();
allTextpads.loadTextpads();

const pinnedTextpads = computed<Textpad[]>(() => {
    return allTextpads.textpads.filter((textpad) => (textpad.pinned || false)).sort((a, b) => (b.lastEdited ?? 0) - (a.lastEdited ?? 0));
});

const hasPinnedTextpads = computed<boolean>(() => {
    return pinnedTextpads.value.length !== 0;
});

const unpinnedTextpads = computed<Textpad[]>(() => {
    return allTextpads.textpads.filter((textpad) => !(textpad.pinned || false)).sort((a, b) => (b.lastEdited ?? 0) - (a.lastEdited ?? 0));
});
</script>

<template>
	<div class="p-0 m-0 flex-1 overflow-y-auto">
		<div class="p-0 m-0 flex-1" role="list" aria-labelledby="pinnedTextpadsSection">
			<h3 id="pinnedTextpadsSection" class="sr-only">Pinned Textpads</h3>
			<SidebarEntryTextpad v-for="textpad of pinnedTextpads" :key="textpad.id" :textpad="textpad" />
		</div>

		<div v-if="hasPinnedTextpads" class="w-full h-[1px] bg-txt-1/50" role="separator"></div>

		<div class="p-0 m-0 flex-1" role="list" aria-labelledby="unpinnedTextpadsSection">
			<h3 id="unpinnedTextpadsSection" class="sr-only">Unpinned Textpads</h3>
			<SidebarEntryTextpad v-for="textpad of unpinnedTextpads" :key="textpad.id" :textpad="textpad" />
		</div>
	</div>
</template>