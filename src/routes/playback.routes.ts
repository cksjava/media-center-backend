import { Router } from "express";
import { Track } from "../models/index.js";
import { nextTrack, pause, prevTrack, setQueue, setVolume, stop } from "../services/playback/queueService.js";

export const playbackRouter = Router();

/**
 * Body:
 * {
 *   trackIds: number[],
 *   startIndex?: number,
 *   shuffle?: boolean
 * }
 */
playbackRouter.post("/queue", async (req, res) => {
  const trackIds: number[] = Array.isArray(req.body?.trackIds) ? req.body.trackIds.map(Number) : [];
  const startIndex = req.body?.startIndex ? Number(req.body.startIndex) : 0;
  const shuffle = !!req.body?.shuffle;

  const tracks = await Track.findAll({ where: { id: trackIds } });
  // preserve requested order
  const map = new Map(tracks.map((t) => [t.id, t]));
  const ordered = trackIds.map((id) => map.get(id)).filter(Boolean) as Track[];

  const filePaths = ordered.map((t) => t.filePath);
  const out = await setQueue(filePaths, startIndex, shuffle);
  res.json({ ok: true, ...out });
});

playbackRouter.post("/next", async (_req, res) => res.json(await nextTrack()));
playbackRouter.post("/prev", async (_req, res) => res.json(await prevTrack()));
playbackRouter.post("/pause", async (req, res) => res.json(await pause(!!req.body?.pause)));
playbackRouter.post("/stop", async (_req, res) => res.json(await stop()));
playbackRouter.post("/volume", async (req, res) => res.json(await setVolume(Number(req.body?.volume ?? 50))));
