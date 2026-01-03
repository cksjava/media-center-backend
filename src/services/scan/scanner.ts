// src/services/scan/scanner.ts
import fg from "fast-glob";
import fs from "fs/promises";
import path from "path";
import PQueue from "p-queue";

import { Album, Artist, Composer, ScanState, Track } from "../../models/index.js";
import { readAudioMetadata } from "./metadata.js";
import { makeDedupeKey, norm } from "./dedupe.js";
import { storeCover } from "./coverStore.js";

type ScanResult = {
  roots: string[];
  extensions: string[];
  matchedFiles: number;
  scanned: number;
  indexed: number;
  updated: number;
  skipped: number;
  duplicates: number;
  errors: number;
  warnings: string[];
};

async function existsDir(p: string) {
  try {
    const st = await fs.stat(p);
    return st.isDirectory();
  } catch {
    return false;
  }
}

function normalizeExts(exts: string[]) {
  const cleaned = Array.from(
    new Set(
      (exts || [])
        .map((e) => String(e || "").trim())
        .filter(Boolean)
        .map((e) => (e.startsWith(".") ? e.slice(1) : e))
    )
  );

  // glob is case-sensitive → include both
  return Array.from(new Set(cleaned.flatMap((e) => [e.toLowerCase(), e.toUpperCase()])));
}

async function listAudioFilesForRoot(rootAbs: string, extensions: string[]) {
  const exts = normalizeExts(extensions);
  if (exts.length === 0) return [];

  const pattern = `**/*.{${exts.join(",")}}`;

  return fg([pattern], {
    cwd: rootAbs,
    onlyFiles: true,
    unique: true,
    absolute: true,
    dot: false,
    followSymbolicLinks: true,
    braceExpansion: true,
    extglob: true,
  });
}

/**
 * Decide whether an albumArtist string is "useful" for album identity.
 * We ignore common compilation markers so Bollywood/movie albums don't split.
 */
function canonicalAlbumArtistForIdentity(s: string | undefined | null) {
  const raw = String(s || "").trim();
  if (!raw) return "";

  const n = norm(raw);

  // treat these as "not useful for identity" so it falls back to title-only
  const ignored = new Set([
    norm("Various Artists"),
    norm("Various"),
    norm("VA"),
    norm("Soundtrack"),
    norm("Original Soundtrack"),
    norm("OST"),
  ]);

  if (ignored.has(n)) return "";
  return raw;
}

/**
 * Album identity strategy:
 * - Use album title + albumArtistId when albumArtist is reliable (e.g., Daft Punk).
 * - Fall back to title-only when albumArtist is empty/ignored (Bollywood/compilations).
 */
