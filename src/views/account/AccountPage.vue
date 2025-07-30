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
import { BsCheckSquareFill, BsGoogle, BsStripe } from 'vue-icons-plus/bs';
import { BiTimeFive } from 'vue-icons-plus/bi';
import { CgFileDocument } from 'vue-icons-plus/cg';
import { FiMail, FiShield } from 'vue-icons-plus/fi';
import ContactSection from './components/ContactSection.vue';
import { FaBug } from 'vue-icons-plus/fa';
import ButtonSetting from '../settings/components/ButtonSetting.vue';
import { PiSignOutBold } from 'vue-icons-plus/pi';
import { IpPeopleDeleteOne } from 'vue-icons-plus/ip';

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

const quotaUsedPercentage = computed(() => (realRemaining.value / userStore.subscription.limit) * 100);

const subButtonText = computed(() => {
	if (loadingSubButtonPage.value) {
		return userStore.subscription.subscribed
			? 'Opening subscription manager...'
			: 'Opening checkout session...';
	}

	return userStore.subscription.subscribed
		? 'Manage subscription'
		: 'Subscribe to LlamaPen Premium'
});

const showPriceTag = computed(() => {
	return !loadingSubButtonPage && !userStore.subscription.subscribed
});

async function signOut() {
    if (!supabase) {
        return;
    }

    await supabase.auth.signOut();
    location.reload();
}

const isSigningIn = ref(false);

async function signIn() {
    if (!supabase) {
        return;
    }

	isSigningIn.value = true;

    const { data: _data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });

    if (error) {
        alert('Error attempting sign in, ' + error);
    }
}
</script>

<template>
	<div class="w-full h-full flex flex-col items-center py-4 box-border overflow-y-auto px-2
	*:mx-auto *:md:w-4/5 *:lg:w-3/5">
		<div v-if="!userStore.user" class="w-4/5 flex flex-col items-center justify-center h-full">
			<AccountSection class="items-center justify-center" flex-direction="col">
				<div class="flex flex-col items-center gap-4">
					<RouterLink to="/settings" class="text-primary! hover:underline">← Back to Settings</RouterLink>
					<span class="font-bold text-xl">Welcome to LlamaPen API</span>
					<ButtonSetting v-if="!userStore.isSignedIn" @click="signIn" class="font-medium px-16" :class="{ 'opacity-75': isSigningIn }"><BsGoogle /> {{ isSigningIn ? 'Signing in...' : 'Continue with Google' }}</ButtonSetting>
					<span>
						By signing up, you agree to our 
						<a href="https://api.llamapen.app/terms" target="_blank" class="text-secondary hover:underline">Terms of Service</a> 
						and 
						<a href="https://api.llamapen.app/privacy" target="_blank" class="text-secondary hover:underline">Privacy Policy</a>.
					</span>
				</div>
			</AccountSection>
		</div>
		<div class="w-4/5" v-else>
			<h1 class="font-bold text-4xl!">My Account</h1>
			<AccountSection flex-direction="row" :apart="true">
				<ButtonSetting type="link" to="/settings" >
					← Go to Settings
				</ButtonSetting>
				<ButtonSetting type="button" @click="signOut" >
					<PiSignOutBold /> Sign out
				</ButtonSetting>
			</AccountSection>
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
				<div v-if="userStore.subscription.subscribed" class="flex flex-row gap-2">
					<span class="border-2 border-border-muted rounded-lg p-2">
						Status: <span class="font-semibold capitalize">{{ userStore.subscription.status }}</span>
					</span>
					<span 
						v-if="userStore.subscription.cancel_at_period_end" 
						class="bg-warning/75 text-background-light p-2 rounded-lg border-2 border-warning flex flex-row gap-2 items-center"
					>
						Ending {{ new Date(userStore.subscription.period_end * 1000).toLocaleDateString() }} <BiTimeFive />
					</span>
					<span 
						v-else
						class="bg-success/75 text-background-light p-2 rounded-lg border-2 border-success flex flex-row gap-2 items-center"
					>
						Renewing on {{ new Date(userStore.subscription.period_end * 1000).toLocaleDateString() }} <BiTimeFive />
					</span>
				</div>
				<div class="w-full flex justify-center">
					<button class="group w-fit flex flex-row text-surface-light hover:text-surface font-semibold bg-gradient-to-br from-text to-primary hover:from-secondary hover:scale-105 hover:shadow-primary/50 shadow-transparent shadow-lg shadow- p-1 transition-all duration-dynamic rounded-lg cursor-pointer" @click="subscriptionButtonClick">
						<div class="p-3 flex flex-row gap-2 items-center">
							<BsStripe />
							{{ subButtonText }}
						</div>
						<div v-if="showPriceTag" class="group-hover:text-secondary bg-surface-light group-hover:bg-surface transition-all duration-dynamic text-text-muted flex items-center justify-center p-3 rounded-md">
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
			
			<AccountSection title="Contact" flex-direction="col">
				<ContactSection
					title="Account/billing support"
					description="For account/billing issues, contact us at support@llamapen.app"
					:icon="FiMail"
					link="mailto:support@llamapen.app" 
				/>
				<ContactSection
					title="Terms of Service"
					description="Read the terms of service."
					:icon="CgFileDocument"
					link="https://api.llamapen.app/terms" 
				/>
				<ContactSection
					title="Privacy Policy"
					description="Read the privacy policy."
					:icon="FiShield"
					link="https://api.llamapen.app/privacy" 
				/>
				<ContactSection
					title="App issues"
					description="Found a bug? Report it on the GitHub."
					:icon="FaBug"
					link="https://github.com/ImDarkTom/LlamaPen/issues" 
				/>
			</AccountSection>

			<AccountSection title="Danger Zone">
				<ButtonSetting type="button" @click="deleteAccount" class="bg-danger! hover:saturate-200 hover:bg-danger!">
					<IpPeopleDeleteOne />
					Delete Account
				</ButtonSetting>
			</AccountSection>
		</div>
	</div>
</template>