<script setup lang="ts">
import StatusText from './StatusText.vue';
import { BiHelpCircle, BiSolidHelpCircle } from 'vue-icons-plus/bi';
import { AiFillGithub } from 'vue-icons-plus/ai';
import { IoSettings, IoSettingsOutline } from 'vue-icons-plus/io';
import SidebarRouterLink from '../SidebarRouterLink.vue';
import useUserStore from '@/stores/user';
import supabase from '@/supabase';
import { onMounted } from 'vue';

const userStore = useUserStore();

const buttonClasses = 'w-full border-none p-1.5 m-0 box-border rounded-lg h-8 bg-primary-300 cursor-pointer hover:shadow-sm shadow-black/50 hover:bg-primary-200 transition-colors duration-100 hover:ring';

onMounted(async () => {
    if (!supabase) return;

    // const { data, error } = await supabase?.functions.invoke('subscription-info', {  
    //   body: { id: userStore.user?.id },
    // });
    
    // console.log(data, error);

    // @ts-ignore
    const subscriptionInfo = await supabase.from('subscriptions').select();

    console.log(subscriptionInfo);
});
</script>

<template>
    <div class="flex flex-col max-w-full">
        <StatusText />
        <RouterLink v-if="userStore.user" to="/account">
            <div class="flex w-full h-16 bg-gradient-to-br from-primary-300 to-primary-400 ring-1 ring-txt-1/50 rounded-xl my-2 p-2">
                <div class="flex items-center mr-3 p-1">
                    <img :src="userStore.user.user_metadata.avatar_url" alt="User avatar"
                        class="size-10 rounded-full">
                </div>
                <div class="flex flex-col grow">
                    <span class="font-bold">{{ userStore.user.user_metadata.name }}</span>
                    <span class="text-sm">Free</span>
                </div>
            </div>
        </RouterLink>
        <div class="flex flex-row gap-2">
            <SidebarRouterLink to="/guide" class="flex-1 p-0 m-0" v-slot="{ isActive }">
                <BiSolidHelpCircle v-if="isActive" :class="buttonClasses" />
                <BiHelpCircle v-else :class="buttonClasses" />
            </SidebarRouterLink>
            <a href="https://github.com/ImDarkTom/LlamaPen" target="_blank" class="flex-1 p-0 m-0">
                <AiFillGithub :class="buttonClasses" />
            </a>
            <SidebarRouterLink to="/settings" class="flex-1 p-0 m-0" v-slot="{ isActive }">
                <IoSettings v-if="isActive" :class="buttonClasses" />
                <IoSettingsOutline v-else :class="buttonClasses" />
            </SidebarRouterLink>
        </div>
    </div>
</template>