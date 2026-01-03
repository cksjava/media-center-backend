import { Router } from "express";
import { Favorite, Track } from "../models/index.js";

export const favouritesRouter = Router();

favouritesRouter.get("/", async (_req, res) => {
  const rows = await Favorite.findAll({
    order: [["createdAt", "DESC"]],
    include: [{ model: Track, as: "track" }],
  });
  res.json(rows);
});

favouritesRouter.post("/:trackId", async (req, res) => {
  const trackId = Number(req.params.trackId);
  const [row] = await Favorite.findOrCreate({ where: { trackId }, defaults: { trackId } });
  res.json(row);
});

favouritesRouter.delete("/:trackId", async (req, res) => {
  const trackId = Number(req.params.trackId);
  await Favorite.destroy({ where: { trackId } });
  res.json({ ok: true });
});
