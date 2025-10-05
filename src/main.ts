import { createApp } from "vue";
import "./assets/style/style.css";
import "./assets/style/fonts.css";
import "./assets/style/transitions.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import mousedownOutside from "./directives/mousedownOutside";
import router from './lib/router';
import clickOutside from "./directives/clickOutside";

const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(router);
app.use(pinia);

app.directive('mousedown-outside', mousedownOutside);
app.directive('click-outside', clickOutside);

app.mount("#app");
