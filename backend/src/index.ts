import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import { setupLaserMidi } from "./laser-midi-backend";

// === State-Funktionen ===
function get_data(): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile("./storage/save.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the JSON file:", err);
        reject();
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (e) {
        console.error("Error parsing the JSON file:", e);
        reject();
      }
    });
  });
}
function set_data(data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const updatedData = JSON.stringify(data, null, 2);
    fs.writeFile("./storage/save.json", updatedData, (err) => {
      if (err) {
        console.error(err);
        reject();
        return;
      }
      resolve();
    });
  });
}

type CutType =
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
  | "dice_totals";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// === Overlay/Manager WebSocket Events ===
io.on("connection", (socket) => {
  socket.on("getState", async () => {
    const save = await get_data();
    socket.emit("state", save);
  });

  socket.on("updateState", async (data: any) => {
    await set_data(data);
  });

  socket.on("clear", async (data: { type: CutType; scene: string; [k: string]: any }) => {
    console.log("CLEAR EVENT!", data);
    socket.broadcast.emit("clear", data);
  });

  socket.on("cut", async (data: { type: CutType; scene: string; [k: string]: any }) => {
    console.log("CUT EVENT!", data);
    const save = await get_data();

    // Take the scene payload and ALWAYS attach players so overlays have names available
    const sceneKey = data.scene;
    const rawSceneData = save?.[sceneKey] ?? {};
    const payloadData = {
      ...rawSceneData,
      players: save?.players, // <--- inject player names for all scenes (dice, dice_totals, question, etc.)
    };

    // Emit with the merged extras (e.g., { player: '1' } for dice)
    socket.broadcast.emit("cut", { ...data, data: payloadData });
  });

  socket.on("timer", (data: any) => {
    io.emit("timer", data);
  });

  // === Conditional dice overlay update (only refresh overlays if already visible) ===
  // Manager emits { scene: 'game5', player: '1' | '2' }
  socket.on("diceUpdate", async (data: { scene: string; player: "1" | "2" }) => {
    try {
      const save = await get_data();
      // Also inject players here so names update correctly during live edits
      io.emit("dice_update", {
        data: { ...(save?.[data.scene] ?? {}), players: save?.players },
        player: data.player,
      });
    } catch (e) {
      console.warn("diceUpdate failed to read state:", e);
    }
  });
});

// === Laser/MIDI backend logic ===
setupLaserMidi(io); // <--- Only does laser-specific stuff

// === Static Frontend/SPA Fallback ===
const frontend_path = path.dirname(process.cwd()) + "/frontend/dist/";
app.set("query parser", "extended");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options("*", cors());
app.use("/", express.static(frontend_path));

// SPA fallback for all except /api
app.get(/^\/(?!api).*/, function (req, res) {
  res.sendFile(frontend_path + "index.html");
});
app.get("/api", function (req, res) {
  res.send(frontend_path + "index.html");
});
app.get("/laser/*", function (req, res) {
  res.sendFile(frontend_path + "index.html");
});

server.listen(8080, () => {
  console.log("listening on *:8080");
});
