import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia';

const app = createApp(App);
app.use(createPinia());

app.mount('#app')
