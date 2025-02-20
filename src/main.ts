import { createApp } from "vue";
import "./styles/style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import ChatWindow from "./components/ChatWindow.vue";
import SettingsWindow from "./components/SettingsWindow.vue";
import Layout from "./components/Layout.vue";
import mousedownOutside from "./directives/mousedownOutside";
import GuideWindow from "./components/GuideWindow.vue";

const routes = [
    {
        path: "/",
        component: Layout,
        children: [
            { path: "/", component: ChatWindow },
            { path: "/chat/:id", component: ChatWindow },
            { path: "/settings", component: SettingsWindow },
            { path: '/guide', component: GuideWindow }
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
