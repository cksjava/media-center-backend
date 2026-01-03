import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(8787),
  SQLITE_PATH: z.string().default("./data/app.sqlite"),
  MPV_SOCKET: z.string().default("/tmp/mpv-media.sock"),
  MPV_BIN: z.string().default("mpv"),
  COVERS_DIR: z.string().default("./storage/covers"),
});

export const env = EnvSchema.parse(process.env);
