<template>
  <div class="bg-[#2196F3] w-full h-32 flex items-center px-4 shadow">
    <img src="/MGA_2025_Logo_SVG.svg" alt="Logo" class="h-20" />
  </div>
  <div class="flex flex-row divide-x divide-gray-400 h-full w-full overflow-hidden">
    <div class="flex flex-col gap-4 h-full w-32 md:w-64 p-2">
      <button primary @click="sendMsg('cut', 'transition', 'intro')">▶️ Intro</button>
      <button primary @click="sendMsg('cut', 'transition', 'stringer')">▶️ Stinger</button>
      <!--<button primary @click="sendMsg('cut', 'timer', 'stringer')">12m Timer</button>-->
      <button :tertiary="activeGame == 'game1'" :tertiary-outline="activeGame != 'game1'" @click="activeGame = 'game1'">
        Spiel 1
      </button>
      <button :tertiary="activeGame == 'game2'" :tertiary-outline="activeGame != 'game2'" @click="activeGame = 'game2'">
        Spiel 2
      </button>
      <button :tertiary="activeGame == 'game3'" :tertiary-outline="activeGame != 'game3'" @click="activeGame = 'game3'">
        Spiel 3
      </button>
      <button :tertiary="activeGame == 'game4'" :tertiary-outline="activeGame != 'game4'" @click="activeGame = 'game4'">
        Spiel 4
      </button>
      <button :tertiary="activeGame == 'game5'" :tertiary-outline="activeGame != 'game5'" @click="activeGame = 'game5'">
        Spiel 5
      </button>
      <button :tertiary="activeGame == 'game6'" :tertiary-outline="activeGame != 'game6'" @click="activeGame = 'game6'">
        Spiel 6
      </button>
      <button :tertiary="activeGame == 'game7'" :tertiary-outline="activeGame != 'game7'" @click="activeGame = 'game7'">
        Spiel 7
      </button>
      <button secondary @click="sendMsg('cut', 'transition', 'winner_tony')">▶️ Tony gewinnt</button>
      <button secondary @click="sendMsg('cut', 'transition', 'winner_sarah')">▶️ Sarah gewinnt</button>
      <br />
      <button secondary @click="sendMsg('clear', 'total', 'winner_sarah')">CLEAR ALL</button>
    </div>
    <div class="flex flex-col md:flex-row divide-y md:divide-x divide-gray-400 h-full grow overflow-y-auto">
      <div class="flex flex-col gap-4 w-full h-full p-2">
        <p class="text-xl w-full text-center font-bold">Aktuelles Spiel</p>
        <div>
          <label for="gamename">Spielname</label>
          <input
            id="gamename"
            type="text"
            :value="gamedata?.title"
            @change="($event) => sendData(activeGame, $event, 'title')"
          />
        </div>
        <div class="flex flex-row items-center justify-between gap-2">
          <label for="player1" class="whitespace-nowrap">{{ data?.players?.player1 }}</label>
          <select
            id="player1"
            class="w-2/3"
            :value="gamedata?.player1"
            @change="($event) => sendData(activeGame, $event, 'score', '1')"
          >
            <option v-for="i in (gamedata?.max_points ?? 0) + 1" :key="i - 1" :value="i - 1">
              {{ i - 1 }}
            </option>
          </select>
        </div>
        <div class="flex flex-row items-center justify-between gap-2">
          <label for="player2" class="whitespace-nowrap">{{ data?.players?.player2 }}</label>
          <select
            id="player2"
            class="w-2/3"
            :value="gamedata?.player2"
            @change="($event) => sendData(activeGame, $event, 'score', '2')"
          >
            <option v-for="i in (gamedata?.max_points ?? 0) + 1" :key="i - 1" :value="i - 1">
              {{ i - 1 }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex flex-row gap-2">
            <button primary @click="sendMsg('cut', 'name', activeGame)">▶️ Play Name</button>
            <button secondary @click="sendMsg('clear', 'name', activeGame)">🛑 Clear name</button>
          </div>
          <div v-if="gamedata?.game" class="flex flex-row gap-2">
            <button primary @click="sendMsg('cut', 'game', activeGame)">▶️ Play Prerecord</button>
            <button secondary @click="sendMsg('clear', 'game', activeGame)">🛑 Clear Prerecord</button>
          </div>
          <div class="flex flex-row gap-2">
            <button primary @click="sendMsg('cut', 'score', activeGame)">▶️ Play Score</button>
            <button secondary @click="sendMsg('clear', 'score', activeGame)">🛑 Clear score</button>
          </div>
          <button primary @click="sendMsg('cut', 'transition', activeGame)">▶️ Trigger Game Intro</button>
        </div>
      </div>
      <div class="flex flex-col gap-4 w-full h-full p-2">
        <p class="text-xl w-full text-center font-bold">Gesamtpunktzahl</p>
        <div>
          <label for="gamename">Spielername 1</label>
          <input
            id="gamename"
            type="text"
            :value="data?.players?.player1"
            @change="($event) => sendData('players', $event, 'score', '1')"
          />
        </div>
        <div>
          <label for="gamename">Spielername 2</label>
          <input
            id="gamename"
            type="text"
            :value="data?.players?.player2"
            @change="($event) => sendData('players', $event, 'score', '2')"
          />
        </div>
        <div class="flex flex-row items-center justify-between gap-2">
          <label for="player1" class="whitespace-nowrap">{{ data?.players?.player1 }}</label>
          <select
            id="player1"
            class="w-2/3"
            :value="data?.total?.player1"
            @change="($event) => sendData('total', $event, 'score', '1')"
          >
            <option v-for="i in (data?.total?.max_points ?? 0) + 1" :key="i - 1" :value="i - 1">
              {{ i - 1 }}
            </option>
          </select>
        </div>
        <div class="flex flex-row items-center justify-between gap-2">
          <label for="player2" class="whitespace-nowrap">{{ data?.players?.player2 }}</label>
          <select
            id="player2"
            class="w-2/3"
            :value="data?.total?.player2"
            @change="($event) => sendData('total', $event, 'score', '2')"
          >
            <option v-for="i in (data?.total?.max_points ?? 0) + 1" :key="i - 1" :value="i - 1">
              {{ i - 1 }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <button primary @click="sendMsg('cut', 'total', 'total')">▶️ Play Punktzahl</button>
          <button secondary @click="sendMsg('clear', 'total', 'total')">🛑 Clear Punktzahl</button>
        </div>
      </div>
      <div class="flex flex-col gap-4 w-full h-full p-2">
        <p class="text-xl w-full text-center font-bold">Bauchbinden</p>
        <div>
          <label for="info">Infotext</label>
          <input id="info" type="text" :value="data?.info" @change="($event) => sendData('info', $event)" />
        </div>
        <div class="flex flex-col gap-2">
          <button primary @click="sendMsg('cut', 'info', 'info')">▶️ Play Info</button>
          <button secondary @click="sendMsg('clear', 'info', 'info')">🛑 Clear Info</button>
        </div>
        <!-- TIMER CONTROL START -->
        <div class="mt-6 flex flex-col gap-2 border-t pt-4">
          <p class="text-xl w-full text-center font-bold">Live-Timer</p>
          <div class="flex flex-row items-center gap-2">
            <label> <input type="checkbox" v-model="timerUp" @change="onToggleDirection" /> Hochzählen </label>
            <input type="number" min="0" max="59" v-model.number="timerMin" class="w-12" /> :
            <input type="number" min="0" max="59" v-model.number="timerSec" class="w-12" />
          </div>
          <div class="flex flex-row gap-2">
            <button primary @click="startTimer">Start</button>
            <button secondary @click="pauseTimer">Pause</button>
            <button secondary @click="resumeTimer">Resume</button>
            <button secondary @click="stopTimer">Stop</button>
          </div>
          <!-- Timer ein-/ausblenden -->
          <div class="flex flex-row gap-2 mt-2">
            <button primary @click="sendMsg('cut', 'livetimer', 'livetimer')">▶️ Play Timer</button>
            <button secondary @click="sendMsg('clear', 'livetimer', 'livetimer')">🛑 Clear Timer</button>
          </div>
        </div>
        <!-- TIMER CONTROL END -->
        <!-- Timer Preview Anzeige -->
        <div class="flex flex-col items-center mt-4">
          <label class="text-xs text-gray-600">Timer-Preview</label>
          <div class="rounded-xl bg-[#F63330] px-8 py-2 mt-1">
            <span class="text-white text-3xl font-bold tracking-widest">
              {{ String(Math.floor(timerCurrent / 60)).padStart(2, "0") }}:
              {{ String(timerCurrent % 60).padStart(2, "0") }}
            </span>
            <span class="ml-2 text-xs text-white align-top">
              {{ timerUp ? "⏫" : "⏬" }}
            </span>
            <span v-if="timerPaused" class="ml-2 text-yellow-200 align-top">Pause</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import { useConnectionStore } from "../stores/connection";
import { useManagerStore } from "../stores/manager";
</script>

<script lang="ts">
export default defineComponent({
  data() {
    return {
      activeGame: "game1",

      // === Timer-Settings ===
      timerUp: false,
      timerMin: 1,
      timerSec: 0,

      // === Preview‑Timer‑State ===
      timerInitial: 0,
      timerCurrent: 0,
      timerRunning: false,
      timerPaused: false,
      timerInterval: undefined as number | undefined,
    };
  },

  computed: {
    ...mapState(useManagerStore, ["data"]),
    gamedata() {
      return this.data?.[this.activeGame] ?? {};
    },
  },

  mounted() {
    this.connectClient();
    this.init();

    const connectionStore = useConnectionStore();
    if (!connectionStore.connection) return;

    connectionStore.connection.on("timer", (data: any) => {
      this.timerTrigger(data);
    });
  },

  beforeUnmount() {
    if (this.timerInterval !== undefined) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  },

  methods: {
    ...mapActions(useConnectionStore, ["connectClient"]),
    ...mapActions(useManagerStore, ["init", "sendAction", "updateData"]),

    // Backend-Interaktionen
    sendData(scene: string, data: any, type?: "score" | "title", player?: "1" | "2") {
      this.updateData(scene, data.target.value, type, player);
    },
    sendMsg(
      action: "clear" | "cut",
      type: "all" | "name" | "score" | "info" | "total" | "transition" | "game" | "timer" | "livetimer",
      scene: string
    ) {
      this.sendAction(action, { type, scene });
    },

    // Richtung umschalten
    onToggleDirection() {
      this.sendAction("timer", {
        command: "setDirection",
        up: this.timerUp,
      });
    },

    // Timer‑Buttons (Server‑Steuerung)
    startTimer() {
      this.sendAction("timer", {
        command: "start",
        up: this.timerUp,
        min: Number(this.timerMin),
        sec: Number(this.timerSec),
      });
    },
    pauseTimer() {
      this.sendAction("timer", { command: "pause" });
    },
    resumeTimer() {
      this.sendAction("timer", { command: "resume" });
    },
    stopTimer() {
      this.sendAction("timer", { command: "stop" });
    },

    // === Preview‑Timer‑Logik ===
    timerTrigger(data: any) {
      // 1) setDirection
      if (data.command === "setDirection") {
        this.timerUp = !!data.up;
        return;
      }

      // 2) Start
      if (data.command === "start") {
        this.timerUp = !!data.up;
        this.timerInitial = (data.min || 0) * 60 + (data.sec || 0);
        this.timerCurrent = this.timerUp ? 0 : this.timerInitial;
        this.timerRunning = true;
        this.timerPaused = false;
      }

      // 3) Pause
      if (data.command === "pause") {
        this.timerPaused = true;
        this.timerRunning = false;
      }

      // 4) Resume
      if (data.command === "resume") {
        this.timerPaused = false;
        this.timerRunning = true;
      }

      // 5) Stop
      if (data.command === "stop") {
        this.timerPaused = false;
        this.timerRunning = false;
        this.timerCurrent = this.timerUp ? 0 : this.timerInitial;
      }

      // 6) Intervall verwalten
      if (this.timerInterval !== undefined) {
        clearInterval(this.timerInterval);
        this.timerInterval = undefined;
      }
      if (this.timerRunning && !this.timerPaused) {
        this.timerInterval = window.setInterval(this.updateTimerPreview, 1000);
      }
    },

    updateTimerPreview() {
      if (!this.timerRunning || this.timerPaused) return;

      if (this.timerUp) {
        this.timerCurrent++;
        if (this.timerCurrent >= this.timerInitial) {
          // Ende erreicht
          this.timerRunning = false;
          if (this.timerInterval !== undefined) {
            clearInterval(this.timerInterval);
            this.timerInterval = undefined;
          }
        }
      } else {
        if (this.timerCurrent > 0) {
          this.timerCurrent--;
          if (this.timerCurrent === 0) {
            // Ende erreicht
            this.timerRunning = false;
            if (this.timerInterval !== undefined) {
              clearInterval(this.timerInterval);
              this.timerInterval = undefined;
            }
          }
        }
      }
    },
  },
});
</script>
