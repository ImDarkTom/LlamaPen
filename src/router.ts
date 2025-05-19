
import ChatPage from "@/views/chat/ChatPage.vue";
import SettingsPage from "@/views/settings/SettingsPage.vue";
import GuidePage from "@/views/guide/GuidePage.vue";
import TextpadPage from '@/views/textpad/TextpadPage.vue';
import Layout from "./components/Layout/Layout.vue";
import { createRouter, createWebHistory } from 'vue-router';
import AccountPage from './views/account/AccountPage.vue';

const routes = [
    {
        path: "/",
        component: Layout,
        children: [
            { path: "/", component: ChatPage },
            { path: "/chat", component: ChatPage },
            { path: "/chat/:id", component: ChatPage },
            { path: "/textpad", component: TextpadPage },
            { path: "/textpad/:id", component: TextpadPage },
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