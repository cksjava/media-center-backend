import crypto from "crypto";

export function norm(s: unknown): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Dedupe strategy:
 * - If tags are stable: use normalized artist + album + title + trackNo + duration (rounded)
 * - Add file size as a tie-breaker
 *
 * This catches “same song duplicated in different folders” reasonably well.
 * (If you want stronger dedupe later: add audio fingerprinting like Chromaprint/AcoustID.)
 */
export function makeDedupeKey(input: {
  artist: string;
  album: string;
  title: string;
  trackNo?: number | null;
  durationSec?: number | null;
  fileSize: number;
}) {
  const core = [
    norm(input.artist),
    norm(input.album),
    norm(input.title),
    String(input.trackNo ?? ""),
    String(input.durationSec ? Math.round(input.durationSec) : ""),
    String(input.fileSize),
  ].join("|");

  return crypto.createHash("sha256").update(core).digest("hex");
}
