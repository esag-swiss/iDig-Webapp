import { createApp } from "vue";
import { Quasar, Notify } from "quasar";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
import el from "./locales/el.json";

// Import icon libraries
import "@quasar/extras/roboto-font/roboto-font.css";
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/material-icons-outlined/material-icons-outlined.css";
import "@quasar/extras/material-icons-round/material-icons-round.css";
import "@quasar/extras/material-icons-sharp/material-icons-sharp.css";
import "@quasar/extras/material-symbols-outlined/material-symbols-outlined.css";
import "@quasar/extras/material-symbols-rounded/material-symbols-rounded.css";
import "@quasar/extras/material-symbols-sharp/material-symbols-sharp.css";
import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";
import "@quasar/extras/ionicons-v4/ionicons-v4.css";

// Import Quasar css
import "quasar/src/css/index.sass";
import App from "./App.vue";
import "./assets/main.css";
import router from "./router/index.js"; // Assurez-vous que le routeur est importé

const pinia = createPinia();
const i18n = createI18n({
  locale: "fr", // langue par défaut
  fallbackLocale: "en", // langue de secours
  messages: {
    fr,
    en,
    de,
    it,
    el,
  },
});
const myApp = createApp(App);
myApp.use(router);
myApp.use(pinia);
myApp.use(i18n);
myApp.use(Quasar, {
  plugins: {
    Notify,
  },
});
myApp.mount("#app");
