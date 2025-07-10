<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import useUserStore from '@/stores/user';
import { authedFetch } from '@/utils/core/authedFetch';
import logger from '@/lib/logger';
import setPageTitle from '@/utils/core/setPageTitle';
import { computed, onMounted, ref } from 'vue';
import AccountSection from './components/AccountSection.vue';
import supabase from '@/lib/supabase';
import isDateBeforeToday from '@/utils/core/isDateBeforeToday';
import { BsCheckSquareFill } from 'vue-icons-plus/bs';

const userStore = useUserStore();
const config = useConfigStore();

const loadingSubButtonPage = ref(false);

onMounted(() => {
	userStore.refreshSubInfo();
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

	if (isDateBeforeToday(lastUpdatedRaw)) {
		// If the date was before today, that means the daily token reset must have happened. 
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
			<AccountSection flex-direction="row">
				<img :src="userStore.user.user_metadata.avatar_url" alt="User avatar" 
				class="size-28 rounded-full outline-2 outline-border-muted">
				<div class="flex flex-col gap-2">
					<span class="text-text text-2xl font-semibold">{{ userStore.user.user_metadata.full_name }}</span>
					<span>{{ userStore.user.user_metadata.email }}</span>
					<span>{{ userStore.subscription.name }} Tier</span>
				</div>
			</AccountSection>
			
			<AccountSection title="Plan & Usage" flex-direction="col">
				<h3 class="text-2xl">Usage Limits</h3>
				<span v-if="userStore.subscription.name === 'Loading...'">Loading...</span>
				<div v-else class="w-full">
					<span class="flex flex-row">
						<span>
							Messages remaining: <b>{{ realRemaining }}/{{ userStore.subscription.limit }}</b>
						</span>
						<div class="grow"></div>
						<span>Resets daily at 00:00 UTC</span>
					</span>
					<div class="mt-2 h-8 w-full bg-surface-light rounded-xl">
						<div 
							class="h-full bg-primary rounded-xl"
							:style="`width: ${quotaUsedPercentage}%;`"
						></div>
					</div>
				</div>
				<h3 class="text-2xl" id="plan">Plan</h3>
				<div class="w-full flex justify-center">
					<button class="group w-fit flex flex-row text-surface-light hover:text-surface font-semibold bg-gradient-to-br from-text to-primary hover:from-secondary hover:scale-105 hover:shadow-secondary/50 shadow-transparent shadow-lg shadow- p-1 transition-all duration-dynamic rounded-lg cursor-pointer" @click="subscriptionButtonClick">
						<div class="p-3">
							{{ loadingSubButtonPage ? 
								'Opening checkout session...' :
								userStore.subscription.subscribed ? 
									'Manage Subscription' : 
									'Subscribe to LlamaPen Explorer'
							}}
						</div>
						<div v-if="!loadingSubButtonPage && !userStore.subscription.subscribed" class="group-hover:text-secondary bg-surface-light group-hover:bg-surface transition-all duration-dynamic text-text-muted flex items-center justify-center p-3 rounded-md">
							€8/mo
						</div>
					</button>
				</div>
				<div v-if="userStore.subscription.name !== 'Premium'" class="flex flex-row gap-2">
					<div class="w-1/2 border-2 border-border-muted rounded-lg">
						<h4 class="text-xl font-semibold bg-border-muted text-center select-none p-2">Free (current plan)</h4>
						<ul class="p-4 flex flex-col gap-1 *:flex *:flex-row *:gap-2 *:items-center">
							<li><BsCheckSquareFill class="size-5 shrink-0" /> 20 message tokens/day</li>
							<li><BsCheckSquareFill class="size-5 shrink-0"/> Access to free AI models</li>
						</ul>
					</div>
					<div class="w-1/2 border-2 border-primary rounded-lg bg-surface">
						<h4 class="text-xl font-semibold text-center bg-primary text-background select-none p-2">Premium</h4>
						<ul class="p-4 flex flex-col gap-1 *:flex *:flex-row *:items-start *:gap-2">
							<li><BsCheckSquareFill class="size-5 shrink-0 text-secondary" /> 100 message tokens/day</li>
							<li><BsCheckSquareFill class="size-5 shrink-0 text-secondary" /> Access to free + premium AI models</li>
							<li>💖 Support development</li>
						</ul>
					</div>
				</div>
			</AccountSection>

			<AccountSection title="Danger Zone">
				<div class="bg-danger text-background w-fit p-4 rounded-lg cursor-pointer" @click="deleteAccount">Delete Account</div>
			</AccountSection>
		</div>
	</div>
</template>