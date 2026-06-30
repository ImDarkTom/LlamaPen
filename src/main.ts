import { createApp } from "vue";
import "./assets/style/style.css";
import "./assets/style/fonts.css";
import "./assets/style/transitions.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import router from './lib/router';
import clickOutside from "./directives/clickOutside";
import { useCustomProvidersStore } from './stores/useCustomProvidersStore.ts';
import { providerFactory } from './providers/ProviderFactory';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(router);
app.use(pinia);

const { providers: customProviders } = useCustomProvidersStore();
for (const customProvider of customProviders) {
    providerFactory.register(customProvider);
}

app.directive('click-outside', clickOutside);

app.mount("#app");
