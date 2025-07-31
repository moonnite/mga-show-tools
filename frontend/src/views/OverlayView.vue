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
      console.log("CLEAR TRIGGER");
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
        console.log("CLEAR TRIGGER im OverlayView angekommen!");
        this.showTimer = false;
      }
    },
    fadeTrigger(result: any) {},
    cutTrigger(result: any) {
      console.log("CUT TRIGGER");
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
        console.log("CUT TRIGGER im OverlayView angekommen!");
        this.showTimer = true;
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
      // 1) Sofort Richtung umstellen, ohne das Intervall zu unterbrechen
      if (data.command === "setDirection") {
        this.timerUp = !!data.up;
        return;
      }

      // 2) Start-Logik
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

      // 3) Pause-Logik
      if (data.command === "pause") {
        this.timerPaused = true;
        this.timerRunning = false;
        if (this.timerInterval !== undefined) {
          clearInterval(this.timerInterval);
          this.timerInterval = undefined;
        }
      }

      // 4) Resume-Logik
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

      // 5) Stop-Logik
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
