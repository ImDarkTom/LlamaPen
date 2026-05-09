
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import ChatPage from "@/views/chat/ChatPage.vue";
import SettingsPage from "@/views/settings/SettingsPage.vue";
import GuidePage from "@/views/guide/GuidePage.vue";
import AccountPage from '@/views/account/AccountPage.vue';
import ModelsPage from '@/views/models/ModelsPage.vue';
import ChatLayout from '@/layouts/ChatLayout.vue';
import ToolsPage from '@/views/tools/ToolsPage.vue';
import NotFoundPage from '@/views/404.vue';
import useSidebarStore, { type SidebarMode } from '@/stores/useSidebarStore';
import DownloadsPage from '@/views/models/DownloadsPage.vue';
import BrowsePage from '@/views/models/BrowsePage.vue';

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        component: ChatLayout,
        children: [
            { 
                path: "/", 
                component: ChatPage,
                meta: { sidebarType: 'chats' },
            },
            { 
                path: "/chat", 
                component: ChatPage,
                meta: { sidebarType: 'chats' },
                children: [
                    { path: "/chat/:id", component: ChatPage }
                ],
            },
            { 
                path: '/settings',
                component: SettingsPage,
                meta: { sidebarType: 'chats' },
            },
            { 
                path: '/guide', 
                component: GuidePage,
                meta: { sidebarType: 'chats' },
            },
            { 
                path: '/account',
                component: AccountPage,
                meta: { sidebarType: 'chats' },
            },
            { 
                path: '/models',
                redirect: '/models/installed',
                meta: { sidebarType: 'models' },
                children: [
                    { 
                        path: '/models/installed', 
                        component: ModelsPage
                    },
                    { 
                        path: '/models/installed/:model(.*)', 
                        component: ModelsPage
                    },
                    { 
                        path: '/models/browse', 
                        component: BrowsePage
                    },
                    { 
                        path: '/models/downloads', 
                        component: DownloadsPage
                    },
                ]
            },
            { 
                path: '/tools', 
                component: ToolsPage,
                meta: { sidebarType: 'chats' },
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

router.afterEach((to) => {
    const sidebarStore = useSidebarStore();
    sidebarStore.setSidebarMode((to.meta.sidebarType as SidebarMode) ?? 'chats');
});

export default router;