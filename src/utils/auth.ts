import supabase from '@/supabase';

export async function authedFetch(url: string, options?: RequestInit): Promise<Response> {
	if (!supabase) {
        return fetch(url, {
            ...options,
        });
    }

	const session = (await supabase.auth.getSession()).data.session;
    return fetch(url, {
		...options,
        headers: {
            'Authorization': `Bearer ${session?.access_token}`,
			...options?.headers
        },
    });
}