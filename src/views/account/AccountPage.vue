<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import useUserStore from '@/stores/user';
import { authedFetch } from '@/utils/auth';
import logger from '@/utils/logger';
import setPageTitle from '@/utils/title';
import { onMounted } from 'vue';

const userStore = useUserStore();
const config = useConfigStore();

onMounted(() => {
	setPageTitle('My Account');
});

async function subscriptionButtonClick() {
	if (userStore.subscription.subscribed) {
		const url = config.apiUrl('/stripe/manage');

		const response = await authedFetch(url)	;
		const { url: redirect } = await response.json();

		logger.info('Account Page', 'Got subscription management url: ', redirect);	
		
		window.location.href = redirect;
	} else {
		const url = config.apiUrl('/stripe/checkout');

		const response = await authedFetch(url)	;
		const { redirect } = await response.json();

		logger.info('Account Page', 'Got checkout redirect url: ', redirect);	
		
		window.location.href = redirect;
	}
}

async function deleteAccount() {
	if (confirm('Are you sure you want to delete your account? This cannot be undone. Any subscriptions will be cancelled.')) {
		const response = await authedFetch(config.apiUrl('/user/delete-account'), {
			method: 'POST'
		});

		if (response.status !== 200) {
			alert('An error occured deleting your account, try again later.');
			return;
		}

		window.location.href = '/';
	}
}
</script>

<template>
	<div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto px-2
	*:mx-auto *:md:w-4/5 *:lg:w-3/5">
		<div v-if="!userStore.user" class="text-xl">
			You are not signed in
		</div>
		<div class="w-4/5" v-else>
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
							{{ userStore.subscription.name }}
						</span>
					</div>
				</div>
			</div>
			<div class="flex flex-col bg-primary-300 w-full p-4 rounded-xl mt-4">
				<h2 class="text-3xl font-semibold pb-4">Billing</h2>
				<div class="flex flex-row">
					<button class="bg-gradient-to-br from-primary-300 to-primary-400 ring-1 ring-txt-2 p-4 rounded-lg cursor-pointer" @click="subscriptionButtonClick">{{ userStore.subscription.subscribed ? 'Manage Subscription' : 'Subscribe to LlamaPen Explorer' }}</button>
				</div>
			</div>
			<div class="flex flex-col bg-primary-300 w-full p-4 rounded-xl mt-4">
				<h2 class="text-3xl font-semibold pb-4">Actions</h2>
				<div class="bg-red-600 w-fit p-4 rounded-lg cursor-pointer" @click="deleteAccount">Delete Account</div>
			</div>
		</div>
	</div>
</template>