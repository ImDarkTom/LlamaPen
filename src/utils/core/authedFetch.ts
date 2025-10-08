import supabase from '@/lib/supabase';
import { useConfigStore } from '@/stores/config';

export async function authedFetch(url: string, options?: RequestInit): Promise<Response> {
	if (!supabase) {
        return fetch(url, {
            ...options,
        });
    }

	const session = (await supabase.auth.getSession()).data.session;

    const headers: Record<string, any> = {
        ...(options?.headers || {}),
    };

    // Only send auth token if cloud is explicitly enabled.
    if (useConfigStore().cloud.enabled) {
        headers['Authorization'] = `Bearer ${session?.access_token}`;
    }

    return fetch(url, {
		...options,
        headers,
    });
}