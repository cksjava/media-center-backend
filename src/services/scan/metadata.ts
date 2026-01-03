// src/services/scan/metadata.ts
import * as mm from "music-metadata";

export type ParsedMeta = {
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  composer: string;

  trackNo: number | null;
  discNo: number | null;
  year: number | null;
  durationSec: number | null;

  cover?: {
    data: Uint8Array;
    mime: string;
  };
};

export async function readAudioMetadata(filePath: string): Promise<ParsedMeta> {
  const meta = await mm.parseFile(filePath, { duration: true });
  const common = meta.common;

  const title = common.title || "";
  const artist = common.artist || (common.artists?.[0] ?? "") || "";
  const album = common.album || "";
  const albumArtist = common.albumartist || "";
  const composer = (Array.isArray(common.composer) ? common.composer[0] : common.composer) || "";

  const trackNo = common.track?.no ?? null;
  const discNo = common.disk?.no ?? null;

  const year =
    typeof common.year === "number"
      ? common.year
      : typeof common.date === "string"
        ? Number(String(common.date).slice(0, 4)) || null
        : null;

  const durationSec = typeof meta.format.duration === "number" ? Math.round(meta.format.duration) : null;

  const pic = common.picture?.[0];
  const cover = pic?.data && pic?.format ? { data: pic.data, mime: pic.format } : undefined;

  return {
    title,
    artist,
    album,
    albumArtist,
    composer,
    trackNo,
    discNo,
    year,
    durationSec,
    cover,
  };
}
