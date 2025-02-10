import { createRouter, createWebHashHistory } from "vue-router";
import App from "../App.vue";
const TheItemStandalone = () => import("@/components/TheItemStandalone.vue");

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: App,
    },
    {
      path: "/Item/:trenchSource/:itemId",
      name: "TheItemStandalone",
      component: TheItemStandalone,
      props: true,
    },
  ],
});

export default router;
