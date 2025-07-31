import { createRouter, createWebHistory } from "vue-router";
import OverlayView from "../views/OverlayView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "overlay",
      component: OverlayView,
    },
    {
      path: "/manage",
      name: "manage",
      component: () => import("../views/ManageView.vue"),
    },
    {
      path: "/laser",
      name: "laser",
      component: () => import("../views/LaserView.vue"),
    },
  ],
});

export default router;
