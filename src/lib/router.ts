
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import ChatPage from "@/views/chat/ChatPage.vue";
import SettingsPage from "@/views/settings/SettingsPage.vue";
import GuidePage from "@/views/guide/GuidePage.vue";
import AccountPage from '@/views/account/AccountPage.vue';
import ShortcutsPage from '@/views/shortcuts/ShortcutsPage.vue';
import ModelsPage from '@/views/models/ModelsPage.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import ToolsPage from '@/views/tools/ToolsPage.vue';
import UtilityLayout from '@/layouts/UtilityLayout.vue';

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: MainLayout,
        children: [
            { path: "/", component: ChatPage },
            { path: "/chat", component: ChatPage },
            { path: "/chat/:id", component: ChatPage },
        ],
    },
    {
        path: '/',
        component: UtilityLayout,
        children: [
            { path: '/settings', component: SettingsPage },
            { path: '/models', component: ModelsPage },
            { path: '/models/:model(.*)', component: ModelsPage },
            { path: '/tools', component: ToolsPage },
            { path: '/tools/:tool(.*)', component: ToolsPage },
            { path: "/shortcuts", component: ShortcutsPage },
            { path: '/guide', component: GuidePage },
            { path: '/account', component: AccountPage },
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;