import { Server } from "socket.io";
import fs from "fs";
import path from "path";

// ==== MIDI Setup ====
let midiOut: any = null;
try {
  const Midi = require("midi");
  midiOut = new Midi.Output();
  // Use custom port name (must match LoopMIDI port name!)
  const portName = "MGA-Webtool-Laser";
  let found = false;
  for (let i = 0; i < midiOut.getPortCount(); i++) {
    if (midiOut.getPortName(i) === portName) {
      midiOut.openPort(i);
      found = true;
      console.log(`[MIDI] LoopMIDI-Port "${portName}" geöffnet!`);
      break;
    }
  }
  if (!found) {
    midiOut.openVirtualPort(portName);
    console.log(`[MIDI] Kein externer Port gefunden, virtueller Port erstellt: "${portName}"`);
  }
} catch (e: any) {
  console.warn("[MIDI] Modul nicht geladen – MIDI-Steuerung deaktiviert!", e?.message);
}

// ==== SCENE NAME STATE MANAGEMENT ====
const LASER_SAVE_PATH = path.resolve(__dirname, "../storage/laser_save.json");
const DEFAULT_SCENE_COUNT = 15;

function ensureLaserSave(): Promise<{ sceneNames: string[] }> {
  return new Promise((resolve) => {
    if (!fs.existsSync(LASER_SAVE_PATH)) {
      const defaultState = { sceneNames: Array.from({ length: DEFAULT_SCENE_COUNT }, (_, i) => `Scene ${i + 1}`) };
      fs.writeFileSync(LASER_SAVE_PATH, JSON.stringify(defaultState, null, 2));
      resolve(defaultState);
    } else {
      fs.readFile(LASER_SAVE_PATH, "utf8", (err, data) => {
        if (err || !data) {
          const defaultState = { sceneNames: Array.from({ length: DEFAULT_SCENE_COUNT }, (_, i) => `Scene ${i + 1}`) };
          fs.writeFileSync(LASER_SAVE_PATH, JSON.stringify(defaultState, null, 2));
          resolve(defaultState);
        } else {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.sceneNames || parsed.sceneNames.length !== DEFAULT_SCENE_COUNT) {
              parsed.sceneNames = Array.from(
                { length: DEFAULT_SCENE_COUNT },
                (_, i) => parsed.sceneNames?.[i] || `Scene ${i + 1}`
              );
              fs.writeFileSync(LASER_SAVE_PATH, JSON.stringify(parsed, null, 2));
            }
            resolve(parsed);
          } catch {
            const defaultState = {
              sceneNames: Array.from({ length: DEFAULT_SCENE_COUNT }, (_, i) => `Scene ${i + 1}`),
            };
            fs.writeFileSync(LASER_SAVE_PATH, JSON.stringify(defaultState, null, 2));
            resolve(defaultState);
          }
        }
      });
    }
  });
}
function setLaserState(newState: any): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(LASER_SAVE_PATH, JSON.stringify(newState, null, 2), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// ==== REALTIME UI STATE ====
// Shared realtime state for all UI clients:
interface LaserRealtimeState {
  laserOn: boolean;
  masterIntensity: number;
  activeScene: number;
}
const DEFAULT_REALTIME_STATE: LaserRealtimeState = {
  laserOn: false,
  masterIntensity: 127,
  activeScene: 37,
};
let laserRealtimeState: LaserRealtimeState = { ...DEFAULT_REALTIME_STATE };

// ==== WEBSOCKET API ====
export function setupLaserMidi(io: Server) {
  io.on("connection", (socket) => {
    // MIDI COMMANDS
    socket.on("laser-midi", (msg: { status: number; data1: number; data2: number }) => {
      console.log("[MIDI] Laser-Message", msg);
      if (midiOut) {
        midiOut.sendMessage([msg.status, msg.data1, msg.data2]);
      }
    });

    // === UI STATE API ===
    // Send latest UI state on connect
    socket.emit("laserRealtimeState", laserRealtimeState);

    // Client requests the full state (scene names + UI state)
    socket.on("getLaserState", async () => {
      const state = await ensureLaserSave();
      // Send both scene names AND UI state in one go
      socket.emit("laserState", { ...state, ...laserRealtimeState });
    });

    // Scene name edit API
    socket.on("updateLaserState", async (data: any) => {
      await setLaserState({ sceneNames: data.sceneNames });
      io.emit("laserState", { ...data, ...laserRealtimeState });
    });

    // === REALTIME STATE UPDATE ===
    socket.on("laserUpdate", (realtime: LaserRealtimeState) => {
      laserRealtimeState = { ...laserRealtimeState, ...realtime };
      io.emit("laserRealtimeState", laserRealtimeState);
    });
  });
}
