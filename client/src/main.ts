import { createApp } from "vue";
import { createHead } from "@unhead/vue";

import App from "./App.vue";
import router from "./router";
import pinia from "./store";
import i18n from "./i18n";

// Styles
import "./assets/styles/tokens.css";
import "./assets/styles/globals.css";

// Create Vue app
const app = createApp(App);

// Register plugins
app.use(pinia);
app.use(router);
app.use(i18n);

// Create head manager for meta tags
const head = createHead();
app.use(head);

// Mount app
app.mount("#app");

// Export for testing
export { app, pinia, router, i18n };
