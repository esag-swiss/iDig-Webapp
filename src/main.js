import { createApp } from "vue";
import { Quasar } from "quasar";

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";

import App from "./App.vue";

import "./assets/main.css";

// createApp(App).mount("#app");

const myApp = createApp(App);

myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
});

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount("#app");