export async function scanRoots(rootsInput: string[], extensionsInput: string[]): Promise<ScanResult> {
  const roots = (rootsInput || [])
    .map((r) => String(r || "").trim())
    .filter(Boolean)
    .map((r) => path.resolve(r));

  const extensions = normalizeExts(extensionsInput || []);
  const warnings: string[] = [];

  const validRoots: string[] = [];
  for (const r of roots) {
    if (!(await existsDir(r))) {
      warnings.push(`Root not found or not a directory: ${r}`);
      continue;
    }
    validRoots.push(r);
  }

  const perRoot = await Promise.all(
    validRoots.map(async (root) => {
      try {
        const files = await listAudioFilesForRoot(root, extensions);
        return { root, files };
      } catch (e: any) {
        warnings.push(`Failed to glob root ${root}: ${e?.message || String(e)}`);
        return { root, files: [] as string[] };
      }
    })
  );

  const files = perRoot.flatMap((x) => x.files);

  console.log("[scan] roots (requested):", roots);
  console.log("[scan] roots (valid):", validRoots);
  console.log("[scan] extensions:", extensions);
  console.log(
    "[scan] per-root matches:",
    perRoot.map((x) => ({ root: x.root, count: x.files.length }))
  );
  console.log("[scan] matched files total:", files.length);
  console.log("[scan] sample:", files.slice(0, 5));

  const queue = new PQueue({ concurrency: 3 });

  let scanned = 0;
  let indexed = 0;
  let updated = 0;
  let skipped = 0;
  let duplicates = 0;
  let errors = 0;

  for (const filePath of files) {
    queue.add(async () => {
      try {
        scanned++;

        let st: any;
        try {
          st = await fs.stat(filePath);
        } catch {
          skipped++;
          warnings.push(`Cannot stat: ${filePath}`);
          return;
        }

        const existing = await Track.findOne({ where: { filePath } });

        // incremental skip
        if (
          existing &&
          Number(existing.fileMtimeMs) === Number(st.mtimeMs) &&
          Number(existing.fileSize) === Number(st.size)
        ) {
          skipped++;
          return;
        }

        const meta = await readAudioMetadata(filePath);

        const trackArtistName = meta.artist?.trim() || "Unknown Artist";
        const albumTitle = meta.album?.trim() || "Unknown Album";
        const title = meta.title?.trim() || path.basename(filePath);

        const dedupeKey = makeDedupeKey({
          artist: trackArtistName,
          album: albumTitle,
          title,
          trackNo: meta.trackNo,
          durationSec: meta.durationSec,
          fileSize: st.size,
        });

        // skip NEW duplicates by dedupeKey
        const other = await Track.findOne({ where: { dedupeKey } });
        if (other && (!existing || other.filePath !== existing.filePath)) {
          duplicates++;
          if (!existing) return;
        }

        // Track artist (varies per track; that's fine)
        const [trackArtist] = await Artist.findOrCreate({
          where: { nameNorm: norm(trackArtistName) },
          defaults: { name: trackArtistName, nameNorm: norm(trackArtistName) },
        });

        // Album-level artist used for identity when useful
        const albumArtistName = canonicalAlbumArtistForIdentity(meta.albumArtist);
        let albumArtistId: number | null = null;
        if (albumArtistName) {
          const [aa] = await Artist.findOrCreate({
            where: { nameNorm: norm(albumArtistName) },
            defaults: { name: albumArtistName, nameNorm: norm(albumArtistName) },
          });
          albumArtistId = aa.id;
        }

        // Cover art (optional)
        let coverPath: string | null = null;
        if (meta.cover) {
          try {
            coverPath = await storeCover(meta.cover);
          } catch (e: any) {
            warnings.push(`Cover store failed for ${filePath}: ${e?.message || String(e)}`);
          }
        }

        // ✅ Album identity:
        // - if albumArtistId exists -> (titleNorm + albumArtistId)
        // - else -> titleNorm only (Bollywood/compilations)
        const albumWhere: any = { titleNorm: norm(albumTitle) };
        if (albumArtistId) albumWhere.albumArtistId = albumArtistId;

        const [album] = await Album.findOrCreate({
          where: albumWhere,
          defaults: {
            title: albumTitle,
            titleNorm: norm(albumTitle),
            albumArtistId: albumArtistId ?? null,
            coverPath,
          },
        });

        // backfill album artist if previously null but we now have a good albumArtistId
        if (!album.albumArtistId && albumArtistId) {
          album.albumArtistId = albumArtistId;
          await album.save();
        }

        // backfill cover if missing
        if (!album.coverPath && coverPath) {
          album.coverPath = coverPath;
          await album.save();
        }

        // Composer (optional)
        let composerId: number | null = null;
        const composerName = meta.composer?.trim();
        if (composerName) {
          const [composer] = await Composer.findOrCreate({
            where: { nameNorm: norm(composerName) },
            defaults: { name: composerName, nameNorm: norm(composerName) },
          });
          composerId = composer.id;
        }

        const values = {
          filePath,
          fileMtimeMs: st.mtimeMs,
          fileSize: st.size,

          dedupeKey,

          title,
          titleNorm: norm(title),

          trackNo: meta.trackNo ?? null,
          discNo: meta.discNo ?? null,
          year: meta.year ?? null,
          durationSec: meta.durationSec ?? null,

          artistId: trackArtist.id,
          albumId: album.id,
          composerId,
        };

        if (!existing) {
          await Track.create(values as any);
          indexed++;
        } else {
          await existing.update(values as any);
          updated++;
        }
      } catch (e: any) {
        errors++;
        console.warn("[scan] failed:", filePath, e?.message || e);
      }
    });
  }

  await queue.onIdle();

  // Update scan state per root
  const now = new Date();
  for (const r of validRoots) {
    try {
      const [s] = await ScanState.findOrCreate({
        where: { root: r },
        defaults: { root: r, lastScanAt: now },
      });
      s.lastScanAt = now;
      await s.save();
    } catch (e: any) {
      warnings.push(`ScanState update failed for ${r}: ${e?.message || String(e)}`);
    }
  }

  return {
    roots: validRoots,
    extensions,
    matchedFiles: files.length,
    scanned,
    indexed,
    updated,
    skipped,
    duplicates,
    errors,
    warnings,
  };
}
