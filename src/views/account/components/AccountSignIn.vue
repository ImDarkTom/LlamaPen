<script setup lang="ts">
import supabase from '@/lib/supabase';
import useUserStore from '@/stores/user';
import { ref } from 'vue';
import { BiLogoGoogle } from 'vue-icons-plus/bi';
import AccountSection from './AccountSection.vue';

const userStore = useUserStore();

const isSigningIn = ref(false);

async function signIn() {
    if (!supabase) return;

	isSigningIn.value = true;

    const { data: _data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
		options: {
			redirectTo: `${window.location.origin}/account`,
		},
    });

    if (error) {
        alert('Error attempting sign in, ' + error);
    }
}
</script>

<template>
    <div class="flex flex-col items-center justify-center h-full">
        <AccountSection class="items-center justify-center" flex-direction="col">
            <div class="flex flex-col items-center gap-4">
                <span class="font-bold text-xl">Welcome to LlamaPen Cloud</span>
                <ButtonPrimary
                    v-if="!userStore.isSignedIn" 
                    class="font-medium px-16" 
                    :class="{ 'opacity-75': isSigningIn }"
                    :text="isSigningIn ? 'Signing in...' : 'Continue with Google'" 
                    :icon="BiLogoGoogle" 
                    @click="signIn" />
                <span>
                    By signing up, you agree to LlamaPen Cloud's
                    <a href="https://cloud.llamapen.app/terms" target="_blank" class="text-secondary hover:underline">Terms
                        of Service</a>
                    and
                    <a href="https://cloud.llamapen.app/privacy" target="_blank"
                        class="text-secondary hover:underline">Privacy Policy</a>.
                </span>
            </div>
        </AccountSection>
    </div>
</template>