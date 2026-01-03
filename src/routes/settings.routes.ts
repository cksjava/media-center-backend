// src/routes/settings.routes.ts
import { Router } from "express";
import { Setting } from "../models/index.js";

export const settingsRouter = Router();

// Get all settings
settingsRouter.get("/", async (_req, res) => {
  const rows = await Setting.findAll({ order: [["name", "ASC"]] });
  res.json(rows);
});

// Get by name
settingsRouter.get("/:name", async (req, res) => {
  const name = String(req.params.name || "").trim();
  const row = await Setting.findByPk(name);
  res.json(row); // can be null; frontend handles it as []
});

// Create/update by name
settingsRouter.put("/:name", async (req, res) => {
  const name = String(req.params.name || "").trim();
  const value = req.body?.value != null ? String(req.body.value) : null;

  if (!name) {
    res.status(400).json({ ok: false, error: "Setting name is required" });
    return;
  }

  const [row] = await Setting.upsert(
    { name, value },
    { returning: true }
  );

  // Some SQLite setups don't return row from upsert; re-fetch to be safe
  const saved = await Setting.findByPk(name);
  res.json(saved);
});
