import { spawn, ChildProcess } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { env } from "../../config/env.js";
import { MpvClient } from "./mpvClient.js";

let mpvProc: ChildProcess | null = null;
let starting: Promise<void> | null = null;

function isProcessAlive(proc: ChildProcess | null) {
  return !!proc && proc.exitCode === null && !proc.killed;
}

async function waitForSocket(socketPath: string, timeoutMs = 3000) {
  const start = Date.now();

  while (!fsSync.existsSync(socketPath)) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`mpv IPC socket not created: ${socketPath}`);
    }
    await new Promise((r) => setTimeout(r, 50));
  }
}

export async function ensureMpv() {
  if (isProcessAlive(mpvProc)) return;

  // Avoid parallel spawns
  if (starting) {
    await starting;
    return;
  }

  starting = (async () => {
    const socketPath = env.MPV_SOCKET;
    const runtimeDir = path.dirname(socketPath);

    // Ensure user-owned runtime dir (NOT /tmp)
    await fs.mkdir(runtimeDir, { recursive: true });

    // Remove stale socket from previous crash
    if (fsSync.existsSync(socketPath)) {
      await fs.unlink(socketPath);
    }

    mpvProc = spawn(
      env.MPV_BIN,
      [
        "--idle=yes",
        "--no-terminal",
        "--audio-display=no",
        "--really-quiet",
        `--input-ipc-server=${socketPath}`,
      ],
      {
        stdio: ["ignore", "ignore", "ignore"],
        env: process.env,
      }
    );

    mpvProc.on("exit", () => {
      mpvProc = null;
    });

    // Wait until IPC socket is actually ready
    await waitForSocket(socketPath);
  })();

  try {
    await starting;
  } finally {
    starting = null;
  }
}

export async function mpv() {
  await ensureMpv();
  return new MpvClient(env.MPV_SOCKET);
}
