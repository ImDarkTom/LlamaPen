<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import useUserStore from '@/stores/user';
import { authedFetch } from '@/utils/core/authedFetch';
import logger from '@/lib/logger';
import setPageTitle from '@/utils/core/setPageTitle';
import { computed, onMounted, ref } from 'vue';
import supabase from '@/lib/supabase';
import isDateBeforeToday from '@/utils/core/isDateBeforeToday';
import { BiBug, BiFile, BiLoaderAlt, BiLogoStripe, BiLogOut, BiMailSend, BiShield, BiSolidCheckSquare, BiTimeFive, BiUserMinus } from 'vue-icons-plus/bi';

const userStore = useUserStore();
const config = useConfigStore();

const loadingSubButtonPage = ref(false);

onMounted(() => {
	if (!config.cloud.enabled) {
		// TODO: Use $router.push once we fix it.
		window.location.href = '/settings';
		return;
	}

	userStore.refreshUserInfo();
	setPageTitle('Account');
});

async function subscriptionButtonClick() {
	loadingSubButtonPage.value = true;
	if (userStore.isPremium) {
		const url = config.requestUrl('/stripe/manage');

		const response = await authedFetch(url);
		const { redirect } = await response.json();

		logger.info('Account Page', 'Got subscription management url: ', redirect);	
		
		window.location.href = redirect;
	} else {
		const url = config.requestUrl('/stripe/checkout');

		const response = await authedFetch(url)	;
		const { redirect } = await response.json();

		logger.info('Account Page', 'Got checkout redirect url: ', redirect);	
		
		window.location.href = redirect;
	}
}

