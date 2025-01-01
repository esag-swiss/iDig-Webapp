import { createRouter, createWebHashHistory } from "vue-router";
const TheItemStandalone = () => import("@/components/TheItemStandalone.vue");

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/TheItemStandalone/:trenchSource/:itemId",
      name: "TheItemStandalone",
      component: TheItemStandalone,
      props: true,
    },
  ],
});

export default router;
