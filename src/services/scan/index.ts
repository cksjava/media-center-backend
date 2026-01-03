// src/services/scan/index.ts
import { scanRoots } from "./scanner.js";

export type ScanStatus = {
  running: boolean;
  startedAt?: number;
  finishedAt?: number;
  result?: any;
  error?: string;
};

let current: ScanStatus | null = null;

export function getScanStatus(): ScanStatus {
  return current ?? { running: false };
}

export function startScan(opts: { roots: string[]; extensions: string[] }) {
  if (current?.running) return current;

  current = { running: true, startedAt: Date.now() };

  (async () => {
    try {
      const result = await scanRoots(opts.roots, opts.extensions);
      current = { running: false, startedAt: current!.startedAt, finishedAt: Date.now(), result };
    } catch (e: any) {
      current = {
        running: false,
        startedAt: current!.startedAt,
        finishedAt: Date.now(),
        error: e?.message || "Scan failed",
      };
    }
  })();

  return current;
}
