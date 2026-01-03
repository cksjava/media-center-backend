import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { env } from "../../config/env.js";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function storeCover(cover: { data: Uint8Array; mime: string }) {
  const ext = MIME_TO_EXT[cover.mime] ?? "img";
  const hash = crypto.createHash("sha1").update(cover.data).digest("hex");
  const fileName = `${hash}.${ext}`;
  const absDir = path.resolve(env.COVERS_DIR);
  const absPath = path.join(absDir, fileName);

  await fs.mkdir(absDir, { recursive: true });

  try {
    // if exists, do nothing
    await fs.access(absPath);
  } catch {
    await fs.writeFile(absPath, cover.data);
  }

  // This becomes accessible via express static "/covers"
  return fileName;
}
