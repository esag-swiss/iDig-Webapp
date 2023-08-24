import { createApp } from "vue";
import { Quasar, Notify } from "quasar";
import { createPinia } from "pinia";

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

const pinia = createPinia();
const myApp = createApp(App);

myApp.use(pinia);
myApp.use(Quasar, {
  plugins: {
    Notify,
  },
});
myApp.mount("#app");
