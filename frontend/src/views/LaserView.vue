<template>
  <div class="min-h-screen bg-mga-slate">
    <div class="bg-mga-cyan w-full h-32 flex items-center px-4 shadow">
      <img src="/MGA_2025_Logo_SVG.svg" alt="Logo" class="h-20" />
    </div>

    <div class="flex flex-col items-center pt-8 pb-16">
      <h1 class="text-3xl font-black text-mga-cyan mb-8">Laser Scene Control</h1>

      <!-- Master Intensity + On/Off -->
      <div
        class="bg-mga-midnight rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-4 w-full max-w-md mb-6"
      >
        <label class="text-mga-white mb-2">Master Intensity</label>
        <input
          type="range"
          min="0"
          max="127"
          v-model.number="masterIntensity"
          class="w-3/4 accent-mga-cyan"
          @input="onIntensityChange"
          :disabled="editMode"
        />
        <div class="flex gap-3 w-full justify-between items-center">
          <span class="text-mga-white text-lg font-mono">{{ intensityPercent }}%</span>
          <button
            :class="[
              'px-5 py-2 rounded-xl font-bold transition w-32',
              laserOn
                ? 'bg-mga-yellow text-mga-midnight border-2 border-mga-yellow shadow animate-pulse'
                : 'bg-mga-slate text-mga-white border border-mga-yellow opacity-60',
            ]"
            @click="toggleLaser"
            :disabled="editMode"
          >
            {{ laserOn ? "Laser ON" : "Laser OFF" }}
          </button>
        </div>
      </div>

      <!-- Clear Scene -->
      <div class="w-full max-w-md flex justify-center my-3">
        <button
          :class="[
            'w-2/3 py-4 mb-3 rounded-2xl font-bold text-2xl shadow-xl transition',
            activeScene === SCENE_CLEAR
              ? 'bg-mga-red text-mga-white animate-pulse border-4 border-mga-yellow'
              : 'bg-mga-red text-mga-white border border-mga-white',
          ]"
          @click="activateScene(SCENE_CLEAR)"
          :disabled="editMode"
        >
          CLEAR Scene
        </button>
      </div>

      <!-- Scene Buttons -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full max-w-md mt-4">
        <template v-for="(scene, idx) in scenes" :key="scene.data1">
          <button
            v-if="!editMode"
            :class="[
              'py-4 rounded-xl font-bold text-lg shadow transition',
              activeScene === scene.data1
                ? 'bg-mga-cyan text-mga-midnight border-4 border-mga-yellow scale-105 animate-pulse'
                : 'bg-mga-midnight text-mga-cyan border border-mga-cyan hover:bg-mga-cyan hover:text-mga-midnight',
            ]"
            @click="activateScene(scene.data1)"
          >
            {{ sceneNames[idx] }}
          </button>
          <input
            v-else
            type="text"
            v-model="sceneNames[idx]"
            @change="updateSceneName(idx, sceneNames[idx])"
            class="py-3 rounded-xl font-bold text-lg text-mga-midnight text-center border-2 border-mga-cyan bg-mga-white shadow"
          />
        </template>
      </div>

      <!-- Edit Toggle -->
      <button
        class="mt-6 px-5 py-2 rounded-xl font-bold bg-mga-cyan text-mga-midnight shadow hover:bg-mga-yellow transition w-fit mx-auto"
        @click="editMode = !editMode"
      >
        {{ editMode ? "Finish Editing" : "Edit Scene Names" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { io } from "socket.io-client";
const socket = io();

// MIDI constants
const MASTER_CC = 48;
const MASTER_STATUS = 176;
const SCENE_STATUS = 144;
const SCENE_CLEAR = 37;

const masterIntensity = ref(127);
const intensityPercent = computed(() => Math.round((masterIntensity.value / 127) * 100));
const laserOn = ref(false);
const activeScene = ref<number>(SCENE_CLEAR);

const editMode = ref(false);

const sceneCount = 15;
const scenes = Array.from({ length: sceneCount }, (_, i) => ({
  data1: 38 + i,
}));

// Scene Names State
const sceneNames = ref<string[]>(Array.from({ length: sceneCount }, (_, i) => `Scene ${i + 1}`));

// Real-time UI State Sync
socket.on("laserRealtimeState", (realtime: any) => {
  // Only update if not in edit mode (prevents overwriting while editing)
  if (!editMode.value) {
    if (typeof realtime.laserOn === "boolean") laserOn.value = realtime.laserOn;
    if (typeof realtime.masterIntensity === "number") masterIntensity.value = realtime.masterIntensity;
    if (typeof realtime.activeScene === "number") activeScene.value = realtime.activeScene;
  }
});

// Scene Name (edit) Sync
function loadSceneNames() {
  socket.emit("getLaserState");
}
function saveSceneNames() {
  socket.emit("updateLaserState", { sceneNames: sceneNames.value });
}
socket.on("laserState", (data: any) => {
  if (data?.sceneNames && Array.isArray(data.sceneNames)) {
    // Only update if same length, otherwise fill in defaults
    if (data.sceneNames.length === sceneCount) {
      sceneNames.value = [...data.sceneNames];
    } else {
      for (let i = 0; i < sceneCount; i++) {
        sceneNames.value[i] = data.sceneNames[i] || `Scene ${i + 1}`;
      }
    }
  }
  // Accept real-time state from backend if present
  if (typeof data.laserOn === "boolean") laserOn.value = data.laserOn;
  if (typeof data.masterIntensity === "number") masterIntensity.value = data.masterIntensity;
  if (typeof data.activeScene === "number") activeScene.value = data.activeScene;
});

// On mount: load scene labels and subscribe to state
onMounted(() => {
  loadSceneNames();
  socket.emit("laserUpdate", {
    laserOn: laserOn.value,
    masterIntensity: masterIntensity.value,
    activeScene: activeScene.value,
  });
});

// Save when leaving edit mode
watch(editMode, (isEdit) => {
  if (!isEdit) saveSceneNames();
});

// User actions
function sendRealtimeState() {
  socket.emit("laserUpdate", {
    laserOn: laserOn.value,
    masterIntensity: masterIntensity.value,
    activeScene: activeScene.value,
  });
}

function toggleLaser() {
  laserOn.value = !laserOn.value;

  if (!laserOn.value) {
    // OFF: set intensity to 0 and recall CLEAR scene
    socket.emit("laser-midi", {
      status: MASTER_STATUS,
      data1: MASTER_CC,
      data2: 0,
    });
    socket.emit("laser-midi", {
      status: SCENE_STATUS,
      data1: SCENE_CLEAR,
      data2: 127,
    });
  } else {
    // ON: set intensity and recall current/selected scene
    socket.emit("laser-midi", {
      status: MASTER_STATUS,
      data1: MASTER_CC,
      data2: masterIntensity.value,
    });
    if (activeScene.value) {
      socket.emit("laser-midi", {
        status: SCENE_STATUS,
        data1: activeScene.value,
        data2: 127,
      });
    }
  }
  sendRealtimeState();
}

function onIntensityChange() {
  if (laserOn.value) {
    socket.emit("laser-midi", {
      status: MASTER_STATUS,
      data1: MASTER_CC,
      data2: masterIntensity.value,
    });
  }
  sendRealtimeState();
}

function activateScene(data1: number) {
  activeScene.value = data1;
  if (laserOn.value) {
    socket.emit("laser-midi", {
      status: SCENE_STATUS,
      data1,
      data2: 127,
    });
  }
  sendRealtimeState();
}

// Eediting of scene names
function updateSceneName(idx: number, newName: string) {
  sceneNames.value[idx] = newName;
}
</script>
