import { Router } from "express";
import { Playlist, PlaylistItem, Track } from "../models/index.js";

export const playlistsRouter = Router();

playlistsRouter.get("/", async (_req, res) => {
  const rows = await Playlist.findAll({ order: [["name", "ASC"]] });
  res.json(rows);
});

playlistsRouter.post("/", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name) return res.status(400).json({ ok: false, error: "name required" });
  const row = await Playlist.create({ name });
  res.json(row);
});

playlistsRouter.post("/:id/items", async (req, res) => {
  const playlistId = Number(req.params.id);
  const trackId = Number(req.body?.trackId);
  if (!trackId) return res.status(400).json({ ok: false, error: "trackId required" });

  const count = await PlaylistItem.count({ where: { playlistId } });
  const item = await PlaylistItem.create({ playlistId, trackId, position: count });
  res.json(item);
});

playlistsRouter.get("/:id/items", async (req, res) => {
  const playlistId = Number(req.params.id);
  const items = await PlaylistItem.findAll({
    where: { playlistId },
    order: [["position", "ASC"]],
    include: [{ model: Track, as: "track" }],
  });
  res.json(items);
});
