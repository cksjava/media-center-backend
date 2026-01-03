// src/routes/library.routes.ts
import { Router } from "express";
import { Album, Artist, Composer, Setting, Track } from "../models/index.js";
import { getScanStatus, startScan } from "../services/scan/index.js";

export const libraryRouter = Router();

function parseJsonArray(s: string | null, fallback: string[]) {
  if (!s) return fallback;
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : fallback;
  } catch {
    return fallback;
  }
}

libraryRouter.post("/scan", async (_req, res) => {
  const rootsSetting = await Setting.findByPk("library.scan.roots");
  const roots = parseJsonArray(rootsSetting?.value ?? null, []);

  const extsSetting = await Setting.findByPk("library.scan.extensions");
  const extensions = parseJsonArray(extsSetting?.value ?? null, ["m4a"]);

  const status = startScan({ roots, extensions });
  res.json(status);
});

libraryRouter.get("/scan/status", async (_req, res) => {
  res.json(getScanStatus());
});

// Tracks
libraryRouter.get("/tracks", async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const offset = req.query.offset ? Number(req.query.offset) : 0;

  const rows = await Track.findAll({
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
  });

  res.json(rows);
});

// Artists
libraryRouter.get("/artists", async (_req, res) => {
  const rows = await Artist.findAll({ order: [["nameNorm", "ASC"]] });
  res.json(rows);
});

// Albums
libraryRouter.get("/albums", async (_req, res) => {
  const rows = await Album.findAll({ order: [["titleNorm", "ASC"]] });
  res.json(rows);
});

// Albums
libraryRouter.get("/albums/:albumId", async (req, res) => {
  const albumId = Number(req.params.albumId);
  const rows = await Album.findOne({ where: { id: albumId }, order: [["titleNorm", "ASC"]], include: [ { model: Artist, as: "albumArtist" } ] });
  res.json(rows);
});

// Album tracks
libraryRouter.get("/albums/:albumId/tracks", async (req, res) => {
  const albumId = Number(req.params.albumId);
  const rows = await Track.findAll({
    where: { albumId },
    order: [["discNo", "ASC"], ["trackNo", "ASC"], ["titleNorm", "ASC"]],
    include: [{ model: Artist, as: "artist" }, { model: Album, as: "album" }, { model: Composer, as: "composer" }]
  });
  res.json(rows);
});
