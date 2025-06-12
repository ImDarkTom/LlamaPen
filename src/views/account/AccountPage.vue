<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import useUserStore from '@/stores/user';
import { authedFetch } from '@/utils/core/authedFetch';
import logger from '@/lib/logger';
import setPageTitle from '@/utils/core/setPageTitle';
import { computed, onMounted, ref } from 'vue';
import AccountSection from './components/AccountSection.vue';
import supabase from '@/lib/supabase';

const userStore = useUserStore();
const config = useConfigStore();

const loadingSubButtonPage = ref(false);

onMounted(() => {
	setPageTitle('My Account');
});

async function subscriptionButtonClick() {
	loadingSubButtonPage.value = true;
	if (userStore.subscription.subscribed) {
		const url = config.apiUrl('/stripe/manage');

		const response = await authedFetch(url)	;
		const { redirect } = await response.json();

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
		
		supabase?.auth.signOut();
		window.location.href = '/';
	}
}

// API's used token amount only updates when the user sends a request, therefore we can otherwise assume that it is at limit.
const realRemaining = computed(() => {
	const lastUpdatedRaw = userStore.subscription.remaining_last_updated;
	if (!lastUpdatedRaw) return userStore.subscription.remaining;

	// The server gives us the last updated day as an ISO string, but the client time is in any timezone,
	// so we get the current date, set time to midnight, convert to iso, and compare the dates string then.
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const todayISOString = today.toISOString().slice(0, 10);

	// dates are lexicographically sortable, meaning this works
	if (todayISOString > lastUpdatedRaw) {
		return userStore.subscription.limit;
	} else {
		return userStore.subscription.remaining;
	}
})

const quotaUsedPercentage = computed(() => (realRemaining.value / userStore.subscription.limit) * 100)
</script>

<template>
	<div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto px-2
	*:mx-auto *:md:w-4/5 *:lg:w-3/5">
		<div v-if="!userStore.user" class="text-xl">
			You are not signed in
		</div>
		<div class="w-4/5" v-else>
			<h1 class="font-bold text-4xl!">My Account</h1>
			<AccountSection title="Details">
				<img :src="userStore.user.user_metadata.avatar_url" alt="User avatar" class="size-28 rounded-full mr-4">
				<div class="flex flex-col gap-2 w-full">
					<span class="text-2xl font-black">{{ userStore.user.user_metadata.full_name }}</span>
					<span>
						{{ userStore.user.user_metadata.email }}
						 • 
						{{ userStore.subscription.name }}
					</span>
				</div>
			</AccountSection>

			<AccountSection title="Subscription" flex-direction="col">
				<button class="w-fit bg-gradient-to-br from-primary-300 to-primary-400 ring-1 ring-txt-2 p-4 rounded-lg cursor-pointer" @click="subscriptionButtonClick">
					{{ loadingSubButtonPage ? 
						'Loading...' :
						userStore.subscription.subscribed ? 'Manage Subscription' : 'Subscribe to LlamaPen Explorer' }}
				</button>
				<span class="text-2xl mt-4">Usage Limits</span>
				<span v-if="userStore.subscription.name === 'Loading...'">Loading...</span>
				<div v-else class="w-full">
					<span class="flex flex-row">
						<span>
							Messages/edits remaining: <b>{{ realRemaining }}/{{ userStore.subscription.limit }}</b>
						</span>
						<div class="grow"></div>
						<span>Resets daily at 00:00 EST</span>
					</span>
					<div class="mt-2 h-8 w-full bg-txt-2 rounded-xl">
						<div 
							class="h-full bg-primary-50 rounded-xl"
							:style="`width: ${quotaUsedPercentage}%;`"
						></div>
					</div>
				</div>
			</AccountSection>

			<AccountSection title="Actions">
				<div class="bg-red-600 w-fit p-4 rounded-lg cursor-pointer" @click="deleteAccount">Delete Account</div>
			</AccountSection>
		</div>
	</div>
</template>