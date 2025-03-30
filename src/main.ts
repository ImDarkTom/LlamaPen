import { createApp } from "vue";
import "./styles/style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import ChatWindow from "@/views/chat/index.vue";
import SettingsWindow from "@/views/settings/index.vue";
import GuideWindow from "@/views/guide/index.vue";
import TextpadWindow from '@/views/textpad/index.vue';

import Layout from "./components/Layout/Layout.vue";
import mousedownOutside from "./directives/mousedownOutside";
import PersonaList from './views/personaList/PersonaList.vue';

const routes = [
    {
        path: "/",
        component: Layout,
        children: [
            { path: "/", component: ChatWindow },
            { path: "/chat/:id", component: ChatWindow },
            { path: "/textpad", component: TextpadWindow },
            { path: "/textpad/:id", component: TextpadWindow },
            { path: "/settings", component: SettingsWindow },
            { path: '/guide', component: GuideWindow },
            { path: '/persona/list', component: PersonaList },
            { path: '/persona/view/:id', component: PersonaList },
            { path: '/persona/create', component: PersonaList },
            { path: '/persona/edit/:id', component: PersonaList }
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);
app.use(router);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);

app.directive('mousedown-outside', mousedownOutside);

app.mount("#app");
