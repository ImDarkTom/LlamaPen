import supabase from '@/lib/supabase';
import { authedFetch } from '@/utils/core/authedFetch';
import { defineStore } from 'pinia';
import { computed, ref, type UnwrapRef } from 'vue';
import { useConfigStore } from './config';

const IN_PRODUCTION = import.meta.env.VITE_PRODUCTION === 'true';

const doneFirstLoad = ref(false);
const isLoading = ref(true);
const isSignedIn = ref(false);

const userInfoRef = ref<CloudUserInfo>({
    details: {
        email: '',
        name: '',
        pictureUrl: 'data;,',
    },
    subscription: {
        isPremium: false,
    },
    usage: {
        limit: 0,
        remaining: 0,
        lastUpdated: null
    },
    options: {
        providerSelection: 'all',
    }
});

async function fetchSignInState() {
    if (!supabase) return;

    const { data, error } = await supabase.auth.getUser();
    if (error) {
        // If the errors is anything other than the user not being signed in.
        if (error.name !== "AuthSessionMissingError") {
            console.error('Error fetching user sign in state', error.message);
        }

        isSignedIn.value = false;
        isLoading.value = false;
        return;
    }

    isSignedIn.value = !!data.user;
}

async function fetchUserInfo() {
    if (!IN_PRODUCTION || !useConfigStore().cloud.enabled || !isSignedIn.value) return;

    const userInfoResRaw = await authedFetch(useConfigStore().requestUrl('/user/userInfo'));
    if (!userInfoResRaw) return;

    const userInfoResponse = await userInfoResRaw.json() as CloudUserInfo | { error: { type: string, text: string } };

    if ('error' in userInfoResponse) {
        isLoading.value = false;
        alert(`Error fetching account info: ${userInfoResponse.error.text}`);
        return;
    }

    userInfoRef.value = userInfoResponse;
    isLoading.value = false;
}

async function init() {
    if (doneFirstLoad.value) return;
    doneFirstLoad.value = true;
    isLoading.value = true;

    await fetchSignInState();
    await fetchUserInfo();
}

export interface AccountSettings {
    providerSelection: 'all' | 'no_training' | 'no_retention';
}

/**
 * Store to manage auth with LlamaPen account.
 */
const useUserStore = defineStore('user', () => {
    init();

    const userInfo = computed(() => userInfoRef.value);
    const isPremium = computed(() => userInfo.value.subscription.isPremium);
    const subName = computed(() => userInfoRef.value.subscription.isPremium ? 'Premium' : 'Free');

    async function refreshUserInfo() {
        await fetchSignInState();
        await fetchUserInfo();
    }

    async function updateAccountSettings(newSettings: UnwrapRef<AccountSettings>): Promise<{ success: true, message: null } | { success: false, message: string }> {
        if (!useConfigStore().cloud.enabled) return { success: false, message: 'Cloud not enabled.' };

        const updateResponse = await authedFetch(
            useConfigStore().requestUrl('/user/account-settings'),
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ providerSelection: newSettings.providerSelection } as AccountSettings)
            }
        );

        if (updateResponse.ok) return { success: true, message: null };
        else return { success: false, message: await updateResponse.text() }
    }

    return {
        userInfo,
        isLoading,
        isSignedIn,
        isPremium,
        subName,
        refreshUserInfo,
        updateAccountSettings,
    };
});

export async function getSessionToken() {
    const session = await supabase?.auth.getSession();
    return session?.data.session?.access_token;
}

export default useUserStore;