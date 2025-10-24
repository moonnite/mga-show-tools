import { defineStore } from "pinia";
import { useConnectionStore } from "./connection";

export const useManagerStore = defineStore("manager", {
  state: () => {
    return {
      data: {} as any,
    };
  },
  actions: {
    init() {
      const connectionStore = useConnectionStore();
      if (!connectionStore.connection) return;
      connectionStore.connection.on("state", (result) => {
        this.data = result;
      });

      this.getData();
    },
    sendAction(action: "clear" | "cut" | "timer", data: any) {
      const connectionStore = useConnectionStore();
      if (!connectionStore.connection) return;
      connectionStore.connection.emit(action, data);
    },
    // NEW: ask backend to broadcast a conditional dice update
    sendDiceUpdate(scene: string, player: "1" | "2") {
      const connectionStore = useConnectionStore();
      if (!connectionStore.connection) return;
      connectionStore.connection.emit("diceUpdate", { scene, player });
    },
    getData() {
      const connectionStore = useConnectionStore();
      if (!connectionStore.connection) return;
      connectionStore.connection.emit("getState");
    },
    updateData(scene: string, data: any, type?: "score" | "title", player?: "1" | "2") {
      if (type == "score") {
        this.data[scene]["player" + player] = data;
      } else if (type == "title") {
        this.data[scene].title = data;
      } else {
        this.data[scene] = data;
      }

      const connectionStore = useConnectionStore();
      if (!connectionStore.connection) return;
      connectionStore.connection.emit("updateState", this.data);
    },
  },
});
