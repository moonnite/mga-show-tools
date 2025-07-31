import { defineStore } from "pinia";
import { io, type Socket } from "socket.io-client";
import { backend as api } from "@/config";

export const useConnectionStore = defineStore("connection", {
  state: () => {
    return {
      connection: undefined as undefined | Socket,
    };
  },
  getters: {
    connectionStatus: (state) => !!state.connection,
  },
  actions: {
    connectClient(): void {
      this.connection?.disconnect();
      this.connection = io(`${api}`, {
        reconnection: true,
        reconnectionDelayMax: 10000,
      });

      this.connection.on("disconnecting", () => {
        this.connection?.disconnect();
      });
    },
  },
});
