import { createApp } from "vue";
import "./styles/style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import mousedownOutside from "./directives/mousedownOutside";
import router from './router';

const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(router);
app.use(pinia);

app.directive('mousedown-outside', mousedownOutside);

app.mount("#app");
