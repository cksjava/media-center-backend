import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { apiRouter } from "./routes/index.js";
import { spawn, ChildProcess } from "child_process";
import fs from "fs";

// --------------------
// mpv bootstrap (IPC)
// --------------------

const MPV_RUNTIME_DIR = path.join(process.cwd(), ".runtime");
const MPV_SOCKET_PATH = path.join(MPV_RUNTIME_DIR, "mpv.sock");

let mpvProcess: ChildProcess | null = null;

function startMpv() {
  fs.mkdirSync(MPV_RUNTIME_DIR, { recursive: true });

  // remove stale socket if present
  if (fs.existsSync(MPV_SOCKET_PATH)) {
    fs.unlinkSync(MPV_SOCKET_PATH);
  }

  mpvProcess = spawn(
    "mpv",
    [
      "--idle=yes",
      "--no-terminal",
      "--audio-display=no",
      "--really-quiet",
      `--input-ipc-server=${MPV_SOCKET_PATH}`,
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    }
  );

  mpvProcess.on("exit", (code, sig) => {
    console.log("[mpv exited]", { code, sig });
    mpvProcess = null;
  });

  mpvProcess.stderr?.on("data", (d) => {
    console.log("[mpv]", String(d));
  });
}

// start mpv on server boot
startMpv();

// graceful shutdown
function shutdown() {
  console.log("Shutting down…");

  mpvProcess?.kill("SIGTERM");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// --------------------
// Express app
// --------------------

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use(
  "/covers",
  express.static(path.join(process.cwd(), "storage", "covers"), {
    etag: true,
    maxAge: "30d",
    immutable: true,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", apiRouter);

app.use(express.static(path.join(process.cwd(), "static")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "static", "index.html"));
});
