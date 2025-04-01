import { createApp } from "vue";
import "./styles/style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import ChatPage from "@/views/chat/ChatPage.vue";
import SettingsPage from "@/views/settings/SettingsPage.vue";
import GuidePage from "@/views/guide/GuidePage.vue";
import TextpadPage from '@/views/textpad/TextpadPage.vue';

import Layout from "./components/Layout/Layout.vue";
import mousedownOutside from "./directives/mousedownOutside";

const routes = [
    {
        path: "/",
        component: Layout,
        children: [
            { path: "/", component: ChatPage },
            { path: "/chat/:id", component: ChatPage },
            { path: "/textpad", component: TextpadPage },
            { path: "/textpad/:id", component: TextpadPage },
            { path: "/settings", component: SettingsPage },
            { path: '/guide', component: GuidePage }
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);
app.use(createPinia());
app.use(router);

app.directive('mousedown-outside', mousedownOutside);

app.mount("#app");
