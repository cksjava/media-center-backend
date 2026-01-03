import { Op } from "sequelize";
import { Album, Artist, Composer, Track } from "../models/index.js";
import { norm } from "./scan/dedupe.js";

export async function searchAll(qRaw: string, limit = 50, offset = 0) {
  const q = norm(qRaw);
  if (!q) return { tracks: [], albums: [], artists: [], composers: [] };

  const like = `%${q}%`;

  const [tracks, albums, artists, composers] = await Promise.all([
    Track.findAll({
      where: { titleNorm: { [Op.like]: like } },
      include: [
        { model: Artist, as: "artist" },
        { model: Album, as: "album" },
        { model: Composer, as: "composer" },
      ],
      limit,
      offset,
      order: [["titleNorm", "ASC"]],
    }),
    Album.findAll({ where: { titleNorm: { [Op.like]: like } }, limit, offset }),
    Artist.findAll({ where: { nameNorm: { [Op.like]: like } }, limit, offset }),
    Composer.findAll({ where: { nameNorm: { [Op.like]: like } }, limit, offset }),
  ]);

  return { tracks, albums, artists, composers };
}
