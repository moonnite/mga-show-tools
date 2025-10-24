<template>
  <video
    v-if="showTransition"
    :src="video"
    class="absolute inset-0 z-40"
    autoplay
    @ended="showTransition = false"
  ></video>

  <video v-if="showGame" :src="game" class="absolute inset-0 z-10" autoplay @ended="showGame = false"></video>

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

  <Transition name="fade" mode="out-in">
    <div
      v-show="showInfo"
      class="absolute left-1/2 -translate-x-1/2 bottom-16 flex flex-row-reverse gap-2 py-5 px-12 bg-[#F63330] max-w-[66%] whitespace-pre-wrap overflow-hidden z-20"
    >
      <p class="text-white text-center font-black text-6xl">{{ info }}</p>
    </div>
  </Transition>

  <!-- Question (with optional results) -->
  <Transition name="fade" mode="out-in">
    <div
      v-if="showQuestion"
      class="absolute left-1/2 -translate-x-1/2 bottom-16 flex flex-col gap-3 py-5 px-12 bg-[#F63330] max-w-[70%] min-w-[48rem] whitespace-pre-wrap overflow-hidden z-30"
    >
      <p class="text-white text-center font-black text-5xl leading-tight">
        {{ questionText }}
      </p>
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

      // question overlay state
      showQuestion: false,
      showQuestionResults: false,
      questionText: "",
      qP1: 50,
      qP2: 50,
      qLabel1: "",
      qLabel2: "",
    };
  },
  mounted() {
    this.connectClient();
    this.init(this.clearTrigger, this.fadeTrigger, this.cutTrigger, this.timerTrigger);
  },
  beforeUnmount() {
    if (this.timerInterval !== undefined) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  },
  methods: {
    ...mapActions(useConnectionStore, ["connectClient"]),
    ...mapActions(useOverlayStore, ["init"]),
    clearTrigger(result: any) {
      // Make question hide atomically to avoid "flash"
      if (result.type === "question") {
        this.showQuestion = false;
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
    fadeTrigger(result: any) {},
    cutTrigger(result: any) {
      if (result.type == "score") {
        this.player1 = parseInt(result.data.player1);
        this.player2 = parseInt(result.data.player2);
        this.total = parseInt(result.data.max_points);
        this.showScore = true;
      } else if (result.type == "name") {
        this.info = result.data.title;
        this.showInfo = true;
      } else if (result.type == "info") {
        this.info = result.data;
        this.showInfo = true;
      } else if (result.type == "transition") {
        this.video = result.data.video;
        this.showTransition = true;
      } else if (result.type == "game") {
        this.game = result.data.game;
        this.showGame = true;
      } else if (result.type == "total") {
        if (this.animRunning) return;
        this.gamestate = result.data;
        this.showVideoOverlay = false;
        this.showTotal = true;
        this.showScore = false;
        this.showInfo = false;
      } else if (result.type == "livetimer") {
        this.showTimer = true;
      } else if (result.type == "question") {
        const idx = Number(result.index ?? 0);
        const q = result.data?.questions?.[idx];
        if (!q) return;

        // text
        this.questionText = q.text || "";

        // percentages (validate)
        const p1 = typeof q.p1 === "number" ? q.p1 : Number(q.p1 ?? 0);
        const p2 = typeof q.p2 === "number" ? q.p2 : Number(q.p2 ?? 0);
        if (isFinite(p1) && isFinite(p2) && p1 + p2 === 100) {
          this.qP1 = p1;
          this.qP2 = p2;
        } else {
          this.qP1 = isFinite(p1) ? p1 : 0;
          this.qP2 = 100 - this.qP1;
        }

        // labels with fallback to players
        const players = result.data?.players ?? {};
        this.qLabel1 = q.label1 && q.label1.trim() ? q.label1 : players.player1 || "";
        this.qLabel2 = q.label2 && q.label2.trim() ? q.label2 : players.player2 || "";

        // visibility
        this.showQuestionResults = !!result.showResults;
        this.showQuestion = true;
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
      if (data.command === "start") {
        this.timerUp = !!data.up;
        this.timerInitial = (data.min || 0) * 60 + (data.sec || 0);
        this.timerCurrent = this.timerUp ? 0 : this.timerInitial;
        this.timerRunning = true;
        this.timerPaused = false;
        if (this.timerInterval !== undefined) {
          clearInterval(this.timerInterval);
          this.timerInterval = undefined;
        }
        this.timerInterval = window.setInterval(this.updateTimer, 1000);
      }
      if (data.command === "pause") {
        this.timerPaused = true;
        this.timerRunning = false;
        if (this.timerInterval !== undefined) {
          clearInterval(this.timerInterval);
          this.timerInterval = undefined;
        }
      }
      if (data.command === "resume") {
        if (!this.timerRunning && this.timerPaused) {
          this.timerPaused = false;
          this.timerRunning = true;
          if (this.timerInterval !== undefined) {
            clearInterval(this.timerInterval);
            this.timerInterval = undefined;
          }
          this.timerInterval = window.setInterval(this.updateTimer, 1000);
        }
      }
      if (data.command === "stop") {
        this.timerPaused = false;
        this.timerRunning = false;
        if (this.timerInterval !== undefined) {
          clearInterval(this.timerInterval);
          this.timerInterval = undefined;
        }
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
