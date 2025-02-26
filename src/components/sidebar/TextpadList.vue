<script lang="ts" setup>
import { computed } from 'vue';
import { useAllChatsStore } from '../../stores/allChats';
import SidebarEntry from './SidebarEntry.vue';

const allTextpads = useAllChatsStore();
allTextpads.loadChats();

const pinnedChats = computed<Chat[]>(() => {
    return allTextpads.chats.filter((chat) => (chat.pinned || false)).sort((a, b) => (b.lastMessage ?? 0) - (a.lastMessage ?? 0));
});

const hasPinnedChats = computed<boolean>(() => {
    return pinnedChats.value.length !== 0;
});

const unpinnedChats = computed<Chat[]>(() => {
    return allTextpads.chats.filter((chat) => !(chat.pinned || false)).sort((a, b) => (b.lastMessage ?? 0) - (a.lastMessage ?? 0));
});
</script>

<template>
	<div class="p-0 m-0 flex-1 overflow-y-auto">
		<div class="p-0 m-0 flex-1" role="list" aria-labelledby="pinnedChatsSection">
			<h3 id="pinnedChatsSection" class="sr-only">Pinned Chats</h3>
			<SidebarEntry v-for="chat of pinnedChats" :key="chat.id" :chat="chat" />
		</div>

		<div v-if="hasPinnedChats" class="w-full h-[1px] bg-txt-1/50" role="separator"></div>

		<div class="p-0 m-0 flex-1" role="list" aria-labelledby="unpinnedChatsSection">
			<h3 id="unpinnedChatsSection" class="sr-only">Unpinned Chats</h3>
			<SidebarEntry v-for="chat of unpinnedChats" :key="chat.id" :chat="chat" />
		</div>
	</div>
</template>