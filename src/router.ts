
import ChatPage from "@/views/chat/ChatPage.vue";
import SettingsPage from "@/views/settings/SettingsPage.vue";
import GuidePage from "@/views/guide/GuidePage.vue";
import NotePage from '@/views/note/NotePage.vue';
import Layout from "./components/Layout/Layout.vue";
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AccountPage from './views/account/AccountPage.vue';
import { useUiStore } from './stores/uiStore';

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: Layout,
        children: [
            { path: "/", component: ChatPage, beforeEnter: () => {
                if (useUiStore().mode === 'note') {
                    router.push('/note');
                }
            } },
            { path: "/chat", component: ChatPage },
            { path: "/chat/:id", component: ChatPage },
            { path: "/note", component: NotePage },
            { path: "/note/:id", component: NotePage },
            { path: "/settings", component: SettingsPage },
            { path: '/guide', component: GuidePage },
            { path: '/account', component: AccountPage }
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;