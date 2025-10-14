import supabase from '@/lib/supabase';
import { useConfigStore } from '@/stores/config';
import { getSessionToken } from '@/stores/user';

export async function authedFetch(url: string, options?: RequestInit): Promise<Response> {
	if (!supabase) {
        return fetch(url, {
            ...options,
        });
    }

    const headers: Record<string, any> = {
        ...(options?.headers || {}),
    };

    // Only send auth token if cloud is explicitly enabled.
    if (useConfigStore().cloud.enabled) {
        const token = await getSessionToken();

        if (!token) {
            alert('Error getting session token.');
            throw new Error('Error getting session token.');
        }

        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
		...options,
        headers,
    });
}