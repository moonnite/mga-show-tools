import { defineStore } from "pinia";
import { useConnectionStore } from "./connection";

export const useOverlayStore = defineStore("overlay", {
  actions: {
    // Extended with optional diceUpdateTrigger for conditional updates
    init(
      clearTrigger: Function,
      fadeTrigger: Function,
      cutTrigger: Function,
      timerTrigger: Function,
      diceUpdateTrigger?: Function
    ) {
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
        timerTrigger(result);
      });

      // NEW: only update dice overlays if currently visible (OverlayView decides)
      if (diceUpdateTrigger) {
        connectionStore.connection.on("dice_update", (result) => {
          diceUpdateTrigger(result);
        });
      }
    },
  },
});
