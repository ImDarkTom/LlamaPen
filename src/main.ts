import { createApp } from 'vue'
import './styles/style.scss'
import App from './App.vue'
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import Main from './components/Main.vue';

const routes = [
    { path: '/', component: Main },
    { path: '/chat/:id', component: Main }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);
app.use(createPinia());
app.use(router);

app.mount('#app')
