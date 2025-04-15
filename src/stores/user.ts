import supabase from '@/supabase';
import type { User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

async function fetchUser() {
    const userResponse = await supabase?.auth.getUser();

    user.value = userResponse?.data.user || null;
}

const user = ref<User | null>(null);

const useUserStore = defineStore('user', () => {
    if (user.value === null) {
        fetchUser();
    }

    const isSignedIn = computed(() => user.value !== null);

    return { user, isSignedIn };
});

export default useUserStore;