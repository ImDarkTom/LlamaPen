
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import ChatPage from "@/views/chat/ChatPage.vue";
import SettingsPage from "@/views/settings/SettingsPage.vue";
import GuidePage from "@/views/guide/GuidePage.vue";
import AccountPage from '@/views/account/AccountPage.vue';
import ModelsPage from '@/views/models/ModelsPage.vue';
import ChatLayout from '@/layouts/ChatLayout.vue';
import ToolsPage from '@/views/tools/ToolsPage.vue';
import NotFoundPage from '@/views/404.vue';

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: ChatLayout,
        children: [
            { path: "/", component: ChatPage },
            { 
                path: "/chat", 
                component: ChatPage,
                children: [
                    { path: "/chat/:id", component: ChatPage }
                ]
            },
            { path: '/settings', component: SettingsPage },
            { path: '/guide', component: GuidePage },
            { path: '/account', component: AccountPage },
            { 
                path: '/models', 
                component: ModelsPage,
                children: [
                    { path: '/models/:model(.*)', component: ModelsPage }
                ]
            },
            { 
                path: '/tools', 
                component: ToolsPage,
                children: [
                    { path: '/tools/:tool(.*)', component: ToolsPage }
                ]
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        component: NotFoundPage,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;