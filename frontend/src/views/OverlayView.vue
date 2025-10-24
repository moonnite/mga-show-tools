<template>
  <video
    v-if="showTransition"
    :src="video"
    class="absolute inset-0 z-40"
    autoplay
    @ended="showTransition = false"
  ></video>

  <video v-if="showGame" :src="game" class="absolute inset-0 z-10" autoplay @ended="showGame = false"></video>

  <!-- SCORE DOTS -->
  <Transition name="fade" mode="out-in">
    <div v-show="showScore" class="absolute left-16 bottom-16 flex flex-row gap-2 px-16 py-10 bg-[#F63330] z-20">
      <div
        v-for="i in total"
        :key="i"
        class="h-5 w-5 rounded-full"
        :class="i <= player1 ? 'bg-white' : 'bg-red-300'"
      ></div>
    </div>
  </Transition>
  <Transition name="fade" mode="out-in">
    <div
      v-show="showScore"
      class="absolute right-16 bottom-16 flex flex-row-reverse gap-2 px-16 py-10 bg-[#1ED8E6] z-20"
    >
      <div
        v-for="i in total"
        :key="i"
        class="h-5 w-5 rounded-full"
        :class="i <= player2 ? 'bg-white' : 'bg-cyan-300'"
      ></div>
    </div>
  </Transition>

  <!-- INFO LOWER THIRD -->
  <Transition name="fade" mode="out-in">
    <div
      v-show="showInfo"
      class="absolute left-1/2 -translate-x-1/2 bottom-16 flex flex-row-reverse gap-2 py-5 px-12 bg-[#F63330] max-w-[66%] whitespace-pre-wrap overflow-hidden z-20"
    >
      <p class="text-white text-center font-black text-6xl">{{ info }}</p>
    </div>
  </Transition>

  <!-- QUESTION LOWER THIRD -->
  <Transition name="fade" mode="out-in">
    <div
      v-if="showQuestion"
      class="absolute left-1/2 -translate-x-1/2 bottom-16 flex flex-col gap-3 py-5 px-12 bg-[#F63330] max-w-[70%] min-w-[48rem] whitespace-pre-wrap overflow-hidden z-30"
    >
      <p class="text-white text-center font-black text-5xl leading-tight">{{ questionText }}</p>
      <div v-if="showQuestionResults" class="grid grid-cols-2 gap-4">
        <div class="flex items-center justify-between bg-[#1ED8E6] px-5 py-3">
          <span class="text-[#0E2232] text-2xl font-black uppercase tracking-wide">{{ qLabel1 }}</span>
          <span class="text-[#0E2232] text-3xl font-black">{{ qP1 }}%</span>
        </div>
        <div class="flex items-center justify-between bg-[#FDF8E5] px-5 py-3">
          <span class="text-[#0E2232] text-2xl font-black uppercase tracking-wide">{{ qLabel2 }}</span>
          <span class="text-[#0E2232] text-3xl font-black">{{ qP2 }}%</span>
        </div>
      </div>
    </div>
  </Transition>

  <!-- LIVE TIMER -->
  <Transition name="fade" mode="out-in">
    <div
      v-show="showTimer"
      class="absolute left-1/2 -translate-x-1/2 bottom-16 flex flex-row-reverse gap-2 py-5 px-12 bg-[#F63330] max-w-[70%] min-w-64 whitespace-pre-wrap overflow-hidden z-20"
    >
      <p class="text-white text-center font-black text-6xl">
        {{ String(Math.floor(timerCurrent / 60)).padStart(2, "0") }}:{{ String(timerCurrent % 60).padStart(2, "0") }}
      </p>
    </div>
  </Transition>

  <!-- DICE OVERLAY: PLAYER 1 (left bottom) -->
  <Transition name="fade" mode="out-in">
    <div
      v-show="showDiceP1"
      class="absolute left-10 bottom-10 flex flex-col items-start gap-3 px-8 py-6 bg-[#F63330] text-white rounded-2xl z-30"
    >
      <!-- NAME -->
      <div class="text-4xl font-black uppercase tracking-wide">{{ dicePlayers.player1 }}</div>
      <!-- VALUES -->
      <div class="text-2xl font-extrabold">
        Gesichert: <span class="font-black">{{ diceP1Saved }}</span>
      </div>
      <div class="text-2xl font-extrabold">
        Aktuell: <span class="font-black">{{ diceP1Unsaved }}</span>
      </div>
      <!-- STACK -->
      <div class="flex flex-wrap gap-3 mt-1">
        <span
          v-for="(v, i) in diceP1Stack"
          :key="'p1' + i"
          class="px-4 py-2 bg-white text-[#F63330] rounded-xl font-black text-xl"
          >{{ v }}</span
        >
        <span v-if="diceP1Stack.length === 0" class="opacity-70 text-xl">—</span>
      </div>
    </div>
  </Transition>

  <!-- DICE OVERLAY: PLAYER 2 (right bottom) -->
  <Transition name="fade" mode="out-in">
    <div
      v-show="showDiceP2"
      class="absolute right-10 bottom-10 flex flex-col items-end gap-3 px-8 py-6 bg-[#1ED8E6] text-white rounded-2xl z-30"
    >
      <!-- NAME -->
      <div class="text-4xl font-black uppercase tracking-wide">{{ dicePlayers.player2 }}</div>
      <!-- VALUES -->
      <div class="text-2xl font-extrabold">
        Gesichert: <span class="font-black">{{ diceP2Saved }}</span>
      </div>
      <div class="text-2xl font-extrabold">
        Aktuell: <span class="font-black">{{ diceP2Unsaved }}</span>
      </div>
      <!-- STACK -->
      <div class="flex flex-wrap gap-3 mt-1 justify-end">
        <span
          v-for="(v, i) in diceP2Stack"
          :key="'p2' + i"
          class="px-4 py-2 bg-white text-[#1ED8E6] rounded-xl font-black text-xl"
          >{{ v }}</span
        >
        <span v-if="diceP2Stack.length === 0" class="opacity-70 text-xl">—</span>
      </div>
    </div>
  </Transition>

  <!-- DICE SAVED TOTALS (center, heading removed) -->
  <Transition name="fade" mode="out-in">
    <div
      v-show="showDiceTotals"
      class="absolute left-1/2 -translate-x-1/2 bottom-16 flex flex-col gap-4 py-6 px-14 bg-[#F63330] text-white whitespace-pre-wrap overflow-hidden z-30 rounded-2xl"
    >
      <div class="grid grid-cols-2 gap-8 min-w-[44rem]">
        <!-- Player 1 card: beige + black text + NAME -->
        <div class="flex items-center justify-between bg-[#FDF8E5] text-black px-6 py-4 rounded-xl">
          <span class="text-3xl font-black uppercase tracking-wide">{{ dicePlayers.player1 }}</span>
          <span class="text-4xl font-black">{{ diceP1Saved }}</span>
        </div>
        <!-- Player 2 card: beige + black text + NAME -->
        <div class="flex items-center justify-between bg-[#FDF8E5] text-black px-6 py-4 rounded-xl">
          <span class="text-3xl font-black uppercase tracking-wide">{{ dicePlayers.player2 }}</span>
          <span class="text-4xl font-black">{{ diceP2Saved }}</span>
        </div>
      </div>
    </div>
  </Transition>

  <!-- TOTAL VIDEO -->
  <div v-if="showTotal" class="w-full h-full flex flex-col justify-center items-center gap-2 overflow-hidden z-50">
    <video
      src="/Punktestand_MGA_2024_NEW_16KBit-vp9-chrome.webm"
      class="absolute inset-0 -z-10"
      autoplay
      @play="initVideoOverlay"
      @ended="
        showTotal = false;
        animRunning = false;
      "
    ></video>
    <div v-show="showVideoOverlay" class="animate-zoom">
      <p class="text-[#FDF8E5] text-center font-black text-[11rem] tracking-widest">
        {{ gamestate?.player1 }} - {{ gamestate?.player2 }}
      </p>
      <div class="flex flex-row justify-between">
        <p class="text-[#FDF8E5] text-center font-black text-5xl italic uppercase">{{ gamestate?.players?.player1 }}</p>
        <p class="text-[#FDF8E5] text-center font-black text-5xl italic uppercase">{{ gamestate?.players?.player2 }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mapActions } from "pinia";
