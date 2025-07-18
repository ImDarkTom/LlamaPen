
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Layout from '@/components/Layout/Layout.vue';
import ChatPage from "@/views/chat/ChatPage.vue";
import SettingsPage from "@/views/settings/SettingsPage.vue";
import GuidePage from "@/views/guide/GuidePage.vue";
import AccountPage from '@/views/account/AccountPage.vue';
import ShortcutsPage from '@/views/shortcuts/ShortcutsPage.vue';
import ModelsPage from '@/views/models/ModelsPage.vue';

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: Layout,
        children: [
            { path: "/", component: ChatPage },
            { path: "/chat", component: ChatPage },
            { path: "/chat/:id", component: ChatPage },
            { path: "/settings", component: SettingsPage },
            { path: '/guide', component: GuidePage },
            { path: '/account', component: AccountPage },
            { path: "/shortcuts", component: ShortcutsPage },
            { path: '/models', component: ModelsPage },
            { path: '/models/:model(.*)', component: ModelsPage },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;