<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import useChatsStore from '@/stores/chatsStore';
import SidebarEntry from './SidebarEntry.vue';
import { TbListDetails } from 'vue-icons-plus/tb';
import { BiWrench } from 'vue-icons-plus/bi';
import { BsKeyboard } from 'vue-icons-plus/bs';

const chatsStore = useChatsStore();
const { pinnedChats, hasPinnedChats, unpinnedChatsByRecent } = storeToRefs(chatsStore);
</script>

<template>
	<div class="grow overflow-y-auto px-2 [scrollbar-width:thin]">
		
		<div class="flex flex-col">
			<SidebarMenuLink
				text="Models"
				:icon="TbListDetails"
				:to="{ path: '/models' }" />

			<SidebarMenuLink
				text="Tools"
				:icon="BiWrench"
				:to="{ path: '/tools' }" />
		</div>

		<UITextDivider
			v-if="hasPinnedChats"
			text="Pinned" />
		<div class="grow" role="list" aria-labelledby="pinnedChatsSection">
			<h3 id="pinnedChatsSection" class="sr-only">Pinned Chats</h3>
			<SidebarEntry 
				v-for="chat of pinnedChats" 
				:key="chat.id" 
				:chat />
		</div>

		<UITextDivider 
			text="Chats" />

		<div class="grow flex flex-col gap-px" role="list" aria-labelledby="unpinnedChatsSection">
			<h3 id="unpinnedChatsSection" class="sr-only">Unpinned Chats</h3>
			<SidebarEntry 
				v-for="chat of unpinnedChatsByRecent" 
				:key="chat.id" 
				:chat />
		</div>

		<div v-if="unpinnedChatsByRecent?.length === 0 && !hasPinnedChats" class="flex h-full items-center justify-center">
			No chats yet...
		</div>
	</div>
</template>