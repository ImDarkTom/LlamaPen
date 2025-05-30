import supabase from '@/supabase';
import { authedFetch } from '@/utils/auth';
import type { Session, User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useConfigStore } from './config';

const inProduction = import.meta.env.VITE_PRODUCTION === 'true';

async function fetchUser() {
    if (!inProduction) return;

    const userResponse = await supabase?.auth.getUser();
    user.value = userResponse?.data.user || null;
}

async function fetchSession() {
    if (!inProduction) return;

    const userResponse = await supabase?.auth.getSession();
    session.value = userResponse?.data.session || null;
}

async function fetchSubInfo() {
    if (!inProduction) return;

    const subscriptionResponse = await authedFetch(useConfigStore().apiUrl('/user/subscription-info'));
    if (!subscriptionResponse) return;

    const subscriptionInfoResponse = await subscriptionResponse.json();
    subscriptionInfo.value = subscriptionInfoResponse;
}

const user = ref<User | null>(null);
const session = ref<Session | null>(null);
const subscriptionInfo = ref<{ subscribed: boolean, name: string, ending?: number, remaining: number, limit: number }>({
    subscribed: false,
    name: 'Loading...',
    remaining: 20,
    limit: 20,
});

/**
 * Store to manage auth with LlamaPen account.
 */
const useUserStore = defineStore('user', () => {
    if (user.value === null) {
        fetchUser();
        fetchSession();
        fetchSubInfo();
    }

    const isSignedIn = computed(() => user.value !== null);
    const subscription = computed(() => subscriptionInfo.value);

    return { user, subscription, isSignedIn };
});

export default useUserStore;