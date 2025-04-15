<script setup lang="ts">
import useUserStore from '@/stores/user';

const userStore = useUserStore();
</script>

<template>
	<div class="w-full h-full p-4 flex flex-col">
		<div v-if="!userStore.user" class="text-xl">
			You are not signed in
		</div>
		<template v-else>
			<h1 class="font-bold text-4xl!">My Account</h1>
			<div class="flex flex-col bg-primary-300 w-full p-4 rounded-xl">
				<h2 class="text-3xl font-semibold pb-4">Details</h2>
				<div class="flex flex-row">
					<img :src="userStore.user.user_metadata.avatar_url" alt="User avatar" class="size-28 rounded-full mr-4">
					<div class="flex flex-col gap-2 w-full">
						<span class="text-2xl font-black">{{ userStore.user.user_metadata.full_name }}</span>
						<span>
							{{ userStore.user.user_metadata.email }}
							 • 
							{{ userStore.user.user_metadata.plan?.name }}
						</span>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>