async function deleteAccount() {
	if (confirm('Are you sure you want to delete your account? This cannot be undone. Any subscriptions will be cancelled.')) {
		
		const response = await authedFetch(config.requestUrl('/user/delete-account'), {
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

// Cloud's used token amount only updates when the user sends a request, therefore we can otherwise assume that it is at limit.
const realRemaining = computed(() => {
	const lastUpdatedRaw = userStore.userInfo.usage.lastUpdated;
	if (!lastUpdatedRaw) return userStore.userInfo.usage.remaining;

	if (isDateBeforeToday(lastUpdatedRaw)) {
		// If the date was before today, that means the daily token reset must have happened. 
		return userStore.userInfo.usage.limit;
	} else {
		return userStore.userInfo.usage.remaining;
	}
})

const quotaUsedPercentage = computed(() => (realRemaining.value / userStore.userInfo.usage.limit) * 100);

const subButtonText = computed(() => {
	if (loadingSubButtonPage.value) {
		return userStore.isPremium
			? 'Opening subscription manager...'
			: 'Opening checkout session...';
	}

	return userStore.isPremium
		? 'Manage subscription'
		: 'Subscribe to LlamaPen Premium'
});

const showPriceTag = computed(() => {
	return !loadingSubButtonPage.value && !userStore.isPremium
});

async function signOut() {
    if (!supabase) {
        return;
    }

    await supabase.auth.signOut();
    location.reload();
}

const periodEnd = computed(() => {
	if (!userStore.userInfo.subscription.period_end) return 'Unknown';
	
	return new Date(userStore.userInfo.subscription.period_end * 1000).toLocaleDateString();
});
</script>

<template>
	<div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto px-2
	*:mx-auto *:md:w-4/5 *:lg:w-3/5 *:max-w-3xl">
		<div v-if="userStore.isLoading" class="h-full flex items-center justify-center">
			<BiLoaderAlt class="animate-spin size-12" />
		</div>
		<AccountPageSignIn v-else-if="!userStore.isSignedIn" />
		<div v-else>
			<div class="flex flex-row justify-between items-center">
				<span class="font-bold text-4xl!">My Account</span>
				<ButtonPrimary
					text="Sign out"
					type="button" 
					:icon="BiLogOut"
					@click="signOut" />
			</div>
			<AccountPageSection flex-direction="row">
				<img :src="userStore.userInfo.details.pictureUrl" alt="User avatar" 
				class="size-28 rounded-full outline-2 outline-border-muted">
				<div class="flex flex-col overflow-hidden gap-2">
					<span class="text-text text-2xl font-semibold">{{ userStore.userInfo.details.name }}</span>
					<span>{{ userStore.userInfo.details.email }}</span>
					<span>{{ userStore.subName }} Tier</span>
				</div>
			</AccountPageSection>
			
			<AccountPageSection title="Plan & Usage" flex-direction="col">
				<h3 class="text-2xl">Usage Limits</h3>
				<span v-if="userStore.isLoading">Loading...</span>
				<div v-else class="w-full">
					<span class="flex flex-row">
						<span>
							Messages remaining: <b>{{ realRemaining }}/{{ userStore.userInfo.usage.limit }}</b>
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
				<div v-if="userStore.isPremium" class="flex flex-row gap-2">
					<span class="border-2 border-border-muted rounded-lg p-2">
						Status: <span class="font-semibold capitalize">{{ userStore.userInfo.subscription.status }}</span>
					</span>
					<span 
						v-if="userStore.userInfo.subscription.cancel_at_period_end" 
						class="bg-warning/75 text-background-light p-2 rounded-lg border-2 border-warning flex flex-row gap-2 items-center"
					>
						Ending {{ periodEnd }} <BiTimeFive />
					</span>
					<span 
						v-else
						class="bg-success/75 text-background-light p-2 rounded-lg border-2 border-success flex flex-row gap-2 items-center"
					>
						Renewing on {{ periodEnd }} <BiTimeFive />
					</span>
				</div>
				<div class="w-full flex justify-center">
					<button class="group w-fit flex flex-row text-surface-light hover:text-surface font-semibold bg-linear-to-br from-text to-primary hover:from-secondary hover:scale-105 hover:shadow-primary/50 shadow-transparent shadow-lg shadow- p-1 transition-all duration-dynamic rounded-lg cursor-pointer" @click="subscriptionButtonClick">
						<div class="p-3 flex flex-row gap-2 items-center">
							{{ subButtonText }}
						</div>
						<div v-if="showPriceTag" class="group-hover:text-secondary bg-surface-light group-hover:bg-surface transition-all duration-dynamic text-text-muted flex items-center justify-center p-3 rounded-md">
							€8/mo
						</div>
					</button>
				</div>
				<span class="text-sm flex flex-row gap-1 items-center justify-center"><BiLogoStripe class="size-4" />Payments handled securely by Stripe</span>
				<div v-if="!userStore.isPremium" class="flex flex-col md:flex-row gap-4 md:gap-2">
					<div class="w-full md:w-1/2 border-2 border-border-muted rounded-lg">
						<h4 class="text-xl font-semibold bg-border-muted text-center select-none p-2">Free (current plan)</h4>
						<ul class="p-4 flex flex-col gap-1 *:flex *:flex-row *:gap-2 *:items-center">
							<li><BiSolidCheckSquare class="size-5 shrink-0" />20 message tokens/day</li>
							<li><BiSolidCheckSquare class="size-5 shrink-0"/>Access to free AI models</li>
							<li><BiSolidCheckSquare class="size-5 shrink-0"/>Standard account support</li>
						</ul>
					</div>
					<div class="w-full md:w-1/2 border-2 border-primary rounded-lg bg-surface">
						<h4 class="text-xl font-semibold text-center bg-primary text-background select-none p-2">Premium ✨</h4>
						<ul class="p-4 flex flex-col gap-1 *:flex *:flex-row *:items-start *:gap-2">
							<li><BiSolidCheckSquare class="size-5 shrink-0 text-secondary" /><span><strong>100</strong> message tokens/day</span></li>
							<li><BiSolidCheckSquare class="size-5 shrink-0 text-secondary" /><span>Access to free + <strong>premium</strong> AI models</span></li>
							<li><BiSolidCheckSquare class="size-5 shrink-0 text-secondary" /><span>Priority account support</span></li>
							<li><BiSolidCheckSquare class="size-5 shrink-0 text-secondary" /><span>Message attachments</span></li>
							<li>💖 Support ongoing development</li>
						</ul>
					</div>
				</div>
			</AccountPageSection>
			
			<AccountPageSection title="Contact" flex-direction="col">
				<AccountPageContactSection
					title="Account/billing support"
					description="For account/billing issues, contact us at support@llamapen.app"
					:icon="BiMailSend"
					link="mailto:support@llamapen.app" 
				/>
				<AccountPageContactSection
					title="Terms of Service"
					description="Read the terms of service."
					:icon="BiFile"
					link="https://cloud.llamapen.app/terms" 
				/>
				<AccountPageContactSection
					title="Privacy Policy"
					description="Read the privacy policy."
					:icon="BiShield"
					link="https://cloud.llamapen.app/privacy" 
				/>
				<AccountPageContactSection
					title="App issues"
					description="Found a bug? Report it on the GitHub."
					:icon="BiBug"
					link="https://github.com/ImDarkTom/LlamaPen/issues" 
				/>
			</AccountPageSection>

			<AccountPageSection title="Options">
				<AccountPageOptions />
			</AccountPageSection>

			<AccountPageSection title="Danger Zone">
				<ButtonPrimary
					text="Delete Account"
					color="danger"
					type="button" 
					:icon="BiUserMinus"
					@click="deleteAccount" />
			</AccountPageSection>
		</div>
	</div>
</template>