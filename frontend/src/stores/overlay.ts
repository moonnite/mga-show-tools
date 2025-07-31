import { defineStore } from "pinia";
import { useConnectionStore } from "./connection";

export const useOverlayStore = defineStore("overlay", {
  actions: {
    init(clearTrigger: Function, fadeTrigger: Function, cutTrigger: Function, timerTrigger: Function) {
      const connectionStore = useConnectionStore();
      if (!connectionStore.connection) return;
      connectionStore.connection.on("clear", (result) => {
        clearTrigger(result);
      });
      connectionStore.connection.on("fadein", (result) => {
        fadeTrigger(result);
      });
      connectionStore.connection.on("cut", (result) => {
        cutTrigger(result);
      });
      connectionStore.connection.on("timer", (result) => {
        timerTrigger(result); // <-- neu
      });
    },
  },
});
