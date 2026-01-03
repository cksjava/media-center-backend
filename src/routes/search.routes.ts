import { Router } from "express";
import { searchAll } from "../services/searchService.js";

export const searchRouter = Router();

searchRouter.get("/", async (req, res) => {
  const q = String(req.query.q ?? "");
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const offset = req.query.offset ? Number(req.query.offset) : 0;

  const out = await searchAll(q, limit, offset);
  res.json(out);
});