import { defineComponent } from "vue";
import { useOverlayStore } from "../stores/overlay";
import { useConnectionStore } from "../stores/connection";
</script>

<script lang="ts">
export default defineComponent({
  data() {
    return {
      showInfo: false,
      showScore: false,
      showTotal: false,
      showTransition: false,
      showGame: false,
      showVideoOverlay: false,
      animRunning: false,
      info: "",
      player1: 0,
      player2: 0,
      total: 0,
      gamestate: null as any,
      startTime: undefined as any,
      endTime: undefined as any,
      video: "",
      game: "",
      timerRunning: false,
      timerPaused: false,
      timerUp: false,
      timerInitial: 60,
      timerCurrent: 60,
      timerInterval: undefined as number | undefined,
      showTimer: false,

      // Question overlay state
      showQuestion: false,
      showQuestionResults: false,
      questionText: "",
      qP1: 50,
      qP2: 50,
      qLabel1: "",
      qLabel2: "",

      // Dice overlays
      showDiceP1: false,
      showDiceP2: false,
      showDiceTotals: false,
      diceP1Stack: [] as number[],
      diceP2Stack: [] as number[],
      diceP1Saved: 0,
      diceP2Saved: 0,
      dicePlayers: { player1: "", player2: "" },
    };
  },
  mounted() {
    this.connectClient();
    // include diceUpdateTrigger so we can live-update only when visible
    this.init(this.clearTrigger, this.fadeTrigger, this.cutTrigger, this.timerTrigger, this.diceUpdateTrigger);
  },
  beforeUnmount() {
    if (this.timerInterval !== undefined) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  },
  computed: {
    diceP1Unsaved(): number {
      return this.diceP1Stack.reduce((a, b) => a + (Number(b) || 0), 0);
    },
    diceP2Unsaved(): number {
      return this.diceP2Stack.reduce((a, b) => a + (Number(b) || 0), 0);
    },
  },
  methods: {
    ...mapActions(useConnectionStore, ["connectClient"]),
    ...mapActions(useOverlayStore, ["init"]),

    // Only update existing dice overlays; never force-show them
    diceUpdateTrigger(payload: any) {
      if (!payload || !payload.data) return;
      const d = payload.data?.dice ?? {};
      const players = payload.data?.players ?? {};
      // Always keep names fresh
      this.dicePlayers = { player1: players.player1 || "", player2: players.player2 || "" };

      if (payload.player === "2") {
        if (!this.showDiceP2) return; // ignore if not visible
        const p2 = d.p2 || { saved: 0, stack: [] };
        this.diceP2Saved = Number(p2.saved || 0);
        this.diceP2Stack = Array.isArray(p2.stack) ? p2.stack.slice() : [];
      } else {
        if (!this.showDiceP1) return; // ignore if not visible
        const p1 = d.p1 || { saved: 0, stack: [] };
        this.diceP1Saved = Number(p1.saved || 0);
        this.diceP1Stack = Array.isArray(p1.stack) ? p1.stack.slice() : [];
      }
    },

    clearTrigger(result: any) {
      if (result.type === "question") {
        this.showQuestion = false;
        this.showQuestionResults = false;
        return;
      }
      if (result.type === "dice") {
        if (result.player === "2") this.showDiceP2 = false;
        else this.showDiceP1 = false;
        return;
      }
      if (result.type === "dice_totals") {
        this.showDiceTotals = false;
        return;
      }

      if (result.type == "name") {
        this.showInfo = false;
      } else if (result.type == "score") {
        this.showScore = false;
      } else if (result.type == "info") {
        this.showInfo = false;
      } else if (result.type == "game") {
        this.showGame = false;
      } else if (result.type == "total") {
        this.showScore = false;
        this.showInfo = false;
        this.animRunning = false;
        this.showVideoOverlay = false;
        this.showGame = false;
        this.showTransition = false;
        this.showTotal = false;
        try {
          clearTimeout(this.startTime);
        } catch (e) {}
        try {
          clearTimeout(this.endTime);
        } catch (e) {}
      } else if (result.type == "all") {
        this.showScore = false;
        this.showInfo = false;
      } else if (result.type == "livetimer") {
        this.showTimer = false;
      }
    },
    fadeTrigger(_result: any) {},

    cutTrigger(result: any) {
      if (result.type == "score") {
        this.player1 = parseInt(result.data.player1);
        this.player2 = parseInt(result.data.player2);
        this.total = parseInt(result.data.max_points);
        this.showScore = true;
        return;
      }
      if (result.type == "name") {
        this.info = result.data.title;
        this.showInfo = true;
        return;
      }
      if (result.type == "info") {
        this.info = result.data;
        this.showInfo = true;
        return;
      }
      if (result.type == "transition") {
        this.video = result.data.video;
        this.showTransition = true;
        return;
      }
      if (result.type == "game") {
        this.game = result.data.game;
        this.showGame = true;
        return;
      }
      if (result.type == "total") {
        if (this.animRunning) return;
        this.gamestate = result.data;
        this.showVideoOverlay = false;
        this.showTotal = true;
        this.showScore = false;
        this.showInfo = false;
        return;
      }
      if (result.type == "livetimer") {
        this.showTimer = true;
        return;
      }
      if (result.type == "question") {
        const idx = Number(result.index ?? 0);
        const q = result.data?.questions?.[idx];
        if (!q) return;
        this.questionText = q.text || "";
        const p1 = typeof q.p1 === "number" ? q.p1 : Number(q.p1 ?? 0);
        const p2 = typeof q.p2 === "number" ? q.p2 : Number(q.p2 ?? 0);
        if (isFinite(p1) && isFinite(p2) && p1 + p2 === 100) {
          this.qP1 = p1;
          this.qP2 = p2;
        } else {
          this.qP1 = isFinite(p1) ? p1 : 0;
          this.qP2 = 100 - this.qP1;
        }
        const players = result.data?.players ?? {};
        this.qLabel1 = q.label1 && q.label1.trim() ? q.label1 : players.player1 || "";
        this.qLabel2 = q.label2 && q.label2.trim() ? q.label2 : players.player2 || "";
        this.showQuestionResults = !!result.showResults;
        this.showQuestion = true;
        return;
      }
      if (result.type == "dice") {
        const d = result.data?.dice ?? {};
        const players = result.data?.players ?? {};
        // Always set names when any dice overlay is cued
        this.dicePlayers = { player1: players.player1 || "", player2: players.player2 || "" };

        if (result.player === "2") {
          const p2 = d.p2 || { saved: 0, stack: [] };
          this.diceP2Saved = Number(p2.saved || 0);
          this.diceP2Stack = Array.isArray(p2.stack) ? p2.stack.slice() : [];
          this.showDiceP2 = true;
        } else {
          const p1 = d.p1 || { saved: 0, stack: [] };
          this.diceP1Saved = Number(p1.saved || 0);
          this.diceP1Stack = Array.isArray(p1.stack) ? p1.stack.slice() : [];
          this.showDiceP1 = true;
        }
        return;
      }
      if (result.type == "dice_totals") {
        const d = result.data?.dice ?? {};
        const players = result.data?.players ?? {};
        // Names for the center totals
        this.dicePlayers = { player1: players.player1 || "", player2: players.player2 || "" };
        const p1 = d.p1 || { saved: 0 };
        const p2 = d.p2 || { saved: 0 };
        this.diceP1Saved = Number(p1.saved || 0);
        this.diceP2Saved = Number(p2.saved || 0);
        this.showDiceTotals = true;
        return;
      }
    },

    initVideoOverlay() {
      this.animRunning = true;
      this.startTime = setTimeout(() => {
        this.showVideoOverlay = true;
      }, 1800);
      this.endTime = setTimeout(() => {
        this.showVideoOverlay = false;
      }, 5400);
    },

    timerTrigger(data: any) {
      if (data.command === "setDirection") {
        this.timerUp = !!data.up;
        return;
      }
      if (this.timerInterval !== undefined) {
        clearInterval(this.timerInterval);
        this.timerInterval = undefined;
      }
      if (data.command === "start") {
        this.timerUp = !!data.up;
        this.timerInitial = (data.min || 0) * 60 + (data.sec || 0);
        this.timerCurrent = this.timerUp ? 0 : this.timerInitial;
        this.timerRunning = true;
        this.timerPaused = false;
        this.timerInterval = window.setInterval(this.updateTimer, 1000);
      }
      if (data.command === "pause") {
        this.timerPaused = true;
        this.timerRunning = false;
      }
      if (data.command === "resume") {
        if (!this.timerRunning && this.timerPaused) {
          this.timerPaused = false;
          this.timerRunning = true;
          this.timerInterval = window.setInterval(this.updateTimer, 1000);
        }
      }
      if (data.command === "stop") {
        this.timerPaused = false;
        this.timerRunning = false;
        this.timerCurrent = this.timerUp ? 0 : this.timerInitial;
      }
    },
    updateTimer() {
      if (!this.timerRunning || this.timerPaused) return;
      if (this.timerUp) {
        this.timerCurrent++;
        if (this.timerCurrent >= this.timerInitial) {
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

<style scoped>
* {
  font-family: "Montserrat", sans-serif;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
