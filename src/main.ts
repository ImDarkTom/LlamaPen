import { createApp } from "vue";
import "./styles/style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import ChatWindow from "./components/ChatWindow.vue";
import SettingsWindow from "./components/SettingsWindow.vue";
import Layout from "./components/Layout.vue";

const routes = [
    {
        path: "/",
        component: Layout,
        children: [
            { path: "/", component: ChatWindow },
            { path: "/chat/:id", component: ChatWindow },
            { path: "/settings", component: SettingsWindow },
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

app.mount("#app");
