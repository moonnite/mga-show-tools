<template>
  <div class="bg-[#2196F3] w-full h-32 flex items-center px-4 shadow">
    <img src="/MGA_2025_Logo_SVG.svg" alt="Logo" class="h-20" />
  </div>
  <div class="flex flex-row divide-x divide-gray-400 h-full w-full overflow-hidden">
    <div class="flex flex-col gap-4 h-full w-32 md:w-64 p-2">
      <button primary @click="sendMsg('cut', 'transition', 'intro')">▶️ Intro</button>
      <button primary @click="sendMsg('cut', 'transition', 'stringer')">▶️ Stinger</button>

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
      <button secondary @click="clearAll()">CLEAR ALL</button>
    </div>

    <div class="flex flex-col md:flex-row divide-y md:divide-x divide-gray-400 h-full grow overflow-y-auto">
      <!-- Aktuelles Spiel -->
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

        <!-- Spiel 5 – Würfelspiel -->
        <div v-if="activeGame === 'game5'" class="mt-6 border-t pt-4">
          <p class="text-xl w-full text-center font-bold">Spiel 5 – Würfelspiel</p>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            <!-- Player 1 Panel -->
            <div class="p-4 rounded-xl border bg-white/80">
              <h3 class="font-bold mb-2">{{ data?.players?.player1 }}</h3>

              <!-- ROW 1: input + Add (bigger field) -->
              <div class="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  min="1"
                  max="6"
                  v-model.number="p1Roll"
                  class="w-28 text-lg"
                  @keyup.enter="addRoll('1')"
                />
                <button primary @click="addRoll('1')">Add</button>
              </div>

              <!-- ROW 2: Save run + Clear current + Remove last -->
              <div class="flex items-center gap-2 mb-2">
                <button primary @click="saveRun('1')">Save run</button>
                <button secondary @click="clearCurrent('1')">Clear current</button>
                <button tertiary @click="removeLast('1')">Remove last</button>
              </div>

              <!-- Overwrite saved -->
              <div class="flex items-center gap-2 mb-2">
                <input type="number" v-model.number="p1Overwrite" class="w-28 text-lg" />
                <button secondary @click="overwriteSaved('1')">Overwrite saved</button>
              </div>

              <!-- Current stack + sums -->
              <div class="text-sm text-gray-600 mb-1">Current stack:</div>
              <div class="flex flex-wrap gap-2 mb-2">
                <span v-for="(v, i) in dice.p1.stack" :key="i" class="px-2 py-1 bg-gray-200 rounded">{{ v }}</span>
                <span v-if="dice.p1.stack.length === 0" class="text-gray-400">—</span>
              </div>
              <div class="text-sm">
                Unsaved sum: <b>{{ unsavedSum(dice.p1.stack) }}</b>
              </div>
              <div class="text-sm">
                Saved total: <b>{{ dice.p1.saved }}</b>
              </div>

              <div class="flex gap-2 mt-3">
                <button primary @click="sendMsg('cut', 'dice', 'game5', { player: '1' })">▶️ Play P1 overlay</button>
                <button secondary @click="sendMsg('clear', 'dice', 'game5', { player: '1' })">
                  🛑 Clear P1 overlay
                </button>
              </div>
            </div>

            <!-- Player 2 Panel -->
            <div class="p-4 rounded-xl border bg-white/80">
              <h3 class="font-bold mb-2">{{ data?.players?.player2 }}</h3>

              <!-- ROW 1: input + Add (bigger field) -->
              <div class="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  min="1"
                  max="6"
                  v-model.number="p2Roll"
                  class="w-28 text-lg"
                  @keyup.enter="addRoll('2')"
                />
                <button primary @click="addRoll('2')">Add</button>
              </div>

              <!-- ROW 2: Save run + Clear current + Remove last -->
              <div class="flex items-center gap-2 mb-2">
                <button primary @click="saveRun('2')">Save run</button>
                <button secondary @click="clearCurrent('2')">Clear current</button>
                <button tertiary @click="removeLast('2')">Remove last</button>
              </div>

              <!-- Overwrite saved -->
              <div class="flex items-center gap-2 mb-2">
                <input type="number" v-model.number="p2Overwrite" class="w-28 text-lg" />
                <button secondary @click="overwriteSaved('2')">Overwrite saved</button>
              </div>

              <!-- Current stack + sums -->
              <div class="text-sm text-gray-600 mb-1">Current stack:</div>
              <div class="flex flex-wrap gap-2 mb-2">
                <span v-for="(v, i) in dice.p2.stack" :key="i" class="px-2 py-1 bg-gray-200 rounded">{{ v }}</span>
                <span v-if="dice.p2.stack.length === 0" class="text-gray-400">—</span>
              </div>
              <div class="text-sm">
                Unsaved sum: <b>{{ unsavedSum(dice.p2.stack) }}</b>
              </div>
              <div class="text-sm">
                Saved total: <b>{{ dice.p2.saved }}</b>
              </div>

              <div class="flex gap-2 mt-3">
                <button primary @click="sendMsg('cut', 'dice', 'game5', { player: '2' })">▶️ Play P2 overlay</button>
                <button secondary @click="sendMsg('clear', 'dice', 'game5', { player: '2' })">
                  🛑 Clear P2 overlay
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mt-4">
            <button primary @click="sendMsg('cut', 'dice_totals', 'game5')">▶️ Play Saved Totals</button>
            <button secondary @click="sendMsg('clear', 'dice_totals', 'game5')">🛑 Clear Saved Totals</button>
          </div>
        </div>
      </div>

      <!-- Gesamtpunktzahl -->
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
            <option v-for="i in (data?.total?.max_points ?? 0) + 1" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
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
            <option v-for="i in (data?.total?.max_points ?? 0) + 1" :key="i - 1" :value="i - 1">{{ i - 1 }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <button primary @click="sendMsg('cut', 'total', 'total')">▶️ Play Punktzahl</button>
          <button secondary @click="sendMsg('clear', 'total', 'total')">🛑 Clear Punktzahl</button>
        </div>
      </div>

      <!-- Bauchbinden / Info + Timer -->
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
      activeGame: "game5",

      // Dice UI state
      p1Roll: 1,
      p2Roll: 1,
      p1Overwrite: 0,
      p2Overwrite: 0,

      // Timer UI
      timerUp: false,
      timerMin: 1,
      timerSec: 0,

      // Preview-Timer-State
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
    dice(): { p1: { saved: number; stack: number[] }; p2: { saved: number; stack: number[] } } {
      if (!this.data?.game5) return { p1: { saved: 0, stack: [] }, p2: { saved: 0, stack: [] } } as any;
      const g5 = this.data.game5;
      if (!g5.dice) g5.dice = { p1: { saved: 0, stack: [] }, p2: { saved: 0, stack: [] } };
      if (!g5.dice.p1) g5.dice.p1 = { saved: 0, stack: [] };
      if (!g5.dice.p2) g5.dice.p2 = { saved: 0, stack: [] };
      return g5.dice;
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
    ...mapActions(useManagerStore, ["init", "sendAction", "updateData", "sendDiceUpdate"]),

    // Clear all overlays (extended)
    clearAll() {
      this.sendMsg("clear", "total", "total");
      this.sendMsg("clear", "question", "game2");
      this.sendMsg("clear", "livetimer", "livetimer");
      this.sendMsg("clear", "dice", "game5", { player: "1" });
      this.sendMsg("clear", "dice", "game5", { player: "2" });
      this.sendMsg("clear", "dice_totals", "game5");
    },

    // Dice helpers
    unsavedSum(arr: number[]) {
      return arr.reduce((a, b) => a + (Number(b) || 0), 0);
    },
    clampDie(val: number) {
      if (!Number.isFinite(val)) return 1;
      return Math.max(1, Math.min(6, Math.round(val)));
    },

    addRoll(player: "1" | "2") {
      const key = player === "1" ? "p1" : "p2";
      const raw = player === "1" ? Number(this.p1Roll) : Number(this.p2Roll);
      const val = this.clampDie(raw);

      if (val === 6) {
        // 6 -> current unsaved points are lost
        this.dice[key].stack = [];
      } else {
        this.dice[key].stack.push(val);
      }

      this.updateData("game5", this.data.game5);

      // clear input for next entry
      if (player === "1") this.p1Roll = undefined as any;
      else this.p2Roll = undefined as any;

      // NEW: only refresh overlay if already visible (handled in OverlayView)
      this.sendDiceUpdate("game5", player);
    },

    saveRun(player: "1" | "2") {
      const key = player === "1" ? "p1" : "p2";
      const sum = this.unsavedSum(this.dice[key].stack);
      const candidate = Number(this.dice[key].saved || 0) + sum;

      // Must land exactly on 60
      if (candidate > 60) {
        return; // do not save
      }

      this.dice[key].saved = candidate;
      this.dice[key].stack = [];

      this.updateData("game5", this.data.game5);

      // NEW: conditional live refresh
      this.sendDiceUpdate("game5", player);
    },

    clearCurrent(player: "1" | "2") {
      const key = player === "1" ? "p1" : "p2";
      this.dice[key].stack = [];
      this.updateData("game5", this.data.game5);
      // NEW: conditional live refresh
      this.sendDiceUpdate("game5", player);
    },

    removeLast(player: "1" | "2") {
      const key = player === "1" ? "p1" : "p2";
      if (this.dice[key].stack.length > 0) {
        this.dice[key].stack.pop();
        this.updateData("game5", this.data.game5);
        // NEW: conditional live refresh
        this.sendDiceUpdate("game5", player);
      }
    },

    overwriteSaved(player: "1" | "2") {
      const key = player === "1" ? "p1" : "p2";
      const raw = player === "1" ? Number(this.p1Overwrite) : Number(this.p2Overwrite);
      const val = Math.max(0, Math.min(60, Number.isFinite(raw) ? Math.round(raw) : 0)); // keep sane bounds
      this.dice[key].saved = val;
      this.updateData("game5", this.data.game5);
      // NEW: conditional live refresh
      this.sendDiceUpdate("game5", player);
    },

    // Backend-Interaktionen
    sendData(scene: string, data: any, type?: "score" | "title", player?: "1" | "2") {
      this.updateData(scene, data.target ? data.target.value : data, type, player);
    },
    sendMsg(
      action: "clear" | "cut",
      type:
        | "all"
        | "name"
        | "score"
        | "info"
        | "total"
        | "transition"
        | "game"
        | "timer"
        | "livetimer"
        | "question"
        | "dice"
        | "dice_totals",
      scene: string,
      extra: Record<string, any> = {}
    ) {
      this.sendAction(action, { type, scene, ...extra });
    },

    // === Preview-Timer-Logik ===
    onToggleDirection() {
      this.sendAction("timer", {
        command: "setDirection",
        up: this.timerUp,
      });
    },
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
