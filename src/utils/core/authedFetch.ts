import supabase from '@/lib/supabase';
import { useConfigStore } from '@/stores/config';
import { getSessionToken } from '@/stores/user';

export async function authedFetch(url: string, options?: RequestInit): Promise<Response> {
	if (!supabase) {
        return fetch(url, options);
    }

    if (!options) {
        options = {} as RequestInit;
    }

    const reqHeaders = options?.headers ? new Headers(options.headers) : new Headers();

    // Only send auth token if cloud is explicitly enabled.
    if (useConfigStore().cloud.enabled) {
        const token = await getSessionToken();

        if (token) {
            reqHeaders.set('Authorization', `Bearer ${token}`);
        }
    }

    options.headers = reqHeaders;
    return fetch(url, options);
}