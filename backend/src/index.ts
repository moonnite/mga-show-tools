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
      }
      const jsonData = JSON.parse(data);
      resolve(jsonData);
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
      }
      resolve();
    });
  });
}

type CutType = "all" | "name" | "score" | "info" | "total" | "transition" | "game" | "timer" | "livetimer";

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
    let save = await get_data();
    socket.emit("state", save);
  });
  socket.on("updateState", async (data: any) => {
    await set_data(data);
  });
  socket.on("clear", async (data: { type: CutType; scene: string }) => {
    console.log("CLEAR EVENT!", data);
    socket.broadcast.emit("clear", data);
  });
  socket.on("cut", async (data: { type: CutType; scene: string }) => {
    console.log("CUT EVENT!", data);
    let save = await get_data();
    save.total["players"] = save.players;
    socket.broadcast.emit("cut", { data: save[data.scene], type: data.type });
  });
  socket.on("timer", (data: any) => {
    io.emit("timer", data);
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
