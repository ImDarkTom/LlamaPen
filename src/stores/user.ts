import supabase from '@/lib/supabase';
import { authedFetch } from '@/utils/core/authedFetch';
import type { Session, User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useConfigStore } from './config';
import logger from '@/lib/logger';

const inProduction = import.meta.env.VITE_PRODUCTION === 'true';

async function fetchUser() {
    const userResponse = await supabase?.auth.getUser();
    user.value = userResponse?.data.user || null;

    logger.info('User Store', 'User data set to', user.value);
}

async function fetchSession() {
    const userResponse = await supabase?.auth.getSession();
    session.value = userResponse?.data.session || null;
}

async function fetchSubInfo() {
    const subscriptionResponse = await authedFetch(useConfigStore().requestUrl('/user/subscription-info'));
    if (!subscriptionResponse) return;

    const subscriptionInfoResponse = await subscriptionResponse.json();
    subscriptionInfo.value = subscriptionInfoResponse;
}

const user = ref<User | null>(null);
const session = ref<Session | null>(null);
const subscriptionInfo = ref<{ 
    name: string, 
    subscribed: boolean,
    status?: string, 
    period_end: number,
    cancel_at_period_end: boolean, 
    usage: {
        limit: number, 
        remaining: number, 
        lastUpdated: string | null;
    }
}>({
    name: 'Loading...',
    subscribed: false,
    usage: {
        limit: 20,
        remaining: 20,
        lastUpdated: null,
    },
    period_end: -1,
    cancel_at_period_end: false
});

/**
 * Store to manage auth with LlamaPen account.
 */
const useUserStore = defineStore('user', () => {
    // If in prod, cloud is enabled, and user info not already loaded, fetch the info.
    if (inProduction && useConfigStore().cloud.enabled && user.value === null) {
        fetchUser();
        fetchSession();
        fetchSubInfo();
    }

    const isSignedIn = computed(() => user.value !== null);
    const subscription = computed(() => subscriptionInfo.value);

    const refreshSubInfo = fetchSubInfo;

    return { user, subscription, isSignedIn, refreshSubInfo };
});

export default useUserStore;