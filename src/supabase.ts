import { createClient } from '@supabase/supabase-js';

class SupabaseClient {
	constructor() {}

	private client: ReturnType<typeof createClient> | null = null;

	initialise() {
		if (import.meta.env.VITE_PRODUCTION !== 'true') {
			return null;
		}

		const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
		const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLIC_KEY;

		this.client = createClient(supabaseUrl, supabaseKey);
	}

	get supabase() {
		return this.client;
	}
}

const supabase = new SupabaseClient();
supabase.initialise();

export default supabase.supabase;